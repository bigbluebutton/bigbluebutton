import { makeVar } from '@apollo/client';
import { Notification } from './queries';
import Settings from '/imports/ui/services/settings';
import { throttle } from '/imports/utils/throttle';

const CDN = window.meetingClientSettings.public.app.cdn;
const BASENAME = window.meetingClientSettings.public.app.basename;
const HOST = CDN + BASENAME;
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
  // @ts-ignore - JS code
  if (Settings.application.guestWaitingAudioAlerts) {
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
  const {
    userJoinAudioAlerts,
    userJoinPushAlerts,
    // @ts-ignore - JS code
  } = Settings.application;

  if (!userJoinAudioAlerts && !userJoinPushAlerts) return;

  if (userJoinAudioAlerts) {
    new Audio(`${window.meetingClientSettings.public.app.cdn
      + window.meetingClientSettings.public.app.basename
      + window.meetingClientSettings.public.app.instanceId}`
      + '/resources/sounds/userJoin.mp3').play();
  }

  if (userJoinPushAlerts) {
    notifier(notification);
  }
};

export const userLeavePushAlert = (
  notification: Notification,
  notifier: (notification: Notification) => void,
) => {
  const {
    userLeaveAudioAlerts,
    userLeavePushAlerts,
    // @ts-ignore - JS code
  } = Settings.application;

  if (!userLeaveAudioAlerts && !userLeavePushAlerts) return;

  if (userLeaveAudioAlerts) {
    new Audio(`${window.meetingClientSettings.public.app.cdn
      + window.meetingClientSettings.public.app.basename
      + window.meetingClientSettings.public.app.instanceId}`
      + '/resources/sounds/userJoin.mp3').play();
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
