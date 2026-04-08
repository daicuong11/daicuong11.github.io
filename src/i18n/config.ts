import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

const resources = {
  en: {
    translation: enTranslations
  },
  vi: {
    translation: viTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    /** Ngôn ngữ mặc định: vi; thiếu key trong vi thì lấy từ en */
    fallbackLng: { default: ['vi', 'en'] },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      /** Chỉ đọc lựa chọn đã lưu; lần đầu vào không theo navigator → mặc định vi */
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  });

export default i18n;
