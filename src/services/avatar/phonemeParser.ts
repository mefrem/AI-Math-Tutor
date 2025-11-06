/**
 * Phoneme Parser
 * Converts text to phonemes for lip-sync animation
 * Uses rule-based English grapheme-to-phoneme conversion
 */

// ARPAbet phoneme set (CMU Pronouncing Dictionary standard)
export type ARPAbetPhoneme =
  // Vowels
  | 'AA' | 'AE' | 'AH' | 'AO' | 'AW' | 'AY' | 'EH' | 'ER' | 'EY' | 'IH' | 'IY' | 'OW' | 'OY' | 'UH' | 'UW'
  // Consonants
  | 'B' | 'CH' | 'D' | 'DH' | 'F' | 'G' | 'HH' | 'JH' | 'K' | 'L' | 'M' | 'N' | 'NG' | 'P' | 'R' | 'S' | 'SH' | 'T' | 'TH' | 'V' | 'W' | 'Y' | 'Z' | 'ZH'
  // Silence
  | 'SIL';

/**
 * Phoneme with timing information
 */
export interface PhonemeFrame {
  phoneme: ARPAbetPhoneme;
  duration: number; // milliseconds
}

/**
 * Simple phoneme dictionary for common words
 * Based on CMU Pronouncing Dictionary
 */
