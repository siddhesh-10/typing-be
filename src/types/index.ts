// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  country: string;
  joinDate: string;
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  totalAccuracy: number;
  rank?: number;
  isOnline: boolean;
  lastActive: string;
  cognitoId?: string;
}

export interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  totalTimeTyping: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  percentile: number;
}

// Typing Session Types
export interface TypingSession {
  id: string;
  userId: string;
  text: string;
  words: string[];
  startTime: string;
  endTime?: string;
  duration: number;
  wpm: number;
  accuracy: number;
  errors: number;
  totalWords: number;
  completedWords: number;
  isCompleted: boolean;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypingText {
  id: string;
  text: string;
  words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  language: string;
  source?: string;
  wordCount: number;
  estimatedTime: number;
  createdAt: string;
}

export interface TypingError {
  position: number;
  expected: string;
  actual: string;
  timestamp: string;
}

export interface TypingProgress {
  currentWordIndex: number;
  currentCharIndex: number;
  completedWords: number;
  errors: TypingError[];
  startTime: string;
  isActive: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  user: User;
  wpm: number;
  accuracy: number;
  date: string;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  type: 'global' | 'country';
  country?: string;
}

export interface CountryLeaderboard {
  country: string;
  entries: LeaderboardEntry[];
  totalUsers: number;
  averageWpm: number;
}

export interface GlobalLeaderboard {
  entries: LeaderboardEntry[];
  totalUsers: number;
  averageWpm: number;
  lastUpdated: string;
}

// Challenge Types
export interface Challenge {
  id: string;
  challengerId: string;
  challenger: User;
  opponentId: string;
  opponent: User;
  status: 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed';
  text: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  winner?: string;
  challengerResult?: TypingSession;
  opponentResult?: TypingSession;
}

export interface TypingChallenge {
  id: string;
  challengerId: string;
  opponentId: string;
  status: 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

// AI Practice Types
export interface AISession {
  id: string;
  userId: string;
  aiLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  text: string;
  startTime: string;
  endTime?: string;
  userResult?: TypingSession;
  aiResult?: TypingSession;
  aiWpm: number;
  aiAccuracy: number;
  userWpm: number;
  userAccuracy: number;
  winner?: 'user' | 'ai' | 'tie';
  createdAt: string;
  updatedAt: string;
}

// WebSocket Types
export interface WebSocketConnection {
  connectionId: string;
  userId: string;
  connectedAt: string;
  lastSeen: string;
}

export interface WebSocketMessage {
  action: string;
  data: any;
  timestamp: string;
}

export interface ChallengeInvite {
  challengeId: string;
  challenger: User;
  difficulty: string;
  timeLimit?: number;
}

export interface ChallengeResponse {
  challengeId: string;
  accepted: boolean;
  opponent: User;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  progress: number;
  wpm: number;
  accuracy: number;
}

export interface ChallengeResult {
  challengeId: string;
  winner: string;
  challengerResult: TypingSession;
  opponentResult: TypingSession;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateUserRequest {
  username: string;
  email: string;
  country: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  username?: string;
  avatar?: string;
  country?: string;
}

export interface CreateSessionRequest {
  textId: string;
  mode: 'practice' | 'challenge' | 'ai';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  timeLimit?: number;
}

export interface UpdateSessionRequest {
  endTime: string;
  duration: number;
  wpm: number;
  accuracy: number;
  errors: number;
  completedWords: number;
  isCompleted: boolean;
}

export interface CreateChallengeRequest {
  opponentId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timeLimit?: number;
}

export interface CreateAISessionRequest {
  aiLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
}

// Auth Types
export interface AuthContext {
  userId: string;
  username: string;
  email: string;
  cognitoId: string;
}

export interface CognitoUser {
  sub: string;
  email: string;
  username: string;
  attributes: {
    sub: string;
    email: string;
    username: string;
    locale?: string;
    created_at: string;
  };
}

// Environment Types
export interface Environment {
  STAGE: string;
  REGION: string;
  USER_POOL_ID: string;
  USER_POOL_CLIENT_ID: string;
  TYPING_TEXTS_TABLE: string;
  USERS_TABLE: string;
  SESSIONS_TABLE: string;
  LEADERBOARD_TABLE: string;
  CHALLENGES_TABLE: string;
  AI_SESSIONS_TABLE: string;
  WEBSOCKET_CONNECTIONS_TABLE: string;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS: string;
  LOG_LEVEL: string;
} 