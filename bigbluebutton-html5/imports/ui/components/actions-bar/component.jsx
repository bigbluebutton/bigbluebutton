import React, { PureComponent } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { ACTIONSBAR_HEIGHT } from '/imports/ui/components/layout/layout-manager';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from './styles.scss';
import ActionsDropdown from './actions-dropdown/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';

class ActionsBar extends PureComponent {
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
      isPresentationDisabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      shortcuts,
    } = this.props;

    const actionBarClasses = {};

    actionBarClasses[styles.center] = true;
    actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

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
            : null
          }
        </div>
        <div className={cx(actionBarClasses)}>
          <AudioControlsContainer />
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
        </div>
        <div className={styles.right}>
          {
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
              color="primary"
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
          }
          {isLayoutSwapped && !isPresentationDisabled
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

export default withShortcutHelper(ActionsBar, ['raiseHand']);
