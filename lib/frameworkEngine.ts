

import { db } from './mockDb';
import { Chain } from '../types';

// Advanced Sentiment & Tone Lexicon
const TONE_LEXICON: Record<string, string[]> = {
  'Urgent': ['now', 'asap', 'hurry', 'emergency', 'deadline', 'fast', 'rush', 'immediate', 'crisis'],
  'Reflective': ['wonder', 'think', 'feel', 'maybe', 'process', 'reflect', 'journal', 'perhaps', 'deep'],
  'Frustrated': ['stuck', 'hate', 'annoy', 'block', 'wrong', 'fail', 'stupid', 'hard', 'tired', 'loop'],
  'Hopeful': ['hope', 'dream', 'future', 'better', 'grow', 'light', 'vision', 'pray', 'trust'],
  'Analytical': ['system', 'logic', 'data', 'structure', 'plan', 'map', 'analyze', 'figure', 'solve'],
  'Devotional': ['sacred', 'god', 'spirit', 'soul', 'vow', 'covenant', 'serve', 'give', 'heart'],
  'Anxious': ['fear', 'scared', 'worry', 'panic', 'dread', 'nervous', 'shake', 'unsure', 'lost']
};

const PHASE_TRIGGERS: Record<string, string[]> = {
  'Initiation': ['start', 'begin', 'new', 'met', 'first', 'spark', 'entry'],
  'Saturation': ['too much', 'heavy', 'overwhelm', 'full', 'drowning', 'consumed'],
  'Conflict': ['fight', 'argue', 'tension', 'disagree', 'split', 'clash'],
  'Bifurcation': ['choice', 'decide', 'leave', 'stay', 'break', 'end', 'or'],
  'Integration': ['peace', 'understand', 'settle', 'whole', 'calm', 'clear']
};

export const analyzeJournalEntry = (text: string) => {
  const lowerText = text.toLowerCase();
  const words = lowerText.match(/\b\w+\b/g) || [];
  
  // 1. Advanced Tone Analysis
  const toneScores: Record<string, number> = {};
  
  Object.entries(TONE_LEXICON).forEach(([tone, keywords]) => {
    toneScores[tone] = 0;
    keywords.forEach(k => {
      const regex = new RegExp(`\\b${k}\\b`, 'gi');
      const count = (text.match(regex) || []).length;
      toneScores[tone] += count;
    });
  });

  // Find dominant tone
  let primaryTone = 'Neutral';
  let maxScore = 0;
  
  Object.entries(toneScores).forEach(([tone, score]) => {
    if (score > maxScore) {
      maxScore = score;
      primaryTone = tone;
    }
  });

  // 2. Chain Detection with Confidence
  const chains = db.getChains();
  const detectedChains = chains.map(chain => {
    let hits = 0;
    chain.symptoms.forEach(symptom => {
       if (lowerText.includes(symptom.toLowerCase())) hits++;
    });
    
    // Weighted scoring: longer symptoms match less frequently by chance, so worth more? 
    // For now, simple count density.
    const confidence = hits / Math.max(chain.symptoms.length, 1);
    
    return { chain, hits, confidence };
  }).filter(c => c.hits > 0).sort((a, b) => b.confidence - a.confidence);

  // 3. Distortion Risk Calculation
  // Risk increases with detecting specific "Critical" chains or high Anxious/Frustrated tones
  let riskLevel = 'Low';
  const highRiskChains = detectedChains.some(dc => dc.chain.severity === 'Critical');
  const mediumRiskChains = detectedChains.some(dc => dc.chain.severity === 'High');
  
  if (highRiskChains || (toneScores['Anxious'] > 3) || (toneScores['Frustrated'] > 3)) {
    riskLevel = 'High';
  } else if (mediumRiskChains || (toneScores['Anxious'] > 1)) {
    riskLevel = 'Medium';
  }

  // 4. Phase Estimation
  // Check if general phase keywords exist in context of detected chains
  const phaseHints = detectedChains.map(dc => {
     // Simple heuristic: check if text contains phase-specific words
     let detectedPhase = dc.chain.phases[0].name; // Default to first phase
     
     // Check for bifurcation keywords if severity is high
     if (riskLevel === 'High') {
        if (PHASE_TRIGGERS['Bifurcation'].some(w => lowerText.includes(w))) {
           detectedPhase = "Critical Bifurcation";
        }
     }
     
     return `Estimated Phase: ${detectedPhase}`;
  });

  // 5. Smart Summary
  // Extract the sentence with the most "meaning" (highest density of keywords)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let bestSentence = sentences[0];
  let maxKeywords = 0;

  sentences.forEach(s => {
     let count = 0;
     const sLower = s.toLowerCase();
     [...Object.values(TONE_LEXICON).flat(), ...Object.values(PHASE_TRIGGERS).flat()].forEach(k => {
        if (sLower.includes(k)) count++;
     });
     if (count > maxKeywords) {
        maxKeywords = count;
        bestSentence = s.trim();
     }
  });
  
  // Truncate if too long
  const summary = bestSentence.length > 100 ? bestSentence.substring(0, 97) + '...' : bestSentence;

  return {
    wordCount: words.length,
    emotionalTone: { primary: primaryTone, valence: maxScore },
    distortionRisk: { level: riskLevel },
    detectedChains: detectedChains.map(dc => ({ 
      chain: dc.chain,
      signatureHint: riskLevel === 'High' ? dc.chain.collapseSignature : dc.chain.coherenceSignature 
    })),
    detectedTerms: db.getGlossary().filter(t => lowerText.includes(t.term.toLowerCase())),
    phaseHints: phaseHints,
    insights: detectedChains.length > 0 
      ? detectedChains.map(dc => `Pattern "${dc.chain.name}" active (${dc.hits} markers). Question: ${dc.chain.question}`) 
      : ['No dominant patterns detected. Coherence stable.'],
    summary: summary,
    chainCount: detectedChains.length
  };
};

export const detectChainsWithDetails = (text: string) => {
   return analyzeJournalEntry(text).detectedChains;
};

export const matchChains = (symptoms: string[]) => {
  const chains = db.getChains();
  return chains.map(c => {
    const matches = c.symptoms.filter(s => symptoms.some(sym => sym.toLowerCase().includes(s.toLowerCase())));
    return {
      chain: c,
      confidence: matches.length / Math.max(c.symptoms.length, 1),
      matchedSymptoms: matches
    };
  }).filter(m => m.confidence > 0).sort((a, b) => b.confidence - a.confidence);
};