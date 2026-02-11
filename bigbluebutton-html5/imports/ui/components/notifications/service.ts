import { makeVar } from '@apollo/client';
import { Notification } from './queries';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { throttle } from '/imports/utils/throttle';

const GUEST_WAITING_BELL_THROTTLE_TIME = 10000;

const lastLayoutUpdateNotification = makeVar(new Date().getTime());

export const NotifyPublishedPoll = (
  notification: Notification,
  notifier: (notification: Notification) => void,
  isModerator: boolean,
  presenter: boolean,
) => {
  if (
    (presenter || isModerator)
  ) {
    notifier(notification);
  }
};

function ringGuestWaitingBell() {
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - JS code
  if (Settings.application.guestWaitingAudioAlerts) {
    const CDN = window.meetingClientSettings.public.app.cdn;
    const BASENAME = window.meetingClientSettings.public.app.basename;
    const HOST = CDN + BASENAME;

    const audio = new Audio(`${HOST}/resources/sounds/doorbell.mp3`);
    audio.play();
  }
}

const ringGuestWaitingBellThrottled = throttle(
  ringGuestWaitingBell,
  GUEST_WAITING_BELL_THROTTLE_TIME,
  { leading: true, trailing: false },
);

export const pendingGuestAlert = (
  notification: Notification,
  notifier: (notification: Notification) => void,
) => {
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - JS code
  if (Settings.application.guestWaitingPushAlerts) {
    notifier(notification);
  }

  ringGuestWaitingBellThrottled();
};

export const userJoinPushAlert = (
  notification: Notification,
  notifier: (notification: Notification) => void,
) => {
  const Settings = getSettingsSingletonInstance();
  const {
    userJoinAudioAlerts,
    userJoinPushAlerts,
    // @ts-ignore - JS code
  } = Settings.application;

  if (!userJoinAudioAlerts && !userJoinPushAlerts) return;

  if (userJoinAudioAlerts) {
    new Audio(`${window.meetingClientSettings.public.app.cdn
      + window.meetingClientSettings.public.app.basename}`
      + '/resources/sounds/userJoin.mp3').play();
  }

  if (userJoinPushAlerts) {
    notifier(notification);
  }
};

const playLeaveAudioAlert = throttle(() => {
  new Audio(`${window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename}`
    + '/resources/sounds/userJoin.mp3').play();
}, 500, { leading: true, trailing: false });

export const userLeavePushAlert = (
  notification: Notification,
  notifier: (notification: Notification) => void,
) => {
  const Settings = getSettingsSingletonInstance();
  const {
    userLeaveAudioAlerts,
    userLeavePushAlerts,
    // @ts-ignore - JS code
  } = Settings.application;

  if (!userLeaveAudioAlerts && !userLeavePushAlerts) return;

  if (userLeaveAudioAlerts) {
    playLeaveAudioAlert();
  }

  if (userLeavePushAlerts) {
    notifier(notification);
  }
};

export const layoutUpdate = (
  notification: Notification,
  notifier: (notification: Notification) => void,
) => {
  const last = new Date(lastLayoutUpdateNotification()).getTime();
  const now = new Date().getTime();
  if (now - last < 1000) {
    return;
  }
  lastLayoutUpdateNotification(now);
  notifier(notification);
};

export default {
  NotifyPublishedPoll,
  pendingGuestAlert,
  userJoinPushAlert,
  userLeavePushAlert,
  layoutUpdate,
};
