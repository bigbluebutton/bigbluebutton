import React, { PureComponent } from 'react';
import CaptionsButtonContainer from '/imports/ui/components/captions/button/container';
import deviceInfo from '/imports/utils/deviceInfo';
import Styled from './styles';
import ActionsDropdown from './actions-dropdown/container';
import AudioCaptionsButtonContainer from '/imports/ui/components/audio/captions/button/container';
import CaptionsReaderMenuContainer from '/imports/ui/components/captions/reader-menu/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import RaiseHandDropdownContainer from './raise-hand/container';
import { isPresentationEnabled } from '/imports/ui/services/features';

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isCaptionsReaderMenuModalOpen: false,
    };

    this.setCaptionsReaderMenuModalIsOpen = this.setCaptionsReaderMenuModalIsOpen.bind(this);
  }

  setCaptionsReaderMenuModalIsOpen(value) {
    this.setState({ isCaptionsReaderMenuModalOpen: value })
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
      stopExternalVideoShare,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      isRaiseHandButtonEnabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      layoutContextDispatch,
      actionsBarStyle,
      setMeetingLayout,
      showPushLayout,
      setPushLayout,
    } = this.props;

    const { isCaptionsReaderMenuModalOpen } = this.state;

    const shouldShowOptionsButton = (isPresentationEnabled() && isThereCurrentPresentation)
      || isSharingVideo || hasScreenshare || isSharedNotesPinned;
    return (
      <Styled.ActionsBar
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
            isMeteorConnected,
            setMeetingLayout,
            setPushLayout,
            presentationIsOpen,
            showPushLayout,
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
            />
            : null
          }
          {isRaiseHandButtonEnabled
            ? (
              <RaiseHandDropdownContainer {...{
                setEmojiStatus,
                currentUser,
                intl,
              }
              }
              />
            ) : null}
        </Styled.Right>
      </Styled.ActionsBar>
    );
  }
}

export default ActionsBar;
