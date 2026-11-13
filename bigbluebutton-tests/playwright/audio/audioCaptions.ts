import { ClientSettingsOverrides } from '../core/page';

// public.app.audioCaptions.language.locale takes a BCP-47 tag, 'browserLanguage' or 'disabled'.
export function audioCaptionsOverrides(locale: string, defaultSelectLocale = true): ClientSettingsOverrides {
  return {
    public: {
      app: {
        audioCaptions: {
          enabled: true,
          provider: 'webspeech',
          language: { defaultSelectLocale, locale },
        },
      },
    },
  };
}
