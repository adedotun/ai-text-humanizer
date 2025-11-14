const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// AI Detection endpoint
app.post('/api/detect-ai', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // AI detection logic using heuristics and patterns
    const aiScore = detectAIPatterns(text);
    
    res.json({
      aiScore: aiScore,
      isLikelyAI: aiScore > 0.6,
      confidence: Math.abs(aiScore - 0.5) * 2,
      analysis: getAIAnalysis(text, aiScore)
    });
  } catch (error) {
    console.error('Error detecting AI:', error);
    res.status(500).json({ error: 'Failed to detect AI content' });
  }
});

// Humanize text endpoint
app.post('/api/humanize', async (req, res) => {
  try {
    const { text, intensity = 'medium' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Detect AI in original text
    const originalAIScore = detectAIPatterns(text);
    const originalAnalysis = getAIAnalysis(text, originalAIScore);
    
    // Humanize the text
    const humanizedText = await humanizeText(text, intensity);
    
    // Detect AI in humanized text
    const humanizedAIScore = detectAIPatterns(humanizedText);
    const humanizedAnalysis = getAIAnalysis(humanizedText, humanizedAIScore);
    
    res.json({
      original: text,
      humanized: humanizedText,
      changes: analyzeChanges(text, humanizedText),
      originalAI: {
        aiScore: originalAIScore,
        isLikelyAI: originalAIScore > 0.6,
        confidence: Math.abs(originalAIScore - 0.5) * 2,
        analysis: originalAnalysis
      },
      humanizedAI: {
        aiScore: humanizedAIScore,
        isLikelyAI: humanizedAIScore > 0.6,
        confidence: Math.abs(humanizedAIScore - 0.5) * 2,
        analysis: humanizedAnalysis
      }
    });
  } catch (error) {
    console.error('Error humanizing text:', error);
    res.status(500).json({ error: 'Failed to humanize text' });
  }
});

// Combined endpoint: detect and humanize
app.post('/api/process', async (req, res) => {
  try {
    const { text, intensity = 'medium' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Detect AI in original text
    const aiScore = detectAIPatterns(text);
    const isLikelyAI = aiScore > 0.6;
    const originalAnalysis = getAIAnalysis(text, aiScore);
    
    // Humanize if needed
    let humanizedText = text;
    let changes = null;
    let humanizedAIScore = null;
    let humanizedAnalysis = null;
    
    if (isLikelyAI || req.body.forceHumanize) {
      humanizedText = await humanizeText(text, intensity);
      changes = analyzeChanges(text, humanizedText);
      
      // Detect AI in humanized text
      humanizedAIScore = detectAIPatterns(humanizedText);
      humanizedAnalysis = getAIAnalysis(humanizedText, humanizedAIScore);
    }
    
    res.json({
      original: text,
      humanized: humanizedText,
      aiScore: aiScore,
      isLikelyAI: isLikelyAI,
      confidence: Math.abs(aiScore - 0.5) * 2,
      analysis: originalAnalysis,
      changes: changes,
      humanizedAI: humanizedAIScore !== null ? {
        aiScore: humanizedAIScore,
        isLikelyAI: humanizedAIScore > 0.6,
        confidence: Math.abs(humanizedAIScore - 0.5) * 2,
        analysis: humanizedAnalysis
      } : null
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

// AI Detection heuristics
function detectAIPatterns(text) {
  let score = 0.5; // Start neutral
  const lowerText = text.toLowerCase();
  
  // Check for common AI patterns (expanded list)
  const aiIndicators = [
    /in conclusion/i,
    /it is important to note/i,
    /furthermore/i,
    /moreover/i,
    /additionally/i,
    /it is worth noting/i,
    /it should be noted/i,
    /in summary/i,
    /to summarize/i,
    /in essence/i,
    /it is evident that/i,
    /it can be observed that/i,
    /as a matter of fact/i,
    /with regard to/i,
    /with respect to/i,
    /in order to/i,
    /due to the fact that/i,
    /meticulously/i,
    /profound/i,
    /facilitate/i,
    /utilize/i,
    /demonstrate/i,
    /leverage/i,
    /optimize/i
  ];
  
  const humanIndicators = [
    /i think/i,
    /i believe/i,
    /in my opinion/i,
    /personally/i,
    /i've noticed/i,
    /from my experience/i,
    /i find that/i,
    /i've seen/i,
    /i noticed/i,
    /i remember/i,
    /i feel/i,
    /\bi'm\b/i,
    /\bi'll\b/i,
    /\bi'd\b/i,
    /\bdon't\b/i,
    /\bcan't\b/i,
    /\bwon't\b/i,
    /\bthat's\b/i,
    /\bit's\b/i,
    /\bwhat's\b/i
  ];
  
  // Count AI indicators (count all occurrences)
  let aiCount = 0;
  aiIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) aiCount += matches.length;
  });
  
  // Count human indicators (count all occurrences)
  let humanCount = 0;
  humanIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) humanCount += matches.length;
  });
  
  // Adjust score based on indicators (weighted and capped)
  score += Math.min(aiCount * 0.08, 0.4); // Cap AI indicator influence
  score -= Math.min(humanCount * 0.12, 0.3); // Cap human indicator influence
  
  // Check sentence length variation (AI tends to have more uniform lengths)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) {
    const lengths = sentences.map(s => s.trim().length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Use coefficient of variation for better analysis
    const coefficientOfVariation = avgLength > 0 ? stdDev / avgLength : 0;
    if (coefficientOfVariation < 0.3) {
      score += 0.15; // Low variation suggests AI
    } else if (coefficientOfVariation > 0.6) {
      score -= 0.1; // High variation suggests human
    }
  }
  
  // Check for repetitive structures (improved)
  const words = text.split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length > 4) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });
  
  const maxFreq = Math.max(...Object.values(wordFreq), 0);
  const repetitionRatio = words.length > 0 ? maxFreq / words.length : 0;
  if (repetitionRatio > 0.1) {
    score += 0.1;
  }
  
  // Check for burstiness (humans have more variation in word frequency)
  const frequencies = Object.values(wordFreq);
  if (frequencies.length > 0) {
    const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const freqVariance = frequencies.reduce((sum, f) => sum + Math.pow(f - avgFreq, 2), 0) / frequencies.length;
    const burstiness = avgFreq > 0 ? Math.sqrt(freqVariance) / avgFreq : 0;
    
    // Low burstiness suggests AI
    if (burstiness < 0.5) {
      score += 0.1;
    }
  }
  
  // Check for personal pronouns (humans use more)
  const personalPronouns = (text.match(/\b(I|me|my|myself|we|us|our|ourselves|you|your|yours)\b/gi) || []).length;
  const pronounRatio = words.length > 0 ? personalPronouns / words.length : 0;
  if (pronounRatio > 0.02) {
    score -= 0.15; // High pronoun usage suggests human
  }
  
  // Check for contractions (humans use more)
  const contractions = (text.match(/\b(n't|'m|'re|'ve|'ll|'d|'s)\b/gi) || []).length;
  if (contractions > 0) {
    score -= 0.1;
  }
  
  // Normalize score between 0 and 1
  score = Math.max(0, Math.min(1, score));
  
  return score;
}

function getAIAnalysis(text, aiScore) {
  const reasons = [];
  
  if (aiScore > 0.7) {
    reasons.push('High use of formal transition phrases');
    reasons.push('Uniform sentence structure');
    reasons.push('Lack of personal voice');
  } else if (aiScore < 0.3) {
    reasons.push('Personal voice detected');
    reasons.push('Varied sentence structure');
    reasons.push('Natural language patterns');
  }
  
  return {
    reasons: reasons,
    recommendation: aiScore > 0.6 
      ? 'Consider humanizing this text to make it more natural'
      : 'Text appears to be naturally written'
  };
}

// Text humanization function using Hugging Face API (free forever)
async function humanizeText(text, intensity = 'medium') {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  // Using better models for paraphrasing - try multiple models for best results
  const HUGGINGFACE_MODELS = [
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn', // Better for summarization/paraphrasing
    'https://api-inference.huggingface.co/models/google/flan-t5-base' // Fallback
  ];
  const HUGGINGFACE_API_URL = HUGGINGFACE_MODELS[0];
  
  // Try Hugging Face API first if API key is available
  if (HUGGINGFACE_API_KEY) {
    try {
      // Split text into sentences for better paraphrasing
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length === 0) {
        return text;
      }
      
      // Process sentences in batches to avoid token limits
      const batchSize = intensity === 'high' ? 2 : intensity === 'medium' ? 3 : 4;
      const humanizedSentences = [];
      
      for (let i = 0; i < sentences.length; i += batchSize) {
        const batch = sentences.slice(i, i + batchSize);
        const batchText = batch.join('. ').trim();
        
        if (batchText.length > 0 && batchText.length < 500) { // Respect token limits
          try {
            // Use a prompt that encourages paraphrasing
            const prompt = `Paraphrase this text to make it more natural and human-like: ${batchText}`;
            
            const response = await axios.post(
              HUGGINGFACE_API_URL,
              { inputs: prompt },
              {
                headers: {
                  'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
              }
            );
            
            // Handle different response formats
            let paraphrased = null;
            if (response.data) {
              if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) {
                paraphrased = response.data[0].generated_text;
              } else if (response.data.generated_text) {
                paraphrased = response.data.generated_text;
              } else if (typeof response.data === 'string') {
                paraphrased = response.data;
              } else if (Array.isArray(response.data) && response.data[0] && typeof response.data[0] === 'string') {
                paraphrased = response.data[0];
              }
            }
            
            // Check if model is loading (Hugging Face returns error when model is loading)
            if (response.data && response.data.error && response.data.error.includes('loading')) {
              console.log('Model is loading, using fallback');
              humanizedSentences.push(await customHumanize(batchText, intensity));
            } else if (paraphrased && paraphrased.trim().length > 0 && paraphrased !== batchText) {
              // Clean up the response
              paraphrased = paraphrased.replace(/^paraphrase.*?:/i, '').trim();
              paraphrased = paraphrased.replace(/^paraphrase/i, '').trim();
              humanizedSentences.push(paraphrased);
            } else {
              // Fallback to custom logic for this batch
              humanizedSentences.push(await customHumanize(batchText, intensity));
            }
          } catch (apiError) {
            // Handle rate limiting and other API errors gracefully
            if (apiError.response && apiError.response.status === 503) {
              console.log('Model is loading or rate limited, using fallback');
            } else {
              console.log('Hugging Face API error, using fallback:', apiError.message);
            }
            // Fallback to custom logic for this batch
            humanizedSentences.push(await customHumanize(batchText, intensity));
          }
          
          // Add small delay to respect rate limits (free tier: ~30 requests/minute)
          if (i + batchSize < sentences.length) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          }
        } else {
          // Text too long, use custom logic
          humanizedSentences.push(await customHumanize(batchText, intensity));
        }
      }
      
      let humanized = humanizedSentences.join('. ').trim();
      
      // Post-process to ensure quality
      humanized = postProcessHumanized(humanized, intensity);
      
      return humanized || text; // Fallback to original if empty
      
    } catch (error) {
      console.log('Hugging Face API failed, using custom humanization:', error.message);
      // Fall through to custom logic
    }
  }
  
  // Fallback to custom humanization logic
  return await customHumanize(text, intensity);
}

