import { GoogleGenerativeAI } from '@google/generative-ai';
import { TypingText, AISession } from '../types';
import logger from '../utils/logger';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateText(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    category: string,
    wordCount: number = 50
  ): Promise<TypingText> {
    return this.generateTypingText(difficulty, category, wordCount);
  }

  async createAISession(
    userId: string,
    aiLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    category?: string
  ): Promise<AISession> {
    const text = await this.generateTypingText(difficulty, category || 'general', 50);
    const aiPerformance = await this.generateAIOpponent(aiLevel, difficulty);
    
    const session: AISession = {
      id: this.generateId(),
      userId,
      aiLevel,
      text: text.text,
      startTime: new Date().toISOString(),
      aiWpm: aiPerformance.wpm,
      aiAccuracy: aiPerformance.accuracy,
      userWpm: 0,
      userAccuracy: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return session;
  }

  async generateFeedback(
    session: AISession,
    userWpm: number,
    userAccuracy: number
  ): Promise<{ feedback: string; suggestions: string[] }> {
    return this.analyzeUserPerformance(session, userWpm, userAccuracy);
  }

  async generateTypingText(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    category: string,
    wordCount: number = 50
  ): Promise<TypingText> {
    try {
      const prompt = this.buildTextGenerationPrompt(difficulty, category, wordCount);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean and process the generated text
      const cleanedText = this.cleanGeneratedText(text);
      const words = cleanedText.split(' ').filter(word => word.length > 0);
      
      // Ensure we have the requested word count
      const finalWords = words.slice(0, wordCount);
      const finalText = finalWords.join(' ');

      const typingText: TypingText = {
        id: this.generateId(),
        text: finalText,
        words: finalWords,
        category,
        difficulty,
        language: 'en',
        wordCount: finalWords.length,
        estimatedTime: Math.ceil(finalWords.length / 40), // Assume 40 WPM average
        createdAt: new Date().toISOString()
      };

      logger.info('Generated typing text', { difficulty, category, wordCount: finalWords.length });
      return typingText;
    } catch (error) {
      logger.error('Failed to generate typing text', { difficulty, category, error });
      throw new Error(`Failed to generate typing text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateAIOpponent(
    userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<{ wpm: number; accuracy: number }> {
    try {
      // Generate AI opponent performance based on user level and difficulty
      const baseWpm = this.getBaseWpm(userLevel);
      const baseAccuracy = this.getBaseAccuracy(userLevel);
      
      // Add some randomness to make it more realistic
      const wpmVariation = Math.random() * 20 - 10; // ±10 WPM
      const accuracyVariation = Math.random() * 10 - 5; // ±5% accuracy
      
      const wpm = Math.max(10, Math.min(200, baseWpm + wpmVariation));
      const accuracy = Math.max(70, Math.min(100, baseAccuracy + accuracyVariation));

      return { wpm: Math.round(wpm), accuracy: Math.round(accuracy) };
    } catch (error) {
      logger.error('Failed to generate AI opponent', { userLevel, difficulty, error });
      throw new Error(`Failed to generate AI opponent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeUserPerformance(
    session: AISession,
    userWpm: number,
    userAccuracy: number
  ): Promise<{ feedback: string; suggestions: string[] }> {
    try {
      const prompt = this.buildPerformanceAnalysisPrompt(session, userWpm, userAccuracy);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      // Parse the analysis to extract feedback and suggestions
      const feedback = this.extractFeedback(analysis);
      const suggestions = this.extractSuggestions(analysis);

      return { feedback, suggestions };
    } catch (error) {
      logger.error('Failed to analyze user performance', { sessionId: session.id, error });
      return {
        feedback: 'Keep practicing to improve your typing speed and accuracy!',
        suggestions: ['Practice regularly', 'Focus on accuracy over speed', 'Use proper finger positioning']
      };
    }
  }

  async generatePersonalizedChallenge(
    userId: string,
    userStats: { averageWpm: number; averageAccuracy: number; bestWpm: number },
    previousSessions: AISession[]
  ): Promise<TypingText> {
    try {
      // Analyze user's performance pattern
      const performanceTrend = this.analyzePerformanceTrend(previousSessions);
      const targetWpm = this.calculateTargetWpm(userStats, performanceTrend);
      
      // Generate appropriate difficulty and category
      const difficulty = this.determineOptimalDifficulty(userStats, performanceTrend);
      const category = this.selectCategory(previousSessions);
      
      // Generate text with specific target WPM in mind
      const wordCount = Math.ceil(targetWpm * 2); // 2 minutes of typing
      
      return await this.generateTypingText(difficulty, category, wordCount);
    } catch (error) {
      logger.error('Failed to generate personalized challenge', { userId, error });
      // Fallback to medium difficulty general text
      return await this.generateTypingText('medium', 'general', 50);
    }
  }

  private buildTextGenerationPrompt(
    difficulty: string,
    category: string,
    wordCount: number
  ): string {
    return `Generate a ${difficulty} difficulty typing text in the ${category} category with exactly ${wordCount} words. 
    
    Requirements:
    - Use natural, flowing language
    - Avoid repetitive words
    - Include a mix of short and long words
    - Make it engaging and interesting
    - Ensure proper grammar and punctuation
    - No special characters or numbers unless necessary
    - Return only the text, no explanations or formatting
    
    Category context:
    - General: Everyday topics, common vocabulary
    - Technology: Tech-related content, modern terms
    - Literature: Literary excerpts, descriptive language
    - News: Current events, factual content
    - Quotes: Famous quotes and sayings
    - Code: Programming concepts and terminology`;
  }

  private buildPerformanceAnalysisPrompt(
    session: AISession,
    userWpm: number,
    userAccuracy: number
  ): string {
    return `Analyze this typing performance and provide constructive feedback:
    
    User Performance:
    - WPM: ${userWpm}
    - Accuracy: ${userAccuracy}%
    - AI Level: ${session.aiLevel}
    - Difficulty: ${session.aiResult?.difficulty ?? 'medium'}
    
    Provide:
    1. A brief encouraging feedback (1-2 sentences)
    2. 3 specific suggestions for improvement
    
    Format the response as:
    FEEDBACK: [your feedback here]
    SUGGESTIONS:
    - [suggestion 1]
    - [suggestion 2]
    - [suggestion 3]`;
  }

  private cleanGeneratedText(text: string): string {
    return text
      .replace(/^["']|["']$/g, '') // Remove quotes at start/end
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private extractFeedback(analysis: string): string {
    const feedbackMatch = analysis.match(/FEEDBACK:\s*(.+?)(?:\n|$)/i);
    return feedbackMatch && feedbackMatch[1] ? feedbackMatch[1].trim() : 'Keep practicing to improve your typing skills!';
  }

  private extractSuggestions(analysis: string): string[] {
    const suggestions: string[] = [];
    const suggestionMatches = analysis.match(/- (.+?)(?:\n|$)/g);
    
    if (suggestionMatches) {
      suggestions.push(...suggestionMatches.map(match => match.replace('- ', '').trim()));
    }
    
    // Fallback suggestions if parsing fails
    if (suggestions.length === 0) {
      suggestions.push(
        'Practice regularly to build muscle memory',
        'Focus on accuracy before increasing speed',
        'Use proper finger positioning on the keyboard'
      );
    }
    
    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  private getBaseWpm(level: string): number {
    const baseWpmMap: Record<string, number> = {
      beginner: 30,
      intermediate: 60,
      advanced: 90,
      expert: 120
    };
    return baseWpmMap[level] || 60;
  }

  private getBaseAccuracy(level: string): number {
    const baseAccuracyMap: Record<string, number> = {
      beginner: 85,
      intermediate: 90,
      advanced: 95,
      expert: 98
    };
    return baseAccuracyMap[level] || 90;
  }

  private analyzePerformanceTrend(sessions: AISession[]): 'improving' | 'declining' | 'stable' {
    if (sessions.length < 3) return 'stable';
    
    const recentSessions = sessions.slice(-3);
    const wpmTrend = recentSessions.map(s => s.userWpm || 0);
    
    if (wpmTrend[2] && wpmTrend[0] && wpmTrend[2] > wpmTrend[0] + 5) return 'improving';
    if (wpmTrend[2] && wpmTrend[0] && wpmTrend[2] < wpmTrend[0] - 5) return 'declining';
    return 'stable';
  }

  private calculateTargetWpm(
    userStats: { averageWpm: number; averageAccuracy: number; bestWpm: number },
    _trend: string
  ): number {
    let targetWpm = userStats.averageWpm;
    
    // For now, keep it simple without trend analysis
    return Math.min(targetWpm, userStats.bestWpm + 10);
  }

  private determineOptimalDifficulty(
    userStats: { averageWpm: number; averageAccuracy: number; bestWpm: number },
    _trend: string
  ): 'easy' | 'medium' | 'hard' | 'expert' {
    if (userStats.averageWpm < 40) return 'easy';
    if (userStats.averageWpm < 70) return 'medium';
    if (userStats.averageWpm < 100) return 'hard';
    return 'expert';
  }

  private selectCategory(_previousSessions: AISession[]): string {
    const categories = ['general', 'technology', 'literature', 'news', 'quotes'];
    
    // For now, return a random category
    return categories[Math.floor(Math.random() * categories.length)] || 'general';
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 