const PHONEME_DICT: Record<string, ARPAbetPhoneme[]> = {
  // Common math terms
  'add': ['AE', 'D'],
  'subtract': ['S', 'AH', 'B', 'T', 'R', 'AE', 'K', 'T'],
  'multiply': ['M', 'AH', 'L', 'T', 'IY', 'P', 'L', 'AY'],
  'divide': ['D', 'IH', 'V', 'AY', 'D'],
  'equals': ['IY', 'K', 'W', 'AH', 'L', 'Z'],
  'plus': ['P', 'L', 'AH', 'S'],
  'minus': ['M', 'AY', 'N', 'AH', 'S'],
  'times': ['T', 'AY', 'M', 'Z'],
  'number': ['N', 'AH', 'M', 'B', 'ER'],
  'problem': ['P', 'R', 'AA', 'B', 'L', 'AH', 'M'],
  'solve': ['S', 'AA', 'L', 'V'],
  'answer': ['AE', 'N', 'S', 'ER'],
  'correct': ['K', 'ER', 'EH', 'K', 'T'],
  'wrong': ['R', 'AO', 'NG'],
  'good': ['G', 'UH', 'D'],
  'great': ['G', 'R', 'EY', 'T'],
  'excellent': ['EH', 'K', 'S', 'AH', 'L', 'AH', 'N', 'T'],
  'try': ['T', 'R', 'AY'],
  'again': ['AH', 'G', 'EH', 'N'],
  'think': ['TH', 'IH', 'NG', 'K'],
  'explain': ['IH', 'K', 'S', 'P', 'L', 'EY', 'N'],
  'understand': ['AH', 'N', 'D', 'ER', 'S', 'T', 'AE', 'N', 'D'],

  // Common words
  'the': ['DH', 'AH'],
  'a': ['AH'],
  'an': ['AE', 'N'],
  'is': ['IH', 'Z'],
  'are': ['AA', 'R'],
  'was': ['W', 'AA', 'Z'],
  'were': ['W', 'ER'],
  'be': ['B', 'IY'],
  'been': ['B', 'IH', 'N'],
  'have': ['HH', 'AE', 'V'],
  'has': ['HH', 'AE', 'Z'],
  'had': ['HH', 'AE', 'D'],
  'do': ['D', 'UW'],
  'does': ['D', 'AH', 'Z'],
  'did': ['D', 'IH', 'D'],
  'will': ['W', 'IH', 'L'],
  'would': ['W', 'UH', 'D'],
  'should': ['SH', 'UH', 'D'],
  'could': ['K', 'UH', 'D'],
  'can': ['K', 'AE', 'N'],
  'cannot': ['K', 'AE', 'N', 'AA', 'T'],
  'may': ['M', 'EY'],
  'might': ['M', 'AY', 'T'],
  'must': ['M', 'AH', 'S', 'T'],
  'let': ['L', 'EH', 'T'],
  'make': ['M', 'EY', 'K'],
  'get': ['G', 'EH', 'T'],
  'go': ['G', 'OW'],
  'come': ['K', 'AH', 'M'],
  'take': ['T', 'EY', 'K'],
  'see': ['S', 'IY'],
  'look': ['L', 'UH', 'K'],
  'use': ['Y', 'UW', 'Z'],
  'find': ['F', 'AY', 'N', 'D'],
  'give': ['G', 'IH', 'V'],
  'tell': ['T', 'EH', 'L'],
  'work': ['W', 'ER', 'K'],
  'call': ['K', 'AO', 'L'],
  'ask': ['AE', 'S', 'K'],
  'need': ['N', 'IY', 'D'],
  'feel': ['F', 'IY', 'L'],
  'become': ['B', 'IH', 'K', 'AH', 'M'],
  'leave': ['L', 'IY', 'V'],
  'put': ['P', 'UH', 'T'],
  'mean': ['M', 'IY', 'N'],
  'keep': ['K', 'IY', 'P'],
  'begin': ['B', 'IH', 'G', 'IH', 'N'],
  'seem': ['S', 'IY', 'M'],
  'help': ['HH', 'EH', 'L', 'P'],
  'show': ['SH', 'OW'],
  'hear': ['HH', 'IH', 'R'],
  'play': ['P', 'L', 'EY'],
  'run': ['R', 'AH', 'N'],
  'move': ['M', 'UW', 'V'],
  'like': ['L', 'AY', 'K'],
  'live': ['L', 'IH', 'V'],
  'believe': ['B', 'IH', 'L', 'IY', 'V'],
  'hold': ['HH', 'OW', 'L', 'D'],
  'bring': ['B', 'R', 'IH', 'NG'],
  'happen': ['HH', 'AE', 'P', 'AH', 'N'],
  'write': ['R', 'AY', 'T'],
  'sit': ['S', 'IH', 'T'],
  'stand': ['S', 'T', 'AE', 'N', 'D'],
  'lose': ['L', 'UW', 'Z'],
  'pay': ['P', 'EY'],
  'meet': ['M', 'IY', 'T'],
  'include': ['IH', 'N', 'K', 'L', 'UW', 'D'],
  'continue': ['K', 'AH', 'N', 'T', 'IH', 'N', 'Y', 'UW'],
  'set': ['S', 'EH', 'T'],
  'learn': ['L', 'ER', 'N'],
  'change': ['CH', 'EY', 'N', 'JH'],
  'lead': ['L', 'IY', 'D'],
  'watch': ['W', 'AA', 'CH'],
  'follow': ['F', 'AA', 'L', 'OW'],
  'stop': ['S', 'T', 'AA', 'P'],
  'create': ['K', 'R', 'IY', 'EY', 'T'],
  'speak': ['S', 'P', 'IY', 'K'],
  'read': ['R', 'IY', 'D'],
  'spend': ['S', 'P', 'EH', 'N', 'D'],
  'grow': ['G', 'R', 'OW'],
  'open': ['OW', 'P', 'AH', 'N'],
  'walk': ['W', 'AO', 'K'],
  'win': ['W', 'IH', 'N'],
  'teach': ['T', 'IY', 'CH'],
  'offer': ['AO', 'F', 'ER'],
  'remember': ['R', 'IH', 'M', 'EH', 'M', 'B', 'ER'],
  'consider': ['K', 'AH', 'N', 'S', 'IH', 'D', 'ER'],
  'appear': ['AH', 'P', 'IH', 'R'],
  'buy': ['B', 'AY'],
  'serve': ['S', 'ER', 'V'],
  'die': ['D', 'AY'],
  'send': ['S', 'EH', 'N', 'D'],
  'expect': ['IH', 'K', 'S', 'P', 'EH', 'K', 'T'],
  'build': ['B', 'IH', 'L', 'D'],
  'stay': ['S', 'T', 'EY'],
  'fall': ['F', 'AO', 'L'],
  'cut': ['K', 'AH', 'T'],
  'reach': ['R', 'IY', 'CH'],
  'kill': ['K', 'IH', 'L'],
  'remain': ['R', 'IH', 'M', 'EY', 'N'],
  'suggest': ['S', 'AH', 'JH', 'EH', 'S', 'T'],
  'raise': ['R', 'EY', 'Z'],
  'pass': ['P', 'AE', 'S'],
  'sell': ['S', 'EH', 'L'],
  'require': ['R', 'IH', 'K', 'W', 'AY', 'R'],
  'report': ['R', 'IH', 'P', 'AO', 'R', 'T'],
  'decide': ['D', 'IH', 'S', 'AY', 'D'],
  'pull': ['P', 'UH', 'L'],

  // Pronouns
  'i': ['AY'],
  'you': ['Y', 'UW'],
  'he': ['HH', 'IY'],
  'she': ['SH', 'IY'],
  'it': ['IH', 'T'],
  'we': ['W', 'IY'],
  'they': ['DH', 'EY'],
  'me': ['M', 'IY'],
  'him': ['HH', 'IH', 'M'],
  'her': ['HH', 'ER'],
  'us': ['AH', 'S'],
  'them': ['DH', 'EH', 'M'],

  // Question words
  'what': ['W', 'AA', 'T'],
  'where': ['W', 'EH', 'R'],
  'when': ['W', 'EH', 'N'],
  'why': ['W', 'AY'],
  'how': ['HH', 'AW'],
  'who': ['HH', 'UW'],
  'which': ['W', 'IH', 'CH'],

  // Numbers
  'zero': ['Z', 'IH', 'R', 'OW'],
  'one': ['W', 'AH', 'N'],
  'two': ['T', 'UW'],
  'three': ['TH', 'R', 'IY'],
  'four': ['F', 'AO', 'R'],
  'five': ['F', 'AY', 'V'],
  'six': ['S', 'IH', 'K', 'S'],
  'seven': ['S', 'EH', 'V', 'AH', 'N'],
  'eight': ['EY', 'T'],
  'nine': ['N', 'AY', 'N'],
  'ten': ['T', 'EH', 'N'],
};