// Custom humanization logic (fallback)
async function customHumanize(text, intensity = 'medium') {
  // Intensity levels: low, medium, high
  const intensityMap = {
    low: { sentenceVariation: 0.15, wordVariation: 0.2, addPersonality: false, contractionRate: 0.3 },
    medium: { sentenceVariation: 0.3, wordVariation: 0.4, addPersonality: true, contractionRate: 0.5 },
    high: { sentenceVariation: 0.5, wordVariation: 0.6, addPersonality: true, contractionRate: 0.7 }
  };
  
  const config = intensityMap[intensity] || intensityMap.medium;
  let humanized = text;
  
  // Extract and preserve technical terms, proper nouns, and domain-specific terms
  const preservedTerms = extractPreservedTerms(text);
  
  // Create placeholders for preserved terms
  const placeholderMap = {};
  preservedTerms.forEach((term, index) => {
    const placeholder = `__PRESERVED_${index}__`;
    placeholderMap[placeholder] = term;
    // Replace with case-insensitive regex
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    humanized = humanized.replace(regex, placeholder);
  });
  
  // Expanded replacements for formal phrases with more casual alternatives
  const replacements = {
    // Transition phrases
    'furthermore': ['also', 'plus', 'and', 'what\'s more'],
    'moreover': ['also', 'what\'s more', 'on top of that', 'plus'],
    'additionally': ['also', 'plus', 'and', 'on top of that'],
    'in conclusion': ['so', 'to wrap up', 'all in all', 'basically'],
    'it is important to note': ['it\'s worth noting', 'keep in mind', 'remember', 'note that'],
    'it should be noted': ['note that', 'keep in mind', 'remember'],
    'in summary': ['so', 'to sum up', 'basically', 'in short'],
    'to summarize': ['so', 'in short', 'basically'],
    'in essence': ['basically', 'at its core', 'really', 'essentially'],
    'therefore': ['so', 'that\'s why', 'which means', 'which is why'],
    'thus': ['so', 'this means', 'that\'s why'],
    'hence': ['so', 'that\'s why'],
    'consequently': ['so', 'as a result', 'that\'s why'],
    'nevertheless': ['but', 'still', 'though'],
    'nonetheless': ['but', 'still', 'though'],
    'however': ['but', 'though', 'still'],
    
    // Formal academic phrases
    'meticulously': ['carefully', 'thoroughly', 'really carefully'],
    'profound': ['deep', 'real', 'significant'],
    'facilitate': ['help', 'make easier', 'enable'],
    'facilitates': ['helps', 'makes easier', 'enables'],
    'facilitated': ['helped', 'made easier', 'enabled'],
    'demonstrate': ['show', 'prove', 'reveal'],
    'demonstrates': ['shows', 'proves', 'reveals'],
    'demonstrated': ['showed', 'proved', 'revealed'],
    'utilize': ['use', 'make use of'],
    'utilizes': ['uses', 'makes use of'],
    'utilized': ['used', 'made use of'],
    'implement': ['do', 'carry out', 'put in place'],
    'implements': ['does', 'carries out'],
    'implemented': ['did', 'carried out'],
    'acquire': ['get', 'gain', 'pick up'],
    'acquires': ['gets', 'gains'],
    'acquired': ['got', 'gained'],
    'analyze': ['look at', 'study', 'examine'],
    'analyzes': ['looks at', 'studies', 'examines'],
    'analyzed': ['looked at', 'studied', 'examined'],
    'examine': ['look at', 'check out', 'study'],
    'examines': ['looks at', 'checks out'],
    'examined': ['looked at', 'checked out'],
    'investigate': ['look into', 'check out', 'explore'],
    'investigates': ['looks into', 'checks out'],
    'investigated': ['looked into', 'checked out'],
    'optimize': ['improve', 'make better', 'enhance'],
    'optimizes': ['improves', 'makes better'],
    'optimized': ['improved', 'made better'],
    'leverage': ['use', 'take advantage of'],
    'leverages': ['uses', 'takes advantage of'],
    'leveraged': ['used', 'took advantage of'],
    
    // Complex phrases
    'in order to': ['to', 'so I can'],
    'with regard to': ['about', 'regarding', 'when it comes to'],
    'with respect to': ['about', 'regarding'],
    'in the context of': ['when it comes to', 'in'],
    'it is evident that': ['clearly', 'obviously', 'it\'s clear that'],
    'it can be observed that': ['you can see', 'it\'s clear', 'obviously'],
    'it is worth mentioning': ['worth noting', 'worth saying'],
    'as a matter of fact': ['actually', 'in fact'],
    'in the event that': ['if', 'when'],
    'prior to': ['before'],
    'subsequent to': ['after'],
    'due to the fact that': ['because', 'since'],
    'in spite of the fact that': ['even though', 'despite'],
    
    // Personal statement phrases
    'fascination with': ['love for', 'interest in', 'passion for'],
    'fueled my ambition': ['drove me', 'motivated me', 'pushed me'],
    'master the intersection': ['work at the intersection', 'combine', 'bring together'],
    'specialize in': ['focus on', 'work in', 'concentrate on'],
    'pursue a career as': ['become', 'work as', 'aim to be']
  };
  
  // Apply replacements (process longer phrases first to avoid partial matches)
  const sortedReplacements = Object.keys(replacements).sort((a, b) => b.length - a.length);
  
  sortedReplacements.forEach(formal => {
    const regex = new RegExp(`\\b${formal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const alternatives = replacements[formal];
    humanized = humanized.replace(regex, (match) => {
      // Apply replacement based on intensity (higher intensity = more likely to replace)
      const replaceProbability = intensity === 'high' ? 0.9 : intensity === 'medium' ? 0.7 : 0.5;
      if (Math.random() < replaceProbability) {
        const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
        return match[0] === match[0].toUpperCase() 
          ? randomAlt.charAt(0).toUpperCase() + randomAlt.slice(1)
          : randomAlt;
      }
      return match;
    });
  });
  
  // Add contractions for more natural language
  if (Math.random() < config.contractionRate) {
    const contractions = [
      { pattern: /\bit is\b/gi, replacement: "it's" },
      { pattern: /\bI am\b/g, replacement: "I'm" },
      { pattern: /\bI have\b/g, replacement: "I've" },
      { pattern: /\bI will\b/g, replacement: "I'll" },
      { pattern: /\bI would\b/g, replacement: "I'd" },
      { pattern: /\byou are\b/gi, replacement: "you're" },
      { pattern: /\bwe are\b/gi, replacement: "we're" },
      { pattern: /\bthey are\b/gi, replacement: "they're" },
      { pattern: /\bit has\b/gi, replacement: "it's" },
      { pattern: /\bthat is\b/gi, replacement: "that's" },
      { pattern: /\bthere is\b/gi, replacement: "there's" },
      { pattern: /\bhere is\b/gi, replacement: "here's" },
      { pattern: /\bwhat is\b/gi, replacement: "what's" },
      { pattern: /\bwho is\b/gi, replacement: "who's" },
      { pattern: /\bwhere is\b/gi, replacement: "where's" },
      { pattern: /\bhow is\b/gi, replacement: "how's" },
      { pattern: /\bdo not\b/gi, replacement: "don't" },
      { pattern: /\bdoes not\b/gi, replacement: "doesn't" },
      { pattern: /\bdid not\b/gi, replacement: "didn't" },
      { pattern: /\bwill not\b/gi, replacement: "won't" },
      { pattern: /\bwould not\b/gi, replacement: "wouldn't" },
      { pattern: /\bcannot\b/gi, replacement: "can't" },
      { pattern: /\bcould not\b/gi, replacement: "couldn't" },
      { pattern: /\bshould not\b/gi, replacement: "shouldn't" },
      { pattern: /\bmust not\b/gi, replacement: "mustn't" }
    ];
    
    contractions.forEach(({ pattern, replacement }) => {
      if (Math.random() < config.contractionRate) {
        humanized = humanized.replace(pattern, replacement);
      }
    });
  }
  
  // Vary sentence lengths more aggressively
  const sentences = humanized.split(/([.!?]+)/);
  let variedSentences = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (sentence && sentence.trim().length > 0) {
      const trimmedSentence = sentence.trim();
      
      // Break long sentences more aggressively
      if (trimmedSentence.length > 100 && Math.random() < config.sentenceVariation) {
        // Find a good break point (after a comma or conjunction)
        const breakPoints = [
          trimmedSentence.lastIndexOf(', ', Math.floor(trimmedSentence.length * 0.6)),
          trimmedSentence.lastIndexOf(' and ', Math.floor(trimmedSentence.length * 0.6)),
          trimmedSentence.lastIndexOf(' but ', Math.floor(trimmedSentence.length * 0.6)),
          trimmedSentence.lastIndexOf(' or ', Math.floor(trimmedSentence.length * 0.6)),
          trimmedSentence.lastIndexOf(' ', Math.floor(trimmedSentence.length * 0.5))
        ].filter(idx => idx > 20);
        
        if (breakPoints.length > 0) {
          const breakPoint = Math.max(...breakPoints);
          const firstPart = trimmedSentence.substring(0, breakPoint);
          const secondPart = trimmedSentence.substring(breakPoint + 1).trim();
          variedSentences.push(firstPart + '.');
          variedSentences.push(secondPart.charAt(0).toUpperCase() + secondPart.slice(1) + punctuation);
        } else {
          variedSentences.push(trimmedSentence + punctuation);
        }
      } else if (trimmedSentence.length < 30 && variedSentences.length > 0 && Math.random() < 0.3) {
        // Combine very short sentences occasionally
        const lastSentence = variedSentences.pop();
        variedSentences.push(lastSentence + ' ' + trimmedSentence.toLowerCase() + punctuation);
      } else {
        variedSentences.push(trimmedSentence + punctuation);
      }
    }
  }
  
  humanized = variedSentences.join(' ');
  
  // Add some personality if enabled
  if (config.addPersonality && Math.random() < 0.4) {
    const personalityPhrases = [
      'I think',
      'In my experience',
      'From what I\'ve seen',
      'Personally',
      'I\'ve noticed',
      'For me',
      'I found that',
      'What I learned is'
    ];
    
    const firstSentence = humanized.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 20 && !firstSentence.toLowerCase().includes('i ')) {
      const randomPhrase = personalityPhrases[Math.floor(Math.random() * personalityPhrases.length)];
      humanized = randomPhrase + ', ' + humanized.charAt(0).toLowerCase() + humanized.slice(1);
    }
  }
  
  // Replace passive voice patterns with active voice where possible
  const passivePatterns = [
    { pattern: /\bwas (analyzed|examined|investigated|implemented|utilized|demonstrated)\b/gi, 
      replacement: (match) => {
        const verb = match.split(' ')[1];
        const activeForms = {
          'analyzed': 'I analyzed',
          'examined': 'I examined',
          'investigated': 'I investigated',
          'implemented': 'I implemented',
          'utilized': 'I used',
          'demonstrated': 'I showed'
        };
        return activeForms[verb] || match;
      }
    }
  ];
  
  if (Math.random() < config.wordVariation * 0.5) {
    passivePatterns.forEach(({ pattern, replacement }) => {
      humanized = humanized.replace(pattern, replacement);
    });
  }
  
  // Clean up any double spaces
  humanized = humanized.replace(/\s+/g, ' ').trim();
  
  // Restore preserved terms
  Object.keys(placeholderMap).forEach(placeholder => {
    humanized = humanized.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholderMap[placeholder]);
  });
  
  return humanized;
}

// Extract terms that should be preserved (technical terms, proper nouns, etc.)
function extractPreservedTerms(text) {
  const preserved = new Set();
  
  // Extract proper nouns (capitalized words, excluding sentence starts)
  const words = text.split(/\s+/);
  
  // Find capitalized words that aren't at sentence starts
  words.forEach((word, index) => {
    const cleanWord = word.replace(/[^\w]/g, '');
    // Check if it's a proper noun (capitalized, not at sentence start, length > 1)
    if (cleanWord.length > 1 && cleanWord[0] === cleanWord[0].toUpperCase() && 
        cleanWord[0] !== cleanWord[0].toLowerCase()) {
      // Check if previous word ends sentence
      const prevWord = index > 0 ? words[index - 1] : '';
      const isSentenceStart = prevWord.match(/[.!?]$/) || index === 0;
      
      if (!isSentenceStart && cleanWord.length > 2) {
        preserved.add(cleanWord);
      }
    }
  });
  
  // Extract technical terms (common patterns)
  const technicalPatterns = [
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Algorithm|Method|System|Framework|Library|API|SDK|Protocol|Standard|Model|Architecture|Pattern|Design|Principle)\b/gi,
    /\b(?:HTTP|HTTPS|API|REST|JSON|XML|SQL|NoSQL|AI|ML|DL|NLP|CV|GPU|CPU|RAM|SSD|HDD|IDE|CLI|GUI|UI|UX|CSS|HTML|JS|TS|PHP|Python|Java|C\+\+|Go|Rust|Swift|Kotlin)\b/gi,
    /\b\d+\.\d+(?:\.\d+)?\s*(?:GHz|MHz|GB|MB|TB|KB|ms|s|min|hr)\b/gi,
    /\b(?:Dual-Pivot|Quick|Merge|Heap|Bubble|Insertion|Selection)\s+(?:Sort|Algorithm)\b/gi,
    /\b(?:DevSecOps|DevOps|Agile|Scrum|Kanban|CI\/CD)\b/gi,
    /\b(?:Master|Bachelor|Doctorate|PhD|MSc|BSc|BS|MS|MA|BA)\s+(?:of|in)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    /\b(?:University|College|Institute|School)\s+of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi
  ];
  
  technicalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract individual words from the match
        match.split(/\s+/).forEach(word => {
          const clean = word.replace(/[^\w-]/g, '');
          if (clean.length > 2) {
            preserved.add(clean);
          }
        });
      });
    }
  });
  
  // Extract acronyms (all caps, 2+ characters)
  const acronyms = text.match(/\b[A-Z]{2,}\b/g);
  if (acronyms) {
    acronyms.forEach(acronym => {
      if (acronym.length >= 2 && acronym.length <= 10) {
        preserved.add(acronym);
      }
    });
  }
  
  return Array.from(preserved);
}

// Post-process humanized text to ensure quality
function postProcessHumanized(text, intensity) {
  let processed = text;
  
  // Ensure proper sentence capitalization
  const sentences = processed.split(/([.!?]+)/);
  let fixedSentences = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (sentence && sentence.trim().length > 0) {
      const trimmed = sentence.trim();
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      fixedSentences.push(capitalized + punctuation);
    }
  }
  
  processed = fixedSentences.join(' ');
  
  // Clean up spacing
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
}

function analyzeChanges(original, humanized) {
  const originalWords = original.split(/\s+/).length;
  const humanizedWords = humanized.split(/\s+/).length;
  const wordDiff = humanizedWords - originalWords;
  
  // Calculate similarity percentage
  const similarity = calculateSimilarity(original, humanized);
  
  // Generate word-level diff for highlighting
  const diff = generateWordDiff(original, humanized);
  
  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    wordCountChange: wordDiff,
    sentenceCountChange: humanizedSentences.length - originalSentences.length,
    percentageChanged: Math.abs(wordDiff / originalWords * 100).toFixed(1),
    similarity: similarity.toFixed(1),
    diff: diff
  };
}

// Generate word-level diff for highlighting changes
function generateWordDiff(original, humanized) {
  const originalWords = original.split(/(\s+)/);
  const humanizedWords = humanized.split(/(\s+)/);
  const diff = [];
  
  // Simple word-by-word comparison
  const maxLength = Math.max(originalWords.length, humanizedWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i] || '';
    const humWord = humanizedWords[i] || '';
    
    if (origWord !== humWord && origWord.trim() && humWord.trim()) {
      diff.push({
        original: origWord.trim(),
        humanized: humWord.trim(),
        position: i
      });
    }
  }
  
  return diff.slice(0, 50); // Limit to first 50 changes
}

// Calculate text similarity using word overlap
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

