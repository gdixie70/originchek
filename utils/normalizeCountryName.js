// utils/normalizeCountryName.js
import countryVariants from './countryVariants';

const normalizeCountryName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return rawName;

  const key = rawName
    .trim()
    .toLowerCase()
    .normalize('NFD')                    // rimuove accenti
    .replace(/[\u0300-\u036f]/g, '');

  return countryVariants[key] || rawName;
};

export default normalizeCountryName;
