export interface Letter {
  id: string;
  name: string;
  hebrew: string;
  hebrewCursive: string;
  pronunciation: string;
  phonetic: string;
  isSofit: boolean;
  sofit?: string;
}

export const LETTERS: Letter[] = [
  { id: 'alef', name: 'Alef', hebrew: 'א', hebrewCursive: '𐳀', pronunciation: 'אָלֶף', phonetic: 'silent / ah', isSofit: false },
  { id: 'beit', name: 'Beit', hebrew: 'בּ', hebrewCursive: 'בּ', pronunciation: 'בֵּית', phonetic: 'b as in boy', isSofit: false },
  { id: 'veit', name: 'Veit', hebrew: 'ב', hebrewCursive: 'ב', pronunciation: 'בֵית', phonetic: 'v as in van', isSofit: false },
  { id: 'gimel', name: 'Gimel', hebrew: 'ג', hebrewCursive: 'ג', pronunciation: 'גִּימֶל', phonetic: 'g as in go', isSofit: false },
  { id: 'dalet', name: 'Dalet', hebrew: 'ד', hebrewCursive: 'ד', pronunciation: 'דָּלֶת', phonetic: 'd as in dog', isSofit: false },
  { id: 'hei', name: 'Hei', hebrew: 'ה', hebrewCursive: 'ה', pronunciation: 'הֵא', phonetic: 'h as in hello', isSofit: false },
  { id: 'vav', name: 'Vav', hebrew: 'ו', hebrewCursive: 'ו', pronunciation: 'וָו', phonetic: 'v / w as in vine', isSofit: false },
  { id: 'zayin', name: 'Zayin', hebrew: 'ז', hebrewCursive: 'ז', pronunciation: 'זַיִן', phonetic: 'z as in zoo', isSofit: false },
  { id: 'chet', name: 'Chet', hebrew: 'ח', hebrewCursive: 'ח', pronunciation: 'חֵית', phonetic: 'ch (guttural)', isSofit: false },
  { id: 'tet', name: 'Tet', hebrew: 'ט', hebrewCursive: 'ט', pronunciation: 'טֵית', phonetic: 't as in top', isSofit: false },
  { id: 'yud', name: 'Yud', hebrew: 'י', hebrewCursive: 'י', pronunciation: 'יוֹד', phonetic: 'y as in yes', isSofit: false },
  { id: 'kaf', name: 'Kaf', hebrew: 'כּ', hebrewCursive: 'כּ', pronunciation: 'כַּף', phonetic: 'k as in kite', isSofit: false },
  { id: 'chaf', name: 'Chaf', hebrew: 'כ', hebrewCursive: 'כ', pronunciation: 'כַף', phonetic: 'ch (guttural)', isSofit: false },
  { id: 'final-chaf', name: 'Final Chaf', hebrew: 'ך', hebrewCursive: 'ך', pronunciation: 'כַף סוֹפִית', phonetic: 'ch (end of word)', isSofit: true },
  { id: 'lamed', name: 'Lamed', hebrew: 'ל', hebrewCursive: 'ל', pronunciation: 'לָמֶד', phonetic: 'l as in lamp', isSofit: false },
  { id: 'mem', name: 'Mem', hebrew: 'מ', hebrewCursive: 'מ', pronunciation: 'מֵם', phonetic: 'm as in moon', isSofit: false },
  { id: 'final-mem', name: 'Final Mem', hebrew: 'ם', hebrewCursive: 'ם', pronunciation: 'מֵם סוֹפִית', phonetic: 'm (end of word)', isSofit: true },
  { id: 'nun', name: 'Nun', hebrew: 'נ', hebrewCursive: 'נ', pronunciation: 'נוּן', phonetic: 'n as in now', isSofit: false },
  { id: 'final-nun', name: 'Final Nun', hebrew: 'ן', hebrewCursive: 'ן', pronunciation: 'נוּן סוֹפִית', phonetic: 'n (end of word)', isSofit: true },
  { id: 'samech', name: 'Samech', hebrew: 'ס', hebrewCursive: 'ס', pronunciation: 'סָמֶך', phonetic: 's as in sun', isSofit: false },
  { id: 'ayin', name: 'Ayin', hebrew: 'ע', hebrewCursive: 'ע', pronunciation: 'עַיִן', phonetic: 'silent / guttural', isSofit: false },
  { id: 'pei', name: 'Pei', hebrew: 'פּ', hebrewCursive: 'פּ', pronunciation: 'פֵּא', phonetic: 'p as in pop', isSofit: false },
  { id: 'fei', name: 'Fei', hebrew: 'פ', hebrewCursive: 'פ', pronunciation: 'פֵא', phonetic: 'f as in fun', isSofit: false },
  { id: 'final-fei', name: 'Final Fei', hebrew: 'ף', hebrewCursive: 'ף', pronunciation: 'פֵא סוֹפִית', phonetic: 'f (end of word)', isSofit: true },
  { id: 'tzadik', name: 'Tzadik', hebrew: 'צ', hebrewCursive: 'צ', pronunciation: 'צַדִּיק', phonetic: 'tz as in pizza', isSofit: false },
  { id: 'final-tzadik', name: 'Final Tzadik', hebrew: 'ץ', hebrewCursive: 'ץ', pronunciation: 'צַדִּיק סוֹפִית', phonetic: 'tz (end of word)', isSofit: true },
  { id: 'kuf', name: 'Kuf', hebrew: 'ק', hebrewCursive: 'ק', pronunciation: 'קוּף', phonetic: 'k as in king', isSofit: false },
  { id: 'reish', name: 'Reish', hebrew: 'ר', hebrewCursive: 'ר', pronunciation: 'רֵישׁ', phonetic: 'r (rolled)', isSofit: false },
  { id: 'shin', name: 'Shin', hebrew: 'שׁ', hebrewCursive: 'שׁ', pronunciation: 'שִׁין', phonetic: 'sh as in ship', isSofit: false },
  { id: 'sin', name: 'Sin', hebrew: 'שׂ', hebrewCursive: 'שׂ', pronunciation: 'שִׂין', phonetic: 's as in sun', isSofit: false },
  { id: 'tav', name: 'Tav', hebrew: 'תּ', hebrewCursive: 'תּ', pronunciation: 'תָּו', phonetic: 't as in tall', isSofit: false },
  { id: 'sav', name: 'Sav', hebrew: 'ת', hebrewCursive: 'ת', pronunciation: 'תָו', phonetic: 's as in sun', isSofit: false },
];

export const LEVEL1_LETTERS = LETTERS.filter(l => !l.isSofit).slice(0, 22);
export const LEVEL2_LETTERS = LETTERS;
