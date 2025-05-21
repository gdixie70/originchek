import normalizeCountryName from './normalizeCountryName';

const EU_COUNTRIES = [
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary',
  'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg', 'malta',
  'netherlands', 'poland', 'portugal', 'romania', 'slovakia', 'slovenia',
  'spain', 'sweden'
];

const traduzioni = {
  'france': 'Francia',
  'united kingdom': 'Regno Unito',
  'germany': 'Germania',
  'italy': 'Italia',
  'spain': 'Spagna',
  'netherlands': 'Paesi Bassi',
  'belgium': 'Belgio',
  'poland': 'Polonia',
  'romania': 'Romania',
  'luxembourg': 'Lussemburgo',
  'switzerland': 'Svizzera',
  'united states': 'Stati Uniti',
  'india': 'India',
  'morocco': 'Marocco',
  'philippines': 'Filippine',
  'turkey': 'Turchia'
};

export function calcolaOrigineEuropa(countriesString) {
  if (!countriesString) return { percentualeEU: 0, paesi: [], percentuali: [] };

  const paesiRaw = countriesString
    .split(',')
    .map(p => p.trim().replace(/^..:/, '')) // pulizia
    .filter(p => p !== '');

  const normalizedPaesi = paesiRaw.map(p => normalizeCountryName(p));
  const lowercased = normalizedPaesi.map(p => p.toLowerCase());

  const totale = normalizedPaesi.length;
  if (totale === 0) return { percentualeEU: 0, paesi: [], percentuali: [] };

  const countEU = lowercased.filter(p => EU_COUNTRIES.includes(p)).length;
  const percentualeEU = Math.round((countEU / totale) * 100);
  const quota = Math.round(100 / totale);

  const percentuali = normalizedPaesi.map(norm => ({
    country: traduzioni[norm.toLowerCase()] || capitalize(norm),
    percentage: quota
  }));

  return {
    percentualeEU,
    paesi: percentuali.map(p => p.country),
    percentuali
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
