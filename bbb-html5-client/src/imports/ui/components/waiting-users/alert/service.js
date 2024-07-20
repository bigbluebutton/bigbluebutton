import React from 'react';
import { throttle } from '/imports/utils/throttle';
import { notify } from '/imports/ui/services/notification';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Styled from './styles';

const GUEST_WAITING_BELL_THROTTLE_TIME = 10000;

function ringGuestWaitingBell() {
  const Settings = getSettingsSingletonInstance();

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

function messageElement(text, type) {
  if (type === 'title') {
    return <Styled.TitleMessage>{ text }</Styled.TitleMessage>;
  }
  if (type === 'content') {
    return <Styled.ContentMessage>{ text }</Styled.ContentMessage>;
  }
  return false;
}

function alert(obj, intl) {
  const Settings = getSettingsSingletonInstance();

  if (Settings.application.guestWaitingPushAlerts) {
    notify(
      messageElement(obj.messageValues[0], 'title'),
      obj.notificationType,
      obj.icon,
      null,
      messageElement(
        intl.formatMessage({
          id: obj.messageId,
          description: obj.messageDescription,
        }),
        'content',
      ),
      true,
    );
  }

  ringGuestWaitingBellThrottled();
}

export default {
  alert,
};
