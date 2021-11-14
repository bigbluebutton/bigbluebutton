import React, { PureComponent } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { ACTIONSBAR_HEIGHT } from '/imports/ui/components/layout/layout-manager/component';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from './styles.scss';
import ActionsDropdown from './actions-dropdown/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import Storage from '/imports/ui/services/storage/session';
import AudioManager from '/imports/ui/services/audio-manager';
import { defineMessages, injectIntl } from 'react-intl';

import Meetings from '/imports/api/meetings';
import LanguageOverlay from '/imports/ui/components/LanguageOverlay/component'
import Service from './service';
import Auth from '/imports/ui/services/auth';

const TRANSLATION_SETTINGS = Meteor.settings.public.media.translation || {};
var FLOOR_TRANSLATION_VOLUME = 0.4;
var TRANSLATOR_SPEAKING_DELAY = 0;
var TRANSLATOR_SPEAKING_TIMEOUT = 60000;
var TRANSLATOR_SPEAKING_ENABLED = true;

if (TRANSLATION_SETTINGS) {

  if (TRANSLATION_SETTINGS.hasOwnProperty('floorVolume')) {
    FLOOR_TRANSLATION_VOLUME = TRANSLATION_SETTINGS.floorVolume
  }

  if (TRANSLATION_SETTINGS.hasOwnProperty('translator')) {
    const TRANSLATOR_SETTINGS = TRANSLATION_SETTINGS.translator;
    if (TRANSLATOR_SETTINGS && TRANSLATOR_SETTINGS.hasOwnProperty('speakDetection')) {
      const SPEAK_DETECTION_SETTINGS = TRANSLATOR_SETTINGS.speakDetection;
      if (SPEAK_DETECTION_SETTINGS) {
        if (SPEAK_DETECTION_SETTINGS.hasOwnProperty('delay')) {
          TRANSLATOR_SPEAKING_DELAY = SPEAK_DETECTION_SETTINGS.delay;
        }
        if (SPEAK_DETECTION_SETTINGS.hasOwnProperty('timeout')) {
          TRANSLATOR_SPEAKING_TIMEOUT = SPEAK_DETECTION_SETTINGS.timeout;
        }
        if (SPEAK_DETECTION_SETTINGS.hasOwnProperty('enabled')) {
          TRANSLATOR_SPEAKING_ENABLED = SPEAK_DETECTION_SETTINGS.enabled;
        }
      }
    }
  }
}

