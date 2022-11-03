import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/captions/service';
import Button from './component';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import AudioService from '/imports/ui/components/audio/service';

const Container = (props) => <Button {...props} />;

export default withTracker(() => {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const availableVoices = SpeechService.getSpeechVoices();
  const currentSpeechLocale = SpeechService.getSpeechLocale();
  const isSupported = availableVoices.length > 0;
  const isVoiceUser = AudioService.isVoiceUser();
  return {
    isRTL,
    enabled: Service.hasAudioCaptions(),
    active: Service.getAudioCaptions(),
    currentSpeechLocale,
    availableVoices,
    isSupported,
    isVoiceUser,
  };
})(Container);
