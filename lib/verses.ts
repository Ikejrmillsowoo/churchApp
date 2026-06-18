// lib/verses.ts — curated list of scripture references to rotate through, one per day.
// The daily cron job (Phase 6) fetches the day's reference from bible-api.com and caches it.
export const CURATED_REFERENCES: string[] = [
  "John 3:16",
  "Psalm 23:1",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Romans 8:28",
  "Proverbs 3:5",
  "Isaiah 41:10",
  "Matthew 11:28",
  "Joshua 1:9",
  "Psalm 46:1",
  "Philippians 4:6",
  "2 Corinthians 5:7",
  "1 Corinthians 13:4",
  "Galatians 5:22",
  "Ephesians 2:8",
  "Romans 12:2",
  "Psalm 119:105",
  "Hebrews 11:1",
  "James 1:5",
  "1 Peter 5:7",
  "Matthew 6:33",
  "John 14:6",
  "Psalm 27:1",
  "Isaiah 40:31",
  "Romans 5:8",
  "Lamentations 3:22",
  "Psalm 37:4",
  "Colossians 3:23",
  "1 John 4:19",
  "Micah 6:8",
  "Psalm 91:1",
  "Matthew 5:16",
  "2 Timothy 1:7",
  "Romans 15:13",
  "Psalm 34:8",
  "Deuteronomy 31:6",
  "John 16:33",
  "Psalm 121:1",
  "Proverbs 16:3",
  "1 Thessalonians 5:16",
];

// Deterministically pick the reference for a given date (rotates daily).
export function getReferenceForDate(date: Date): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return CURATED_REFERENCES[
    ((dayIndex % CURATED_REFERENCES.length) + CURATED_REFERENCES.length) %
      CURATED_REFERENCES.length
  ];
}