/**
 * Letter-to-phoneme rules for words not in dictionary
 * Simple rule-based system for basic coverage
 */
function letterToPhonemes(word: string): ARPAbetPhoneme[] {
  const phonemes: ARPAbetPhoneme[] = [];
  const chars = word.toLowerCase().split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];
    const prevChar = chars[i - 1];

    // Consonant digraphs
    if (char === 'c' && nextChar === 'h') {
      phonemes.push('CH');
      i++;
      continue;
    }
    if (char === 's' && nextChar === 'h') {
      phonemes.push('SH');
      i++;
      continue;
    }
    if (char === 't' && nextChar === 'h') {
      phonemes.push('TH');
      i++;
      continue;
    }
    if (char === 'n' && nextChar === 'g') {
      phonemes.push('NG');
      i++;
      continue;
    }

    // Vowel rules (simplified)
    if ('aeiou'.includes(char)) {
      switch (char) {
        case 'a':
          phonemes.push(nextChar === 'y' || nextChar === 'i' ? 'EY' : 'AE');
          break;
        case 'e':
          phonemes.push(nextChar === 'e' ? 'IY' : 'EH');
          break;
        case 'i':
          phonemes.push(nextChar === 'e' || i === chars.length - 1 ? 'AY' : 'IH');
          break;
        case 'o':
          phonemes.push(nextChar === 'o' || nextChar === 'w' ? 'OW' : 'AA');
          break;
        case 'u':
          phonemes.push(nextChar === 'e' ? 'UW' : 'AH');
          break;
      }
      continue;
    }

    // Consonants
    switch (char) {
      case 'b': phonemes.push('B'); break;
      case 'c': phonemes.push('K'); break;
      case 'd': phonemes.push('D'); break;
      case 'f': phonemes.push('F'); break;
      case 'g': phonemes.push('G'); break;
      case 'h': phonemes.push('HH'); break;
      case 'j': phonemes.push('JH'); break;
      case 'k': phonemes.push('K'); break;
      case 'l': phonemes.push('L'); break;
      case 'm': phonemes.push('M'); break;
      case 'n': phonemes.push('N'); break;
      case 'p': phonemes.push('P'); break;
      case 'q': phonemes.push('K'); break;
      case 'r': phonemes.push('R'); break;
      case 's': phonemes.push('S'); break;
      case 't': phonemes.push('T'); break;
      case 'v': phonemes.push('V'); break;
      case 'w': phonemes.push('W'); break;
      case 'x': phonemes.push('K', 'S'); break;
      case 'y': phonemes.push('Y'); break;
      case 'z': phonemes.push('Z'); break;
    }
  }

  return phonemes.length > 0 ? phonemes : ['SIL'];
}

