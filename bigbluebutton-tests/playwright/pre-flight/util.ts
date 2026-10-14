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

// Pinned: muteOnStart seeds the microphone toggle, so the server's default
// would decide whether "joins unmuted" and "joins muted" hold.
export const PRE_FLIGHT_CREATE_PARAMETER = 'muteOnStart=false';

export const NO_PRE_FLIGHT_INIT_OPTIONS: InitOptionsProps = {
  clientSettingsOverrides: PRE_FLIGHT_DISABLED_SETTINGS_OVERRIDE,
};

// Listen only is off on LiveKit and on by default elsewhere: pinned off, the
// denied microphone's way past is "Continue without microphone" on any bridge.
export const NO_LISTEN_ONLY_JOIN_PARAMETER = 'userdata-bbb_listen_only_mode=false';

// Listen only needs the legacy bridge, LiveKit never offers it.
export const LISTEN_ONLY_CREATE_PARAMETER = `${PRE_FLIGHT_CREATE_PARAMETER}&audioBridge=bbb-webrtc-sfu`;

export type DeviceKind = 'audio' | 'video';

export interface DevicePermissionControl {
  // Answers served as a refusal, per device: the positive control that the
  // denial reached the client at all.
  refusals: Record<DeviceKind, number>;
  // notify: as a grant made in the site settings, which fires the permission's
  // change event; without it, as a prompt accepted on a retry.
  grant: (kind: DeviceKind, notify: boolean) => void;
}

declare global {
  interface Window {
    preFlightPermissions: DevicePermissionControl;
  }
}

// Init script: the browser refuses the given devices. Only the microphone and
// camera permission queries and the getUserMedia calls asking for a refused
// device are touched; everything else, the grant included, runs for real.
export const refuseDevices = (refused: Record<DeviceKind, boolean>) => {
  const state = { ...refused };
  const refusals: Record<DeviceKind, number> = { audio: 0, video: 0 };
  const statuses: { kind: DeviceKind; status: PermissionStatus }[] = [];
  const kinds: Record<string, DeviceKind> = { microphone: 'audio', camera: 'video' };

  const query = navigator.permissions.query.bind(navigator.permissions);
  navigator.permissions.query = (descriptor: PermissionDescriptor) => {
    const kind = kinds[descriptor.name];
    if (!kind) return query(descriptor);
    if (state[kind]) refusals[kind] += 1;
    const events = new EventTarget();
    const status: PermissionStatus = {
      name: descriptor.name,
      get state() {
        return state[kind] ? 'denied' : 'granted';
      },
      onchange: null,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      dispatchEvent: events.dispatchEvent.bind(events),
    };
    statuses.push({ kind, status });
    return Promise.resolve(status);
  };

  const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = (constraints?: MediaStreamConstraints) => {
    const asked = (['audio', 'video'] as DeviceKind[]).filter((kind) => constraints?.[kind] && state[kind]);
    if (asked.length) {
      asked.forEach((kind) => {
        refusals[kind] += 1;
      });
      return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
    }
    return getUserMedia(constraints);
  };

  window.preFlightPermissions = {
    refusals,
    grant: (kind, notify) => {
      state[kind] = false;
      if (!notify) return;
      statuses
        .filter((entry) => entry.kind === kind)
        .forEach(({ status }) => {
          const event = new Event('change');
          status.dispatchEvent(event);
          status.onchange?.(event);
        });
    },
  };
};
