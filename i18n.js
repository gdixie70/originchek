import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
  en: {
    scan: 'Scan',
    history: 'History',
    analysis: 'Analysis',
    news: 'EU News',
    search: 'Search',
  },
  it: {
    scan: 'Scansiona',
    history: 'Storico',
    analysis: 'Analisi',
    news: 'Euro News',
    search: 'Cerca',
  },
});

i18n.locale = Localization.locale.split('-')[0];
i18n.fallbacks = true;

export default i18n;