const intlMessages = defineMessages({
  translatorSelectLanguageLabel: {
    id: 'app.translation.translator.selectLanguage',
    description: 'Label for translator select language button',
    defaultMessage: 'Translate to',
  },
  selectTranslationLabel: {
    id: 'app.translation.selectTranslation',
    description: 'Label for select translation button',
    defaultMessage: 'Available languages',
  },
  filterMarkerLanguageListening: {
    id: 'app.translation.filterMarker.languageListening',
    description: 'Label for filter text in translator language selection for already listening language',
    defaultMessage: 'listening',
  },
  filterMarkerLanguageTranslating: {
    id: 'app.translation.filterMarker.languageTranslating',
    description: 'Label for filter text in listening language selection for already translating language',
    defaultMessage: 'speaking',
  },
});

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.autoArrangeToggle = this.autoArrangeToggle.bind(this);
    this.handleMuteTranslator = this.handleMuteTranslator.bind(this)
  }

  state = {
    showTranslatorChoice: false,
    showLanguageChoice: false,
    translatorLanguage: null,
    translationLanguage: null,
    translationMuted: false
  };


  componentDidMount() {

    // if(AudioManager.isTranslationEnabled) {
    //   AudioManager.registerMuteStateListener(() => this.forceUpdate());
    //
    //   if (TRANSLATOR_SPEAKING_ENABLED) {
    //     setInterval(() => {
    //       const meeting = Meetings.findOne(
    //         {meetingId: Auth.meetingID},
    //         {fields: {'languages': 1}});
    //
    //       if (meeting?.languages) {
    //
    //         let transaudio = document.getElementById("translation-media")
    //
    //         let result = false;
    //         const languageExtension = AudioManager.translationLanguageExtension;
    //         let meeting1 = meeting.languages.find(language => language.extension === languageExtension);
    //         if (meeting1 !== undefined) {
    //           if (meeting1.hasOwnProperty("translatorIsSpeaking")) {
    //             result = meeting1.translatorIsSpeaking;
    //             if (meeting1.hasOwnProperty("translatorSpeakingUtcTimestamp")) {
    //               if (meeting1.translatorSpeakingUtcTimestamp + TRANSLATOR_SPEAKING_DELAY > Date.now() && !result) {
    //                 result = true;
    //               }
    //               if (meeting1.translatorSpeakingUtcTimestamp + TRANSLATOR_SPEAKING_TIMEOUT < Date.now()) {
    //                 result = false;
    //               }
    //             }
    //           }
    //         }
    //         if (result) {
    //           AudioManager.setTranslationFloorVolumeByExt(languageExtension);
    //           // AudioManager.setFloorOutputVolume(FLOOR_TRANSLATION_VOLUME);
    //           // transaudio.volume = 1
    //         } else {
    //           AudioManager.setFloorOutputVolume(1.0);
    //         }
    //       }
    //     }, 500);
    //   }
    // }
  }

  autoArrangeToggle() {
    const { layoutContextDispatch } = this.props;
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');
    layoutContextDispatch(
        {
          type: 'setAutoArrangeLayout',
          value: !autoArrangeLayout,
        },
    );
    window.dispatchEvent(new Event('autoArrangeChanged'));
  }
  toggleTranslatorSelection(){
    this.state.showTranslatorChoice = !this.state.showTranslatorChoice;
    this.state.showLanguageChoice = false;
    this.setState(this.state)
    this.forceUpdate()
  }
  toggleTranslationSelection(){
    this.state.showLanguageChoice = !this.state.showLanguageChoice;
    this.state.showTranslatorChoice = false;
    this.setState(this.state)
    this.forceUpdate()
  }

  handleTranslatorLanguageSelection(language, onConnected) {
    let onInternalConnected = (message) => {
      if (message.status == 'started') {
        onConnected();
      }
    };

    AudioManager.openTranslatorChannel(language.extension, onInternalConnected).then(() => {
      // if( language.extension > 0 ) {
      //   Service.muteMicrophone();
      // } else {
      //   Service.unmuteMicrophone();
      // }
      // if (language.extension > 0 && !this.state.translatorLanguage && !AudioManager.isTranslatorMuted()) {
      //   this.handleMuteTranslator()
      // }
      this.setState({translatorLanguage : language})
      this.forceUpdate()
    });
  }

  handleMuteTranslator(){
    AudioManager.toggleMuteTranslator();
    this.forceUpdate();
  }

  handleLanguageSelection(language, onConnected) {
    this.state.translationLanguage = language
    AudioManager.openTranslationChannel(language.extension)
        .then((languageExtension) => {
          onConnected();
          return languageExtension;
        })
        .then((languageExtension) => {
          AudioManager.setTranslationFloorVolumeByExt(languageExtension)
        //   if (!TRANSLATOR_SPEAKING_ENABLED) {
        //     if (languageExtension === -1) {
        //       AudioManager.setFloorOutputVolume(1.0);
        //     } else {
        //       AudioManager.setFloorOutputVolume(FLOOR_TRANSLATION_VOLUME);
        //     }
        //   }
        });
    this.setState(this.state)
    this.forceUpdate()
  }

  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      isSharingVideo,
      stopExternalVideoShare,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      isRaiseHandButtonEnabled,
      isPresentationDisabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      shortcuts,
      hasLanguages,
      isTranslationEnabled
    } = this.props;

    return (
      <div
        className={styles.actionsbar}
        style={{
          height: ACTIONSBAR_HEIGHT,
        }}
      >
        <div className={styles.left}>
          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            isSelectRandomUserEnabled,
            allowExternalVideo,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null}
        </div>
        <div className={styles.center}>
          <AudioControlsContainer
              currentLanguage={this.state.translationLanguage}
          />
          {enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
          <ScreenshareButtonContainer {...{
            amIPresenter,
            isMeteorConnected,
          }}
          />
          { isTranslationEnabled && this.state.showLanguageChoice ?
              (
                  <div className={["sailingShip", styles.languageOverlay, styles.translationLanguageOverlay].join(' ')}>
                    <LanguageOverlay
                        current={this.state.translationLanguage}
                        filteredLanguages={this.state.translatorLanguage ? [this.state.translatorLanguage] : []}
                        filterMarker={intl.formatMessage(intlMessages.filterMarkerLanguageTranslating)}
                        clickHandler={this.handleLanguageSelection.bind(this)}
                        intl={intl}
                    />
                  </div>
              ):null
          }
          { isTranslationEnabled && hasLanguages
              ? (
                  <div id={"translationButton"}>
                    <Button
                        customIcon={
                          <img
                              className="icon-bbb-translation"
                              src='/html5client/svgs/bbb_translations_icon.svg'
                          />
                        }
                        color='primary'
                        label={intl.formatMessage(intlMessages.selectTranslationLabel)}
                        circle
                        hideLabel
                        size="lg"
                        onClick={this.toggleTranslationSelection.bind(this)}
                    />
                  </div>
              )
              : null
          }

          { isTranslationEnabled && amIModerator && hasLanguages ?
              (
                  <div id={"translatorButton"}>
                    <Button
                        customIcon={
                          <img
                              className="icon-bbb-languages"
                              src='/html5client/svgs/bbb_languages_icon.svg'
                          />
                        }
                        color='primary'
                        label={intl.formatMessage(intlMessages.translatorSelectLanguageLabel)}
                        circle
                        hideLabel
                        size="lg"
                        onClick={this.toggleTranslatorSelection.bind(this)}
                        className={ styles.translatorBtn }
                    />
                  </div>
              ) :null
          }
          { isTranslationEnabled && this.state.showTranslatorChoice ?
              (
                  <div className={["sailingShip", styles.languageOverlay, styles.translatorLanguageOverlay].join(' ')}>
                    <LanguageOverlay
                        translator={true}
                        current={this.state.translatorLanguage}
                        filteredLanguages={this.state.translationLanguage ? [this.state.translationLanguage] : []}
                        filterMarker={intl.formatMessage(intlMessages.filterMarkerLanguageListening)}
                        clickHandler={this.handleTranslatorLanguageSelection.bind(this)}
                        intl={intl}
                    />
                  </div>
              ):null
          }
        </div>
        <div className={styles.right}>
          {isLayoutSwapped && !isPresentationDisabled
            ? (
              <PresentationOptionsContainer
                toggleSwapLayout={toggleSwapLayout}
                isThereCurrentPresentation={isThereCurrentPresentation}
              />
            )
            : null}
          {isRaiseHandButtonEnabled
            ? (
              <Button
                icon="hand"
                label={intl.formatMessage({
                  id: `app.actionsBar.emojiMenu.${
                    currentUser.emoji === 'raiseHand'
                      ? 'lowerHandLabel'
                      : 'raiseHandLabel'
                  }`,
                })}
                accessKey={shortcuts.raisehand}
                color={currentUser.emoji === 'raiseHand' ? 'primary' : 'default'}
                data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
                ghost={currentUser.emoji !== 'raiseHand'}
                className={cx(currentUser.emoji === 'raiseHand' || styles.btn)}
                hideLabel
                circle
                size="lg"
                onClick={() => {
                  setEmojiStatus(
                    currentUser.userId,
                    currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
                  );
                }}
              />
            )
            : null}
        </div>
      </div>
    );
  }
}

export default withShortcutHelper(ActionsBar, ['raiseHand']);
