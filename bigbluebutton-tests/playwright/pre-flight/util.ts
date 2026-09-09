import { ClientSettingsOverrides, InitOptionsProps } from '../core/page';

// Pinned in both directions so the suite doesn't depend on the deployment's own
// value: with the setting on, a page expecting the regular flow never reaches it.
const preFlightSettings = (enabled: boolean): ClientSettingsOverrides => ({
  public: {
    app: {
      preFlight: {
        enabled,
      },
    },
  },
});

export const PRE_FLIGHT_SETTINGS_OVERRIDE = preFlightSettings(true);

export const PRE_FLIGHT_DISABLED_SETTINGS_OVERRIDE = preFlightSettings(false);

// None of init()'s post-join steps (layout wait, audio modal) exist yet: they are
// asserted by the page object once the join is confirmed.
export const PRE_FLIGHT_INIT_OPTIONS: InitOptionsProps = {
  shouldCheckAllInitialSteps: false,
  shouldCloseAudioModal: false,
  clientSettingsOverrides: PRE_FLIGHT_SETTINGS_OVERRIDE,
};

export const NO_PRE_FLIGHT_INIT_OPTIONS: InitOptionsProps = {
  clientSettingsOverrides: PRE_FLIGHT_DISABLED_SETTINGS_OVERRIDE,
};
