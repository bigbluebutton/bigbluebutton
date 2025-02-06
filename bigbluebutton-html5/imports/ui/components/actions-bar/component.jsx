import React, { PureComponent } from 'react';
import { defineMessages } from 'react-intl';
import { ActionsBarItemType, ActionsBarPosition } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/actions-bar-item/enums';
import Styled from './styles';
import ActionsDropdown from './actions-dropdown/container';
import AudioCaptionsButtonContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/button/component';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-graphql/audio-controls/component';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';
import SwapPresentationButton from './swap-presentation/component';
import Button from '/imports/ui/components/common/button/component';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { LAYOUT_TYPE } from '../layout/enums';
import ReactionsButtonContainer from '/imports/ui/components/actions-bar/reactions-button/container';
import RaiseHandButtonContainer from '/imports/ui/components/actions-bar/raise-hand-button/container';
import Selector from '/imports/ui/components/common/selector/component';
import ToggleGroup from '/imports/ui/components/common/toggle-group/component';
import Separator from '/imports/ui/components/common/separator/component';

const intlMessages = defineMessages({
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
});

class ActionsBar extends PureComponent {
  constructor(props) {
    super(props);

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
                  <Separator
                    key={`${plugin.type}-${plugin.id}`}
                    actionsBar
                    icon={plugin.icon}
                  />
                );
                break;
              case ActionsBarItemType.SELECTOR:
                actionBarItemToReturn = (
                  <Selector
                    title={plugin.title}
                    options={plugin.options}
                    defaultOption={plugin.defaultOption}
                    onChange={plugin.onChange}
                    width={plugin.width}
                  />
                );
                break;
              case ActionsBarItemType.TOGGLE_GROUP:
                actionBarItemToReturn = (
                  <ToggleGroup
                    title={plugin.title}
                    options={plugin.options}
                    defaultOption={plugin.defaultOption}
                    onChange={plugin.onChange}
                    exclusive={plugin.exclusive}
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

  renderReactionsButton() {
    return (
      <>
        <ReactionsButtonContainer actionsBarRef={this.actionsBarRef} />
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
      isThereCurrentPresentation,
      allowExternalVideo,
      layoutContextDispatch,
      actionsBarStyle,
      setMeetingLayout,
      showPushLayout,
      setPushLayout,
      setPresentationFitToWidth,
      isPresentationEnabled,
      ariaHidden,
      allowScreensharePresentationSwitch,
    } = this.props;

    const Settings = getSettingsSingletonInstance();
    const { selectedLayout } = Settings.application;
    const shouldShowPresentationButton = selectedLayout !== LAYOUT_TYPE.CAMERAS_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;
    const shouldShowVideoButton = selectedLayout !== LAYOUT_TYPE.PRESENTATION_ONLY
      && selectedLayout !== LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY;

    const shouldShowOptionsButton = (isPresentationEnabled && isThereCurrentPresentation)
      || isSharingVideo || hasScreenshare || isSharedNotesPinned;

    return (
      <Styled.ActionsBarWrapper
        id="ActionsBar"
        role="region"
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={ariaHidden}
        style={
          {
            position: 'absolute',
            top: actionsBarStyle.top,
            left: actionsBarStyle.left,
            height: actionsBarStyle.height,
            width: actionsBarStyle.width,
            padding: actionsBarStyle.padding,
          }
        }
      >
        <h2 class="sr-only">{intl.formatMessage(intlMessages.actionsBarLabel)}</h2>
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
          </Styled.Left>
          <Styled.Center>
            {this.renderPluginsActionBarItems(ActionsBarPosition.LEFT)}
            <AudioCaptionsButtonContainer />
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
            {this.renderReactionsButton()}
            <RaiseHandButtonContainer />
            {this.renderPluginsActionBarItems(ActionsBarPosition.RIGHT)}
          </Styled.Center>
          <Styled.Right>
            <Styled.Gap>
              {
                allowScreensharePresentationSwitch && <SwapPresentationButton />
              }
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
            </Styled.Gap>
          </Styled.Right>
        </Styled.ActionsBar>
      </Styled.ActionsBarWrapper>
    );
  }
}

export default ActionsBar;
