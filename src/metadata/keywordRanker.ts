export type KeywordGroup =
  | 'PRIMARY_SUBJECT'
  | 'SECONDARY_SUBJECT'
  | 'ACTION'
  | 'ENVIRONMENT'
  | 'OBJECT'
  | 'CONCEPT'
  | 'STYLE'
  | 'INDUSTRY'
  | 'USE_CASE'
  | 'TECHNICAL';

export interface ClassifiedKeyword {
  keyword: string;
  group: KeywordGroup;
  priorityScore: number;
}

// Common plural suffixes to normalize duplicates
function normalizeRoot(word: string): string {
  const clean = word.toLowerCase().trim();
  if (clean.endsWith('ies') && clean.length > 4) {
    return clean.slice(0, -3) + 'y';
  }
  if (clean.endsWith('es') && clean.length > 4) {
    return clean.slice(0, -2);
  }
  if (clean.endsWith('s') && clean.length > 3 && !clean.endsWith('ss')) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function deduplicateKeywords(keywords: string[]): string[] {
  const seenRoots = new Set<string>();
  const uniqueKeywords: string[] = [];

  for (const raw of keywords) {
    const clean = raw.toLowerCase().trim().replace(/^[^\w]+|[^\w]+$/g, '');
    if (!clean || clean.length < 2) continue;

    const root = normalizeRoot(clean);
    if (!seenRoots.has(root)) {
      seenRoots.add(root);
      uniqueKeywords.push(clean);
    }
  }

  return uniqueKeywords;
}

export function classifyKeyword(keyword: string, context: {
  subjects: string[];
  actions: string[];
  environments: string[];
  objects: string[];
  styles: string[];
  concepts: string[];
}): KeywordGroup {
  const kw = keyword.toLowerCase();

  // Match against known visual analysis elements
  if (context.subjects.some((s) => s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase()))) {
    return 'PRIMARY_SUBJECT';
  }
  if (context.actions.some((a) => a.toLowerCase().includes(kw) || kw.includes(a.toLowerCase()))) {
    return 'ACTION';
  }
  if (context.environments.some((e) => e.toLowerCase().includes(kw) || kw.includes(e.toLowerCase()))) {
    return 'ENVIRONMENT';
  }
  if (context.styles.some((st) => st.toLowerCase().includes(kw) || kw.includes(st.toLowerCase()))) {
    return 'STYLE';
  }
  if (context.concepts.some((c) => c.toLowerCase().includes(kw) || kw.includes(c.toLowerCase()))) {
    return 'CONCEPT';
  }
  if (context.objects.some((o) => o.toLowerCase().includes(kw) || kw.includes(o.toLowerCase()))) {
    return 'OBJECT';
  }

  // Heuristics
  if (/^(3d|render|vector|photo|illustration|cinematic|digital)/.test(kw)) {
    return 'STYLE';
  }
  if (/(technology|business|medical|finance|education|corporate|travel|industry)/.test(kw)) {
    return 'INDUSTRY';
  }
  if (/(banner|background|wallpaper|template|copyspace|copy space)/.test(kw)) {
    return 'USE_CASE';
  }
  if (/(growth|success|urgency|freedom|innovation|teamwork|creativity|solitude|speed|journey)/.test(kw)) {
    return 'CONCEPT';
  }

  return 'TECHNICAL';
}

export function rankKeywords(
  keywords: string[],
  context: {
    subjects: string[];
    actions: string[];
    environments: string[];
    objects: string[];
    styles: string[];
    concepts: string[];
  },
  targetCount = 30
): { ranked: string[]; classified: ClassifiedKeyword[] } {
  const deduplicated = deduplicateKeywords(keywords);

  // Classify each keyword
  const classified: ClassifiedKeyword[] = deduplicated.map((kw) => {
    const group = classifyKeyword(kw, context);
    let priorityScore = 50;

    switch (group) {
      case 'PRIMARY_SUBJECT':
        priorityScore = 100;
        break;
      case 'ACTION':
        priorityScore = 95;
        break;
      case 'CONCEPT':
        priorityScore = 90;
        break;
      case 'ENVIRONMENT':
        priorityScore = 85;
        break;
      case 'SECONDARY_SUBJECT':
        priorityScore = 80;
        break;
      case 'OBJECT':
        priorityScore = 75;
        break;
      case 'STYLE':
        priorityScore = 70;
        break;
      case 'INDUSTRY':
        priorityScore = 65;
        break;
      case 'USE_CASE':
        priorityScore = 60;
        break;
      case 'TECHNICAL':
      default:
        priorityScore = 40;
        break;
    }

    return { keyword: kw, group, priorityScore };
  });

  // Sort by priorityScore descending while maintaining organic variety
  classified.sort((a, b) => b.priorityScore - a.priorityScore);

  const finalRanked = classified.map((c) => c.keyword).slice(0, Math.min(49, Math.max(20, targetCount)));

  return {
    ranked: finalRanked,
    classified: classified.slice(0, finalRanked.length),
  };
}
