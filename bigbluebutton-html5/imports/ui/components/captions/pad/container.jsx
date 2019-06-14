import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { makeCall } from '/imports/ui/services/api';
import Pad from './component';
import CaptionsService from '/imports/ui/components/captions/service';

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


  const editCaptions = textData => makeCall('vrEditCaptions', textData);

  const { name } = caption ? caption.locale : '';

  const initVoiceRecognition = (lang = 'en-CA') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SR) {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
    }
    return recognition;
  };

  return {
    locale,
    name,
    ownerId,
    padId,
    readOnlyPadId,
    amIModerator: CaptionsService.amIModerator(),
    editCaptions,
    initVoiceRecognition,
  };
})(PadContainer);
