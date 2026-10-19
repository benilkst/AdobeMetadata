import { StockMetadata, QualityWarning } from '../types';

// Known commercial brands & trademarks
const BANNED_BRANDS = [
  'apple', 'iphone', 'ipad', 'macbook', 'nike', 'adidas', 'puma', 'coca-cola',
  'coke', 'pepsi', 'starbucks', 'mcdonalds', 'microsoft', 'windows', 'sony',
  'playstation', 'nintendo', 'disney', 'pixar', 'marvel', 'dc comics', 'star wars',
  'lego', 'barbie', 'ferrari', 'bmw', 'mercedes', 'tesla', 'audi', 'gucci', 'prada',
  'chanel', 'louis vuitton', 'rolex', 'gta', 'grand theft auto', 'fortnite',
  'minecraft', 'pokemon', 'playstation', 'xbox'
];

// Fictional copyrighted characters
const BANNED_CHARACTERS = [
  'mickey mouse', 'donald duck', 'spider-man', 'spiderman', 'batman', 'superman',
  'iron man', 'pikachu', 'mario', 'sonic', 'elsa', 'yoda', 'goku',
  'harry potter', 'shrek', 'buzz lightyear', 'woody', 'barbie', 'darth vader',
  'luke skywalker', 'wolverine', 'hulk', 'captain america', 'thor'
];

// Recognized artist names & style references
const BANNED_ARTISTS = [
  'van gogh', 'picasso', 'monet', 'da vinci', 'rembrandt', 'salvador dali', 'dali',
  'andy warhol', 'warhol', 'greg rutkowski', 'studio ghibli', 'ghibli', 'makoto shinkai',
  'artgerm', 'alphonse mucha', 'mucha', 'banksy'
];

// Celebrities & public figures
const BANNED_CELEBRITIES = [
  'tom cruise', 'taylor swift', 'elon musk', 'keanu reeves', 'brad pitt',
  'leonardo dicaprio', 'zendaya', 'cristiano ronaldo', 'lionel messi',
  'dwayne johnson', 'the rock', 'kanye west', 'beyonce', 'rihanna', 'bill gates'
];

// Promotional & technical render buzzwords
const SPAM_TERMS = [
  '4k', '8k', 'ultra hd', 'photorealistic', 'hyperrealistic', 'trending on artstation',
  'unreal engine', 'octane render', 'masterpiece', 'award winning', 'best quality',
  'best', 'amazing', 'stunning', 'hq', 'hd wallpaper'
];

// Overly generic keywords that reduce stock relevance
const OVERLY_GENERIC_KEYWORDS = [
  'image', 'picture', 'photo', 'photograph', 'stock', 'file', 'asset', 'graphic',
  'stuff', 'thing', 'background picture', 'desktop', 'screen'
];

