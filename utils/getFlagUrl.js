// utils/getFlagUrl.js
import countryMap from './country_name_to_iso2.json';
import noFlag from '../assets/flags/no-flag.png';
import normalizeCountryName from './normalizeCountryName';

const getFlagUrl = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return noFlag;

  // 1. Normalizza il nome (es. 'frança' → 'France')
  const normalized = normalizeCountryName(rawName);

  // 2. Cerca la versione lowercase nel mapping ISO
  const key = normalized.toLowerCase();
  const isoCode = countryMap[key];

  return isoCode ? `https://flagcdn.com/w320/${isoCode}.png` : noFlag;
};

export default getFlagUrl;
