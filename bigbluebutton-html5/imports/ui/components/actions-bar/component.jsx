import React, { PureComponent } from 'react';
import cx from 'classnames';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import QuickPollDropdown from './quick-poll-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import PresentationOptionsContainer from './presentation-options/component';
import Button from '/imports/ui/components/button/component';
import Storage from '/imports/ui/services/storage/session';
import { ACTIONSBAR_HEIGHT } from '/imports/ui/components/layout/layout-manager';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import AudioManager from '/imports/ui/services/audio-manager';
import {makeCall} from "../../services/api";
import LanguageOverlay from '/imports/ui/components/LanguageOverlay/component'

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.autoArrangeToggle = this.autoArrangeToggle.bind(this);
  }

  state = {
    showTranslatorChoice: false,
    showLanguageChoice: false,
    translatorLanguage: null,
    translationLanguage: null,
  };

  componentDidUpdate(prevProps) {
    const { layoutContextState } = this.props;
    const { layoutContextState: prevLayoutContextState } = prevProps;
    const { autoArrangeLayout } = layoutContextState;
    const { autoArrangeLayout: prevAutoArrangeLayout } = prevLayoutContextState;
    if (autoArrangeLayout !== prevAutoArrangeLayout) this.forceUpdate();
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

  handleTranslatorLanguageSelection(language){
    this.state.translatorLanguage = language
    AudioManager.openTranslatorChannel(language.extension)
    this.setState(this.state)
    this.forceUpdate()
  }

  handleLanguageSelection(language){
    this.state.translationLanguage = language
    AudioManager.openTranslationChannel(language.extension)
    this.setState(this.state)
    this.forceUpdate()
  }

  render() {
    const {
      amIPresenter,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      amIModerator,
      screenSharingCheck,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      currentSlidHasContent,
      parseCurrentSlideContent,
      isSharingVideo,
      screenShareEndAlert,
      stopExternalVideoShare,
      screenshareDataSavingSetting,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      hasBreakouts,
    } = this.props;

    const actionBarClasses = {};

    actionBarClasses[styles.centerWithActions] = amIPresenter;
    actionBarClasses[styles.center] = true;
    actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            allowExternalVideo,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />
          {isPollingEnabled
            ? (
              <QuickPollDropdown
                {...{
                  currentSlidHasContent,
                  intl,
                  amIPresenter,
                  parseCurrentSlideContent,
                }}
              />
            ) : null
          }
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null
          }
        </div>
        <div className={cx(actionBarClasses)}>
          <AudioControlsContainer />
          { amIModerator ?
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
                  label={hasBreakouts() ? 'Become Translator' : 'No Translation available'}
                  circle
                  hideLabel
                  size="lg"
                  onClick={this.toggleTranslatorSelection.bind(this)}
                />
              </div>
            ) :null
          }
          { this.state.showTranslatorChoice ?
              (
                <div className={"sailingShip "+styles.translatorLanguageOverlay}>
                  <LanguageOverlay current={this.state.translatorLanguage} filteredLanguages={this.state.translationLanguage ? [this.state.translationLanguage] : []} clickHandler={this.handleTranslatorLanguageSelection.bind(this) }/>
                </div>
              ):null
          }

          {enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
          <DesktopShare {...{
            handleShareScreen,
            handleUnshareScreen,
            isVideoBroadcasting,
            amIPresenter,
            screenSharingCheck,
            screenShareEndAlert,
            isMeteorConnected,
            screenshareDataSavingSetting,
          }}
          />
          { this.state.showLanguageChoice ?
              (
                  <div className={"sailingShip "+styles.languageOverlay}>
                    <LanguageOverlay current={this.state.translationLanguage} filteredLanguages={this.state.translatorLanguage ? [this.state.translatorLanguage] : []}  clickHandler={this.handleLanguageSelection.bind(this) }/>
                  </div>
              ):null
          }
          <div id={"translationButton"}>
            <Button
              customIcon={
                <img
                  className="icon-bbb-translation"
                  src='/html5client/svgs/bbb_translations_icon.svg'
                />
              }
              color='primary'
              label={ hasBreakouts() ? 'Activate Translation' : 'No Translation Available' }
              circle
              hideLabel
              size="lg"
              onClick={this.toggleTranslationSelection.bind(this)}
            />
          </div>
          <Button
            className={cx(styles.button, autoArrangeLayout || styles.btn)}
            icon={autoArrangeLayout ? 'lock' : 'unlock'}
            color={autoArrangeLayout ? 'primary' : 'default'}
            ghost={!autoArrangeLayout}
            onClick={this.autoArrangeToggle}
            label={autoArrangeLayout ? 'Disable Auto Arrange' : 'Enable Auto Arrange'}
            aria-label="Auto Arrange test"
            hideLabel
            circle
            size="lg"
          />
        </div>
        <div className={styles.right}>
          {isLayoutSwapped
            ? (
              <PresentationOptionsContainer
                toggleSwapLayout={toggleSwapLayout}
                isThereCurrentPresentation={isThereCurrentPresentation}
              />
            )
            : null
          }
        </div>
      </div>
    );
  }
}

export default ActionsBar;
