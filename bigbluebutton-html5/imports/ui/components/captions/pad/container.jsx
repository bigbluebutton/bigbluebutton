import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import CaptionsService from '/imports/ui/components/captions/service';
import Pad from './component';

class PadContainer extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <Pad {...this.props}>
        {children}
      </Pad>
    );
  }
}

export default withTracker(() => {
  const locale = Session.get('captionsLocale');
  const caption = CaptionsService.getCaptions(locale);
  const {
    padId,
    ownerId,
    readOnlyPadId,
  } = caption;

  const { name } = caption ? caption.locale : '';

  const handleAppendText = text => makeCall('appendText', text, locale);

  const initVoiceRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SR) {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale;
    }

    return recognition;
  };

  const currentUserId = Users.findOne({ userId: Auth.userID }).userId;

  return {
    locale,
    name,
    ownerId,
    padId,
    readOnlyPadId,
    amIModerator: CaptionsService.amIModerator(),
    handleAppendText,
    initVoiceRecognition,
    currentUserId,
  };
})(PadContainer);
