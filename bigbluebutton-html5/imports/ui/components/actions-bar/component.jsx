import React, { PureComponent } from 'react';
import { ActionsBarItemType, ActionsBarPosition } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/actions-bar-item/enums';
import Styled from './styles';
import ActionsDropdown from './actions-dropdown/container';
import AudioCaptionsButtonContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/button/component';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import ReactionsButtonContainer from './reactions-button/container';
import AudioControlsContainer from '../audio/audio-graphql/audio-controls/component';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import RaiseHandDropdownContainer from './raise-hand/container';
import { isPresentationEnabled } from '/imports/ui/services/features';
import Button from '/imports/ui/components/common/button/component';
import Settings from '/imports/ui/services/settings';
import { LAYOUT_TYPE } from '../layout/enums';

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.setRenderRaiseHand = this.renderRaiseHand.bind(this);
    this.actionsBarRef = React.createRef();
    this.renderPluginsActionBarItems = this.renderPluginsActionBarItems.bind(this);
  }

  renderPluginsActionBarItems(position) {
    const { actionBarItems } = this.props;
    return (
      <>
        {
          actionBarItems.filter((plugin) => plugin.position === position).map((plugin) => {
            let actionBarItemToReturn;
            switch (plugin.type) {
              case ActionsBarItemType.BUTTON:
                actionBarItemToReturn = (
                  <Button
                    key={`${plugin.type}-${plugin.id}`}
                    onClick={plugin.onClick}
                    hideLabel
                    color="primary"
                    icon={plugin.icon}
                    size="lg"
                    circle
                    label={plugin.tooltip}
                  />
                );
                break;
              case ActionsBarItemType.SEPARATOR:
                actionBarItemToReturn = (
                  <Styled.Separator
                    key={`${plugin.type}-${plugin.id}`}
                  />
                );
                break;
              default:
                actionBarItemToReturn = null;
                break;
            }
            return actionBarItemToReturn;
          })
        }
      </>
    );
  }

  renderRaiseHand() {
    const {
      isReactionsButtonEnabled, isRaiseHandButtonEnabled, currentUser, intl,
    } = this.props;

    return (
      <>
        {isReactionsButtonEnabled
          ? (
            <>
              <Styled.Separator />
              <ReactionsButtonContainer actionsBarRef={this.actionsBarRef} />
            </>
          )
          : isRaiseHandButtonEnabled ? <RaiseHandDropdownContainer {...{ currentUser, intl }} />
            : null}
      </>
    );
  }

  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      presentationIsOpen,
      setPresentationIsOpen,
      intl,
      isSharingVideo,
      isSharedNotesPinned,
      hasScreenshare,
      hasGenericContent,
      hasCameraAsContent,
      stopExternalVideoShare,
      isTimerActive,
      isTimerEnabled,
      isMeteorConnected,
      isPollingEnabled,
      isRaiseHandButtonCentered,
      isThereCurrentPresentation,
      allowExternalVideo,
      layoutContextDispatch,
      actionsBarStyle,
      setMeetingLayout,
      showPushLayout,
      setPushLayout,
      setPresentationFitToWidth,

    } = this.props;

    const { selectedLayout } = Settings.application;
    const shouldShowPresentationButton = selectedLayout !== LAYOUT_TYPE.CAMERAS_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;
    const shouldShowVideoButton = selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;

    const shouldShowOptionsButton = (isPresentationEnabled() && isThereCurrentPresentation)
      || isSharingVideo || hasScreenshare || isSharedNotesPinned;

    return (
      <Styled.ActionsBar
        ref={this.actionsBarRef}
        style={
          {
            height: actionsBarStyle.innerHeight,
          }
        }
      >
        <Styled.Left>
          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            allowExternalVideo,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isTimerActive,
            isTimerEnabled,
            isMeteorConnected,
            setMeetingLayout,
            setPushLayout,
            presentationIsOpen,
            showPushLayout,
            hasCameraAsContent,
            setPresentationFitToWidth,
          }}
          />

          <AudioCaptionsButtonContainer />
        </Styled.Left>
        <Styled.Center>
          {this.renderPluginsActionBarItems(ActionsBarPosition.LEFT)}
          <AudioControlsContainer />
          {shouldShowVideoButton && enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
          {shouldShowPresentationButton && (
            <ScreenshareButtonContainer {...{
              amIPresenter,
              isMeteorConnected,
            }}
            />
          )}
          {isRaiseHandButtonCentered && this.renderRaiseHand()}
          {this.renderPluginsActionBarItems(ActionsBarPosition.RIGHT)}
        </Styled.Center>
        <Styled.Right>
          {shouldShowPresentationButton && shouldShowOptionsButton
            ? (
              <PresentationOptionsContainer
                presentationIsOpen={presentationIsOpen}
                setPresentationIsOpen={setPresentationIsOpen}
                layoutContextDispatch={layoutContextDispatch}
                hasPresentation={isThereCurrentPresentation}
                hasExternalVideo={isSharingVideo}
                hasScreenshare={hasScreenshare}
                hasPinnedSharedNotes={isSharedNotesPinned}
                hasGenericContent={hasGenericContent}
                hasCameraAsContent={hasCameraAsContent}
              />
            )
            : null}
          {!isRaiseHandButtonCentered && this.renderRaiseHand()}
        </Styled.Right>
      </Styled.ActionsBar>
    );
  }
}

export default ActionsBar;
