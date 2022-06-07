import React, { PureComponent } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
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
      hasScreenshare,
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
      layoutContextDispatch,
      actionsBarStyle,
      isOldMinimizeButtonEnabled,
    } = this.props;

    return (
      <div
        className={styles.actionsbar}
        style={
          {
            height: actionsBarStyle.innerHeight,
          }
        }
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
          {!isOldMinimizeButtonEnabled ||
            (isOldMinimizeButtonEnabled && isLayoutSwapped && !isPresentationDisabled)
            ? (
              <PresentationOptionsContainer
                isLayoutSwapped={isLayoutSwapped}
                toggleSwapLayout={toggleSwapLayout}
                layoutContextDispatch={layoutContextDispatch}
                hasPresentation={isThereCurrentPresentation}
                hasExternalVideo={isSharingVideo}
                hasScreenshare={hasScreenshare}
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
