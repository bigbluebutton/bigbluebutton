const APP_CONFIG = Meteor.settings.public.app;
const NUMERAL_TYPE = APP_CONFIG.numeralType;

// List of locales which should display only Eastern Arabic numerals
const EasternArabicLocales = [
  'ar-BH',
  'ar-EG',
  'ar-IQ',
  'ar-JO',
  'ar-KW',
  'ar-OM',
  'ar-QA',
  'ar-SA',
  'ar-SY',
  'ar-AE',
  'ar-YE',
  'ar',
];

const useLocale = () => {
  const ARABIC = 'en-US';
  const EASTERN_ARABIC = 'ar-EG';

  switch (NUMERAL_TYPE) {
    case 'auto':
      if (EasternArabicLocales.includes(navigator.language)) return EASTERN_ARABIC;
      return ARABIC;
    case 'eastern_arabic':
      return EASTERN_ARABIC;
    case 'default':
    default:
      return ARABIC;
  }
};

const formatNumber = (n, type = 'number') => {
  const ops = {};
  if (type === 'percent') {
    ops.style = type;
    ops.minimumFractionDigits = 0;
    ops.maximumFractionDigits = 0;
  }
  return new Intl.NumberFormat(useLocale(), ops).format(n);
};

const formatDateTime = (dt, type = 'date') => {
  const ops = {};
  if (type = 'time') {
    ops.hour = 'numeric';
    ops.minute = 'numeric';
    ops.second = 'numeric';
  }
  return new Intl.DateTimeFormat(useLocale(), ops).format(dt);
};

const convertToWestern = s => Number(s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => d.charCodeAt(0) - 1632));


const isEasternArabic = s => s.toString().match(/^[٠١٢٣٤٥٦٧٨٩]*$/);


export {
  formatNumber,
  formatDateTime,
  isEasternArabic,
  convertToWestern,
};