/**
 * Convert text to phoneme sequence
 */
export function textToPhonemes(text: string): ARPAbetPhoneme[] {
  // Clean and normalize text
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, '') // Remove punctuation except hyphens and apostrophes
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return ['SIL'];
  }

  const words = cleaned.split(' ');
  const phonemes: ARPAbetPhoneme[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Skip empty words
    if (!word) continue;

    // Look up in dictionary first
    if (PHONEME_DICT[word]) {
      phonemes.push(...PHONEME_DICT[word]);
    } else {
      // Fall back to letter-to-phoneme rules
      phonemes.push(...letterToPhonemes(word));
    }

    // Add short silence between words
    if (i < words.length - 1) {
      phonemes.push('SIL');
    }
  }

  return phonemes.length > 0 ? phonemes : ['SIL'];
}

/**
 * Estimate phoneme durations based on phoneme type
 * Returns phonemes with timing information
 */
export function estimatePhonemeTimings(
  phonemes: ARPAbetPhoneme[],
  totalDurationMs: number
): PhonemeFrame[] {
  // Average duration weights for different phoneme types
  const durationWeights: Record<string, number> = {
    // Vowels (longer)
    'AA': 1.2, 'AE': 1.0, 'AH': 0.8, 'AO': 1.2, 'AW': 1.3, 'AY': 1.3,
    'EH': 1.0, 'ER': 1.1, 'EY': 1.3, 'IH': 0.9, 'IY': 1.2,
    'OW': 1.3, 'OY': 1.3, 'UH': 1.0, 'UW': 1.2,

    // Consonants (shorter)
    'B': 0.7, 'CH': 0.9, 'D': 0.7, 'DH': 0.8, 'F': 0.9, 'G': 0.7,
    'HH': 0.8, 'JH': 0.9, 'K': 0.7, 'L': 0.8, 'M': 0.9, 'N': 0.8,
    'NG': 0.9, 'P': 0.7, 'R': 0.8, 'S': 0.9, 'SH': 1.0, 'T': 0.6,
    'TH': 0.8, 'V': 0.8, 'W': 0.8, 'Y': 0.7, 'Z': 0.9, 'ZH': 1.0,

    // Silence
    'SIL': 0.5,
  };

  // Calculate total weight
  const totalWeight = phonemes.reduce((sum, phoneme) => {
    return sum + (durationWeights[phoneme] || 1.0);
  }, 0);

  // Distribute duration proportionally
  const frames: PhonemeFrame[] = [];
  let accumulatedTime = 0;

  for (let i = 0; i < phonemes.length; i++) {
    const phoneme = phonemes[i];
    const weight = durationWeights[phoneme] || 1.0;
    const duration = (weight / totalWeight) * totalDurationMs;

    frames.push({
      phoneme,
      duration: Math.max(50, Math.round(duration)), // Minimum 50ms per phoneme
    });

    accumulatedTime += duration;
  }

  // Adjust last frame to match exact total duration
  if (frames.length > 0) {
    const difference = totalDurationMs - accumulatedTime;
    frames[frames.length - 1].duration += Math.round(difference);
  }

  return frames;
}

/**
 * Convert text to timed phoneme sequence
 * @param text - Text to convert
 * @param durationMs - Total audio duration in milliseconds
 * @returns Array of phoneme frames with timing
 */
export function textToTimedPhonemes(text: string, durationMs: number): PhonemeFrame[] {
  const phonemes = textToPhonemes(text);
  return estimatePhonemeTimings(phonemes, durationMs);
}
