import _ from 'lodash';
import { notify } from '/imports/ui/services/notification';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import Users from '/imports/api/users';
import Styled from './styles';

const CDN = Meteor.settings.public.app.cdn;
const BASENAME = Meteor.settings.public.app.basename;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const HOST = CDN + BASENAME;
const GUEST_WAITING_BELL_THROTTLE_TIME = 10000;

function ringGuestWaitingBell() {
  if (Settings.application.guestWaitingAudioAlerts) {
    const audio = new Audio(`${HOST}/resources/sounds/doorbell.mp3`);
    audio.play();
  }
}

const ringGuestWaitingBellThrottled = _.throttle(
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

function alert(obj, managementPanelIsOpen, intl) {
  const currentUser = Users.findOne({
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  }, {
    fields: {
      role: 1,
    },
  });
  const currentUserIsModerator = currentUser.role === ROLE_MODERATOR;

  if (managementPanelIsOpen || !currentUserIsModerator) return;

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
