import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import ru from './ru.json';
import ptBR from './pt-BR.json';

const fallbackLng = 'en';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  'pt-BR': { translation: ptBR },
};

const deviceLocale = Localization.getLocales()[0]?.languageTag ?? fallbackLng;
const resolved =
  deviceLocale.startsWith('pt') ? 'pt-BR'
  : deviceLocale.startsWith('ru') ? 'ru'
  : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: resolved,
  fallbackLng,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

export default i18n;
