import { HDate, getHolidaysOnDate } from '@hebcal/core';

type HolidayRule = {
  label: string;
  matches: (name: string) => boolean;
};

const HOLIDAY_RULES: HolidayRule[] = [
  { label: 'ראש השנה', matches: (name) => name.startsWith('Rosh Hashana') && !name.includes('LaBehemot') },
  { label: 'יום כיפור', matches: (name) => name === 'Yom Kippur' },
  { label: 'סוכות', matches: (name) => name.startsWith('Sukkot') },
  { label: 'שמחת תורה', matches: (name) => name === 'Shmini Atzeret' || name === 'Simchat Torah' },
  { label: 'חנוכה', matches: (name) => name.startsWith('Chanukah') },
  { label: 'פורים', matches: (name) => name === 'Purim' },
  { label: 'פסח', matches: (name) => name.startsWith('Pesach') && !name.includes('Sheni') },
  { label: 'ל״ג בעומר', matches: (name) => name === 'Lag BaOmer' },
  { label: 'שבועות', matches: (name) => name === 'Shavuot' },
  { label: 'צום גדליה', matches: (name) => name.startsWith('Tzom Gedaliah') },
  { label: 'עשרה בטבת', matches: (name) => name.startsWith("Asara B'Tevet") },
  { label: 'תענית אסתר', matches: (name) => name.startsWith("Ta'anit Esther") },
  { label: 'י״ז בתמוז', matches: (name) => name.startsWith('Tzom Tammuz') },
  { label: 'תשעה באב', matches: (name) => name.startsWith("Tish'a B'Av") },
];

export function getHebrewDate(day: Date): string {
  return new HDate(day).renderGematriya(true, true);
}

export function getHolidayName(day: Date): string | null {
  const events = getHolidaysOnDate(day, true) ?? [];
  for (const event of events) {
    const rule = HOLIDAY_RULES.find((r) => r.matches(event.getDesc()));
    if (rule) return rule.label;
  }
  return null;
}