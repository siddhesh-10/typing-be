const { TextService } = require('../../services/text.js');

const textService = new TextService();

// Sample typing texts data - you can expand this or load from a file
const sampleTexts = [
  {
    text: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. Pangrams are often used to display font samples and test keyboards.",
    words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "This", "pangram", "contains", "every", "letter", "of", "the", "alphabet", "at", "least", "once", "Pangrams", "are", "often", "used", "to", "display", "font", "samples", "and", "test", "keyboards"],
    category: "general",
    difficulty: "easy",
    language: "en",
    source: "Traditional pangram",
    wordCount: 31,
    estimatedTime: 1
  },
  {
    text: "Programming is the art of telling another human being what one wants the computer to do. It requires logical thinking, problem-solving skills, and attention to detail. Every line of code must be written with precision and care.",
    words: ["Programming", "is", "the", "art", "of", "telling", "another", "human", "being", "what", "one", "wants", "the", "computer", "to", "do", "It", "requires", "logical", "thinking", "problem-solving", "skills", "and", "attention", "to", "detail", "Every", "line", "of", "code", "must", "be", "written", "with", "precision", "and", "care"],
    category: "technology",
    difficulty: "medium",
    language: "en",
    source: "Programming wisdom",
    wordCount: 36,
    estimatedTime: 2
  },
  {
    text: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.",
    words: ["In", "a", "hole", "in", "the", "ground", "there", "lived", "a", "hobbit", "Not", "a", "nasty", "dirty", "wet", "hole", "filled", "with", "the", "ends", "of", "worms", "and", "an", "oozy", "smell", "nor", "yet", "a", "dry", "bare", "sandy", "hole", "with", "nothing", "in", "it", "to", "sit", "down", "on", "or", "to", "eat", "it", "was", "a", "hobbit-hole", "and", "that", "means", "comfort"],
    category: "literature",
    difficulty: "medium",
    language: "en",
    source: "The Hobbit by J.R.R. Tolkien",
    wordCount: 54,
    estimatedTime: 3
  },
  {
    text: "Artificial intelligence is transforming the way we live and work. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions. This technology is being applied across industries from healthcare to finance.",
    words: ["Artificial", "intelligence", "is", "transforming", "the", "way", "we", "live", "and", "work", "Machine", "learning", "algorithms", "can", "now", "process", "vast", "amounts", "of", "data", "to", "identify", "patterns", "and", "make", "predictions", "This", "technology", "is", "being", "applied", "across", "industries", "from", "healthcare", "to", "finance"],
    category: "technology",
    difficulty: "hard",
    language: "en",
    source: "AI technology overview",
    wordCount: 37,
    estimatedTime: 2
  },
  {
    text: "The beauty of nature lies in its simplicity and complexity. From the smallest flower to the tallest mountain, every element plays a vital role in the ecosystem. We must protect and preserve this delicate balance for future generations.",
    words: ["The", "beauty", "of", "nature", "lies", "in", "its", "simplicity", "and", "complexity", "From", "the", "smallest", "flower", "to", "the", "tallest", "mountain", "every", "element", "plays", "a", "vital", "role", "in", "the", "ecosystem", "We", "must", "protect", "and", "preserve", "this", "delicate", "balance", "for", "future", "generations"],
    category: "nature",
    difficulty: "medium",
    language: "en",
    source: "Nature conservation",
    wordCount: 38,
    estimatedTime: 2
  },
  {
    text: "Philosophy is the love of wisdom. It seeks to understand the fundamental nature of reality, existence, and knowledge. Through critical thinking and rational inquiry, philosophers explore questions that have puzzled humanity for centuries.",
    words: ["Philosophy", "is", "the", "love", "of", "wisdom", "It", "seeks", "to", "understand", "the", "fundamental", "nature", "of", "reality", "existence", "and", "knowledge", "Through", "critical", "thinking", "and", "rational", "inquiry", "philosophers", "explore", "questions", "that", "have", "puzzled", "humanity", "for", "centuries"],
    category: "philosophy",
    difficulty: "hard",
    language: "en",
    source: "Philosophy introduction",
    wordCount: 35,
    estimatedTime: 2
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world. Knowledge empowers individuals to think critically, solve problems, and contribute meaningfully to society. Learning is a lifelong journey that never truly ends.",
    words: ["Education", "is", "the", "most", "powerful", "weapon", "which", "you", "can", "use", "to", "change", "the", "world", "Knowledge", "empowers", "individuals", "to", "think", "critically", "solve", "problems", "and", "contribute", "meaningfully", "to", "society", "Learning", "is", "a", "lifelong", "journey", "that", "never", "truly", "ends"],
    category: "education",
    difficulty: "medium",
    language: "en",
    source: "Education philosophy",
    wordCount: 45,
    estimatedTime: 3
  },
  {
    text: "The universe is a vast and mysterious place, filled with countless galaxies, stars, and planets. Scientists continue to explore its depths, discovering new phenomena that challenge our understanding of space, time, and the fundamental laws of physics.",
    words: ["The", "universe", "is", "a", "vast", "and", "mysterious", "place", "filled", "with", "countless", "galaxies", "stars", "and", "planets", "Scientists", "continue", "to", "explore", "its", "depths", "discovering", "new", "phenomena", "that", "challenge", "our", "understanding", "of", "space", "time", "and", "the", "fundamental", "laws", "of", "physics"],
    category: "science",
    difficulty: "expert",
    language: "en",
    source: "Astronomy overview",
    wordCount: 39,
    estimatedTime: 3
  }
];