export function checkIpCompliance(metadata: StockMetadata): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  const allText = `${metadata.title} ${metadata.description}`.toLowerCase();
  const keywordsLower = metadata.keywords.map((k) => k.toLowerCase().trim());

  // 1. Check Brands in title, description, and keywords
  for (const brand of BANNED_BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(allText) || keywordsLower.includes(brand)) {
      warnings.push({
        level: 'red',
        code: 'POTENTIAL_TRADEMARK_BRAND',
        keyword: brand,
        message: `Potential third-party brand or trademark reference detected: "${brand}".`,
        recommendation: `Possible third-party intellectual property reference. Remove "${brand}" or replace with a generic visual description.`,
      });
    }
  }

  // 2. Check Copyrighted Characters
  for (const char of BANNED_CHARACTERS) {
    const regex = new RegExp(`\\b${char}\\b`, 'i');
    if (regex.test(allText) || keywordsLower.includes(char)) {
      warnings.push({
        level: 'red',
        code: 'POTENTIAL_CHARACTER_COPYRIGHT',
        keyword: char,
        message: `Potential copyrighted character reference detected: "${char}".`,
        recommendation: `Adobe Stock rejects recognizable intellectual property. Remove or replace with generic original character terms.`,
      });
    }
  }

  // 3. Check Artist References
  for (const artist of BANNED_ARTISTS) {
    const regex = new RegExp(`\\b${artist}\\b`, 'i');
    if (regex.test(allText) || keywordsLower.includes(artist)) {
      warnings.push({
        level: 'red',
        code: 'POTENTIAL_ARTIST_REFERENCE',
        keyword: artist,
        message: `Potential artist style reference detected: "${artist}".`,
        recommendation: `Describe the aesthetic qualities directly (e.g., "impressionist painting style") without naming individual artists.`,
      });
    }
  }

  // 4. Check Celebrities
  for (const celeb of BANNED_CELEBRITIES) {
    const regex = new RegExp(`\\b${celeb}\\b`, 'i');
    if (regex.test(allText) || keywordsLower.includes(celeb)) {
      warnings.push({
        level: 'red',
        code: 'POTENTIAL_CELEBRITY_REFERENCE',
        keyword: celeb,
        message: `Potential celebrity name detected: "${celeb}".`,
        recommendation: `Commercial stock cannot use celebrity likenesses or names without express releases. Remove "${celeb}".`,
      });
    }
  }

  // 5. Check Promotional & Spam Terms
  for (const spam of SPAM_TERMS) {
    const regex = new RegExp(`\\b${spam}\\b`, 'i');
    if (regex.test(allText) || keywordsLower.includes(spam)) {
      warnings.push({
        level: 'yellow',
        code: 'PROMOTIONAL_KEYWORD_SPAM',
        keyword: spam,
        message: `Subjective or promotional buzzword detected: "${spam}".`,
        recommendation: `Adobe Stock prefers strictly objective metadata. Avoid quality claims or rendering engines like "${spam}".`,
      });
    }
  }

  // 6. Check Overly Generic Keywords
  for (const generic of OVERLY_GENERIC_KEYWORDS) {
    if (keywordsLower.includes(generic)) {
      warnings.push({
        level: 'yellow',
        code: 'OVERLY_GENERIC_KEYWORD',
        keyword: generic,
        message: `Overly generic keyword detected: "${generic}".`,
        recommendation: `Remove generic filler terms like "${generic}" and replace with descriptive context to optimize buyer search results.`,
      });
    }
  }

  // 7. Check Duplicate Keywords
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const kw of keywordsLower) {
    if (seen.has(kw)) {
      duplicates.add(kw);
    }
    seen.add(kw);
  }
  if (duplicates.size > 0) {
    warnings.push({
      level: 'yellow',
      code: 'DUPLICATE_KEYWORDS',
      message: `Duplicate keywords found: ${Array.from(duplicates).join(', ')}.`,
      recommendation: 'Remove duplicate keywords to maximize your unique search visibility.',
    });
  }

  // 8. Keyword Count Bounds
  if (metadata.keywords.length < 15) {
    warnings.push({
      level: 'yellow',
      code: 'LOW_KEYWORD_COUNT',
      message: `Keyword count (${metadata.keywords.length}) is below recommended 20–35 range.`,
      recommendation: 'Add supporting conceptual, environmental, and stylistic keywords for better discoverability.',
    });
  } else if (metadata.keywords.length > 49) {
    warnings.push({
      level: 'red',
      code: 'EXCEEDS_MAX_KEYWORDS',
      message: `Keyword count (${metadata.keywords.length}) exceeds Adobe Stock maximum limit of 49.`,
      recommendation: 'Trim keywords to keep only the highest-intent terms within the 49 keyword limit.',
    });
  }

  // Green reassurance if clean
  if (warnings.length === 0) {
    warnings.push({
      level: 'green',
      code: 'METADATA_COMPLIANT',
      message: 'Metadata appears consistent with Adobe Stock contributor guidelines.',
      recommendation: 'All compliance checks passed nominal inspection.',
    });
  }

  return warnings;
}
