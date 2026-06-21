export interface HebrewWord {
  id: string;
  hebrew: string;
  romanized: string;
  meaning: string;
  emoji: string;
  pronunciation: string;
}

export const WORDS: HebrewWord[] = [
  { id: 'av', hebrew: 'אב', romanized: 'av', meaning: 'father', emoji: '👨', pronunciation: 'אָב' },
  { id: 'em', hebrew: 'אם', romanized: 'em', meaning: 'mother', emoji: '👩', pronunciation: 'אֵם' },
  { id: 'bayit', hebrew: 'בית', romanized: 'bayit', meaning: 'house', emoji: '🏠', pronunciation: 'בַּיִת' },
  { id: 'kelev', hebrew: 'כלב', romanized: 'kelev', meaning: 'dog', emoji: '🐕', pronunciation: 'כֶּלֶב' },
  { id: 'chatul', hebrew: 'חתול', romanized: 'chatul', meaning: 'cat', emoji: '🐱', pronunciation: 'חָתוּל' },
  { id: 'yad', hebrew: 'יד', romanized: 'yad', meaning: 'hand', emoji: '✋', pronunciation: 'יָד' },
  { id: 'shemesh', hebrew: 'שמש', romanized: 'shemesh', meaning: 'sun', emoji: '☀️', pronunciation: 'שֶׁמֶשׁ' },
  { id: 'mayim', hebrew: 'מים', romanized: 'mayim', meaning: 'water', emoji: '💧', pronunciation: 'מַיִם' },
  { id: 'sefer', hebrew: 'ספר', romanized: 'sefer', meaning: 'book', emoji: '📚', pronunciation: 'סֵפֶר' },
  { id: 'aretz', hebrew: 'ארץ', romanized: 'aretz', meaning: 'land', emoji: '🌍', pronunciation: 'אֶרֶץ' },
  { id: 'yeled', hebrew: 'ילד', romanized: 'yeled', meaning: 'boy', emoji: '👦', pronunciation: 'יֶלֶד' },
  { id: 'yaldah', hebrew: 'ילדה', romanized: 'yaldah', meaning: 'girl', emoji: '👧', pronunciation: 'יַלְדָּה' },
  { id: 'dag', hebrew: 'דג', romanized: 'dag', meaning: 'fish', emoji: '🐟', pronunciation: 'דָּג' },
  { id: 'orez', hebrew: 'אורז', romanized: 'orez', meaning: 'rice', emoji: '🍚', pronunciation: 'אוֹרֶז' },
  { id: 'lev', hebrew: 'לב', romanized: 'lev', meaning: 'heart', emoji: '❤️', pronunciation: 'לֵב' },
];
