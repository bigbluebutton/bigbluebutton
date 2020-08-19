import React, { PureComponent } from 'react';
import cx from 'classnames';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import PresentationOptionsContainer from './presentation-options/component';
import Button from '/imports/ui/components/button/component';
import Storage from '/imports/ui/services/storage/session';
import { ACTIONSBAR_HEIGHT } from '/imports/ui/components/layout/layout-manager';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.autoArrangeToggle = this.autoArrangeToggle.bind(this);
  }

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
    } = this.props;

    const actionBarClasses = {};
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');

    actionBarClasses[styles.centerWithActions] = amIPresenter;
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

export default withLayoutConsumer(ActionsBar);