// Generate additional random texts for variety
function generateRandomText(difficulty, category) {
  const words = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
  ];
  
  let wordCount = 0;
  let minWords = 30, maxWords = 80;
  
  switch (difficulty) {
    case 'easy': minWords = 30; maxWords = 50; break;
    case 'medium': minWords = 40; maxWords = 60; break;
    case 'hard': minWords = 50; maxWords = 70; break;
    case 'expert': minWords = 60; maxWords = 80; break;
  }
  
  wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const selectedWords = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    selectedWords.push(randomWord);
  }
  
  const text = selectedWords.join(' ') + '.';
  
  return {
    text,
    words: selectedWords,
    category,
    difficulty,
    language: "en",
    source: "randomly generated",
    wordCount: selectedWords.length,
    estimatedTime: Math.ceil(selectedWords.length / 30)
  };
}

const seedTextsHandler = async (event, context) => {
  console.log('seedTexts called with event:', JSON.stringify(event, null, 2));
  
  try {
    const { category, difficulty, count = 10 } = event.queryStringParameters || {};
    
    console.log('Parameters:', { category, difficulty, count });
    
    let textsToSeed = [];
    
    // If specific category and difficulty are provided, generate texts for that combination
    if (category && difficulty) {
      for (let i = 0; i < parseInt(count); i++) {
        textsToSeed.push(generateRandomText(difficulty, category));
      }
    } else {
      // Seed with sample texts and generate additional random texts
      textsToSeed = [...sampleTexts];
      
      const categories = ['general', 'technology', 'literature', 'news', 'quotes', 'code', 'nature', 'education', 'animals', 'science', 'environment', 'philosophy'];
      const difficulties = ['easy', 'medium', 'hard', 'expert'];
      
      // Generate additional random texts for variety
      for (const cat of categories) {
        for (const diff of difficulties) {
          for (let i = 0; i < 5; i++) { // 5 texts per category-difficulty combination
            textsToSeed.push(generateRandomText(diff, cat));
          }
        }
      }
    }
    
    console.log(`Seeding ${textsToSeed.length} texts...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const textData of textsToSeed) {
      try {
        await textService.createText(textData);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Error seeding text:', error.message);
      }
    }
    
    const result = {
      success: true,
      message: `Seeding complete. Success: ${successCount}, Errors: ${errorCount}`,
      totalSeeded: successCount,
      totalErrors: errorCount
    };
    
    console.log('Seeding result:', result);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Error in seedTexts:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to seed texts',
        message: error.message
      })
    };
  }
};

module.exports = { handler: seedTextsHandler }; 