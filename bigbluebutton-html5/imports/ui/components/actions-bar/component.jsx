import React, { PureComponent } from 'react';
import CaptionsButtonContainer from '/imports/ui/components/captions/button/container';
import deviceInfo from '/imports/utils/deviceInfo';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import ActionsDropdown from './actions-dropdown/container';
import AudioCaptionsButtonContainer from '/imports/ui/components/audio/captions/button/container';
import CaptionsReaderMenuContainer from '/imports/ui/components/captions/reader-menu/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import ReactionsButtonContainer from './reactions-button/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import RaiseHandDropdownContainer from './raise-hand/container';
import { isPresentationEnabled } from '/imports/ui/services/features';
import Button from '/imports/ui/components/common/button/component';

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isCaptionsReaderMenuModalOpen: false,
    };

    this.setCaptionsReaderMenuModalIsOpen = this.setCaptionsReaderMenuModalIsOpen.bind(this);
    this.setRenderRaiseHand = this.renderRaiseHand.bind(this);
    this.actionsBarRef = React.createRef();
    this.renderPluginsActionBarItems = this.renderPluginsActionBarItems.bind(this);
  }

  setCaptionsReaderMenuModalIsOpen(value) {
    this.setState({ isCaptionsReaderMenuModalOpen: value })
  }

  renderPluginsActionBarItems(position) {
    const { actionBarItems } = this.props;
    return (
      <>
        {
          actionBarItems.filter((plugin) => plugin.position === position).map((plugin, index) => {
            let actionBarItemToReturn;
            switch (plugin.type) {
              case PluginSdk.ActionsBarItemType.BUTTON:
                actionBarItemToReturn = (
                  <Button
                    key={`${plugin.type}-${plugin.id}`}
                    onClick={plugin.onClick}
                    hideLabel
                    color="primary"
                    icon={plugin.icon}
                    size="lg"
                    circle
                    tooltip={plugin.tooltip}
                  />
                );
                break;
              case PluginSdk.ActionsBarItemType.SEPARATOR:
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
      isReactionsButtonEnabled, isRaiseHandButtonEnabled, setEmojiStatus, currentUser, intl,
    } = this.props;

    return (<>
      {isReactionsButtonEnabled ?
        <>
          <Styled.Separator />
          <ReactionsButtonContainer actionsBarRef={this.actionsBarRef} />
        </> :
        isRaiseHandButtonEnabled ? <RaiseHandDropdownContainer {...{ setEmojiStatus, currentUser, intl }} />
          : null}
    </>);
  }

  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      presentationIsOpen,
      setPresentationIsOpen,
      handleTakePresenter,
      intl,
      isSharingVideo,
      isSharedNotesPinned,
      hasScreenshare,
      hasGenericContent,
      hasCameraAsContent,
      stopExternalVideoShare,
      isTimerActive,
      isTimerEnabled,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
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

    const { isCaptionsReaderMenuModalOpen } = this.state;

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
            isSelectRandomUserEnabled,
            allowExternalVideo,
            handleTakePresenter,
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
          {isCaptionsAvailable
            ? (
              <>
                <CaptionsButtonContainer {...{ intl,
                  setIsOpen: this.setCaptionsReaderMenuModalIsOpen,}} />
                {
                  isCaptionsReaderMenuModalOpen ? <CaptionsReaderMenuContainer
                    {...{
                      onRequestClose: () => this.setCaptionsReaderMenuModalIsOpen(false),
                      priority: "low",
                      setIsOpen: this.setCaptionsReaderMenuModalIsOpen,
                      isOpen: isCaptionsReaderMenuModalOpen,
                    }}
                  /> : null
                }
              </>
            )
            : null}
          { !deviceInfo.isMobile
            ? (
              <AudioCaptionsButtonContainer />
            )
            : null }
        </Styled.Left>
        <Styled.Center>
          {this.renderPluginsActionBarItems(PluginSdk.ActionsBarPosition.LEFT)}
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
          {isRaiseHandButtonCentered && this.renderRaiseHand()}
          {this.renderPluginsActionBarItems(PluginSdk.ActionsBarPosition.RIGHT)}
        </Styled.Center>
        <Styled.Right>
          { shouldShowOptionsButton ?
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
            : null
          }
          {!isRaiseHandButtonCentered && this.renderRaiseHand()}
        </Styled.Right>
      </Styled.ActionsBar>
    );
  }
}

export default ActionsBar;
