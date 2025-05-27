import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import ExternalVideoModal from '/imports/ui/components/external-video-player/external-video-player-graphql/modal/component';
import LayoutModalContainer from '/imports/ui/components/layout/modal/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { ActionButtonDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/action-button-dropdown-item/enums';
import Styled from './styles';
import { colorPrimary, listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import { LAYOUT_TYPE } from '../../layout/enums';
import { uniqueId } from '/imports/utils/string-utils';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import Session from '/imports/ui/services/storage/in-memory';

const propTypes = {
  amIPresenter: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
  handleTakePresenter: PropTypes.func.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  stopExternalVideoShare: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setMeetingLayout: PropTypes.func.isRequired,
  setPushLayout: PropTypes.func.isRequired,
  showPushLayout: PropTypes.bool.isRequired,
  isCameraAsContentEnabled: PropTypes.bool.isRequired,
  actionButtonDropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      allowed: PropTypes.bool,
      key: PropTypes.string,
    }),
  ).isRequired,
  isPresentationManagementDisabled: PropTypes.bool,
};

const defaultProps = {
  shortcuts: '',
  settingsLayout: LAYOUT_TYPE.SMART_LAYOUT,
  isPresentationManagementDisabled: false,
  amIPresenter: false,
  amIModerator: false,
};

const intlMessages = defineMessages({
  mediaLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  presentationDesc: {
    id: 'app.actionsBar.actionsDropdown.presentationDesc',
    description: 'adds context to upload presentation option',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  takePresenter: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Label for take presenter role option',
  },
  takePresenterDesc: {
    id: 'app.actionsBar.actionsDropdown.takePresenterDesc',
    description: 'Description of take presenter role option',
  },
  startExternalVideoLabel: {
    id: 'app.actionsBar.actionsDropdown.shareExternalVideo',
    description: 'Start sharing external video button',
  },
  stopExternalVideoLabel: {
    id: 'app.actionsBar.actionsDropdown.stopShareExternalVideo',
    description: 'Stop sharing external video button',
  },
  layoutModal: {
    id: 'app.actionsBar.actionsDropdown.layoutModal',
    description: 'Label for layouts selection button',
  },
  shareCameraAsContent: {
    id: 'app.actionsBar.actionsDropdown.shareCameraAsContent',
    description: 'Label for share camera as content',
  },
  unshareCameraAsContent: {
    id: 'app.actionsBar.actionsDropdown.unshareCameraAsContent',
    description: 'Label for unshare camera as content',
  },
});

const handlePresentationClick = () => Session.setItem('showUploadPresentationView', true);

class MediaAreaDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.presentationItemId = uniqueId('action-item-');
    this.takePresenterId = uniqueId('action-item-');
    this.selectUserRandId = uniqueId('action-item-');
    this.state = {
      isExternalVideoModalOpen: false,
      isLayoutModalOpen: false,
      isCameraAsContentModalOpen: false,
      menuOpen: false,
    };

    this.handleToggleMenu = this.handleToggleMenu.bind(this);
    this.handleExternalVideoClick = this.handleExternalVideoClick.bind(this);
    this.makePresentationItems = this.makePresentationItems.bind(this);
    this.setExternalVideoModalIsOpen = this.setExternalVideoModalIsOpen.bind(this);
    this.setLayoutModalIsOpen = this.setLayoutModalIsOpen.bind(this);
    this.setCameraAsContentModalIsOpen = this.setCameraAsContentModalIsOpen.bind(this);
    this.setPropsToPassModal = this.setPropsToPassModal.bind(this);
    this.setForceOpen = this.setForceOpen.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { amIPresenter: wasPresenter } = prevProps;
    const { amIPresenter: isPresenter } = this.props;
    if (wasPresenter && !isPresenter) {
      this.setExternalVideoModalIsOpen(false);
    }
  }

  handleExternalVideoClick() {
    this.setExternalVideoModalIsOpen(true);
  }

  handleToggleMenu() {
    this.setState((prevState) => ({
      menuOpen: !prevState.menuOpen,
    }));
  }

  getAvailableActions() {
    const {
      intl,
      amIPresenter,
      allowExternalVideo,
      handleTakePresenter,
      isSharingVideo,
      stopExternalVideoShare,
      amIModerator,
      hasCameraAsContent,
      actionButtonDropdownItems,
      isCameraAsContentEnabled,
      presentations,
      isPresentationEnabled,
      isPresentationManagementDisabled,
      isPresentationUploadDisabled,
    } = this.props;

    const { presentationLabel, takePresenter } = intlMessages;

    const { formatMessage } = intl;

    const actions = [];

    if (
      (amIPresenter || amIModerator)
      && !isPresentationManagementDisabled
      && isPresentationEnabled
    ) {
      if (presentations && presentations.length > 1) {
        actions.push({
          key: 'separator-01',
          isSeparator: true,
        });
      }
      actions.push({
        icon: 'upload',
        dataTest: 'managePresentations',
        label: formatMessage(presentationLabel),
        key: this.presentationItemId,
        onClick: handlePresentationClick,
        disabled: isPresentationUploadDisabled,
      });
    }

    if (!amIPresenter && amIModerator) {
      actions.push({
        icon: 'presentation',
        label: formatMessage(takePresenter),
        key: this.takePresenterId,
        onClick: () => handleTakePresenter(),
      });
    }

    if (amIPresenter && allowExternalVideo) {
      actions.push({
        icon: !isSharingVideo ? 'external-video' : 'external-video_off',
        label: !isSharingVideo
          ? intl.formatMessage(intlMessages.startExternalVideoLabel)
          : intl.formatMessage(intlMessages.stopExternalVideoLabel),
        key: 'external-video',
        onClick: isSharingVideo ? stopExternalVideoShare : this.handleExternalVideoClick,
        dataTest: 'shareExternalVideo',
      });
    }

    if (isCameraAsContentEnabled && amIPresenter) {
      actions.push({
        icon: hasCameraAsContent ? 'video_off' : 'video',
        label: hasCameraAsContent
          ? intl.formatMessage(intlMessages.unshareCameraAsContent)
          : intl.formatMessage(intlMessages.shareCameraAsContent),
        key: 'camera as content',
        onClick: hasCameraAsContent
          ? screenshareHasEnded
          : () => {
            screenshareHasEnded();
            this.setCameraAsContentModalIsOpen(true);
          },
        dataTest: 'shareCameraAsContent',
      });
    }

    actionButtonDropdownItems.forEach((actionButtonItem) => {
      switch (actionButtonItem.type) {
        case ActionButtonDropdownItemType.OPTION:
          actions.push({
            icon: actionButtonItem.icon,
            label: actionButtonItem.label,
            key: actionButtonItem.id,
            onClick: actionButtonItem.onClick,
            allowed: actionButtonItem.allowed,
          });
          break;
        case ActionButtonDropdownItemType.SEPARATOR:
          actions.push({
            key: actionButtonItem.id,
            allowed: actionButtonItem.allowed,
            isSeparator: true,
          });
          break;
        default:
          break;
      }
    });

    return actions;
  }

  setExternalVideoModalIsOpen(value) {
    this.setState({ isExternalVideoModalOpen: value });
  }

  setLayoutModalIsOpen(value) {
    this.setState({ isLayoutModalOpen: value });
  }

  setCameraAsContentModalIsOpen(value) {
    this.setState({ isCameraAsContentModalOpen: value });
  }

  setPropsToPassModal(value) {
    this.setState({ propsToPassModal: value });
  }

  setForceOpen(value) {
    this.setState({ forceOpen: value });
  }

  makePresentationItems() {
    const {
      presentations,
      setPresentation,
      setPresentationFitToWidth,
    } = this.props;

    const presentationItemElements = presentations
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => {
        const customStyles = { color: colorPrimary };

        return (
          {
            customStyles: p.current ? customStyles : null,
            icon: 'file',
            iconRight: p.current ? 'check' : null,
            selected: !!p.current,
            label: p.name,
            description: 'uploaded presentation file',
            key: `uploaded-presentation-${p.presentationId}`,
            onClick: () => {
              setPresentationFitToWidth(false);
              setPresentation(p.presentationId);
            },
          }
        );
      });
    return presentationItemElements;
  }

  renderModal(isOpen, setIsOpen, priority, Component) {
    return isOpen ? (
      <Component
        {...{
          onRequestClose: () => setIsOpen(false),
          priority,
          setIsOpen,
          isOpen,
        }}
      />
    ) : null;
  }

  render() {
    const {
      intl,
      amIPresenter,
      shortcuts: OPEN_ACTIONS_AK,
      isMeteorConnected,
      isMobile,
      isRTL,
      propsToPassModal,
    } = this.props;

    const {
      isExternalVideoModalOpen,
      isLayoutModalOpen,
      isCameraAsContentModalOpen,
      menuOpen,
    } = this.state;

    const availableActions = this.getAvailableActions();
    const availablePresentations = this.makePresentationItems();
    const children = availablePresentations.length > 1 && amIPresenter
      ? availablePresentations.concat(availableActions)
      : availableActions;

    const customStyles = { top: '-1rem' };

    if (availableActions.length === 0 || !isMeteorConnected) {
      return null;
    }

    return (
      <>
        <BBBMenu
          customStyles={!isMobile ? customStyles : null}
          accessKey={OPEN_ACTIONS_AK}
          open={menuOpen}
          onCloseCallback={() => this.setState({ menuOpen: false })}
          trigger={(
            <Styled.HideDropdownButton
              hideLabel
              aria-label={intl.formatMessage(intlMessages.mediaLabel)}
              data-test="mediaAreaButton"
              label={intl.formatMessage(intlMessages.mediaLabel)}
              icon="media-area"
              color={menuOpen ? 'primary' : 'default'}
              size="lg"
              circle
              onClick={this.handleToggleMenu}
              hoverColor={listItemBgHover}
            />
          )}
          actions={children}
          opts={{
            id: 'actions-dropdown-menu',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getcontentanchorel: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          }}
        />
        {this.renderModal(
          isExternalVideoModalOpen,
          this.setExternalVideoModalIsOpen,
          'low',
          ExternalVideoModal,
        )}
        {this.renderModal(
          isLayoutModalOpen,
          this.setLayoutModalIsOpen,
          'low',
          LayoutModalContainer,
        )}
        {this.renderModal(
          isCameraAsContentModalOpen,
          this.setCameraAsContentModalIsOpen,
          'low',
          () => (
            <VideoPreviewContainer
              cameraAsContent
              amIPresenter
              {...{
                callbackToClose: () => {
                  this.setPropsToPassModal({});
                  this.setForceOpen(false);
                },
                priority: 'low',
                setIsOpen: this.setCameraAsContentModalIsOpen,
                isOpen: isCameraAsContentModalOpen,
              }}
              {...propsToPassModal}
            />
          ),
        )}
      </>
    );
  }
}

MediaAreaDropdown.propTypes = propTypes;
MediaAreaDropdown.defaultProps = defaultProps;

export default MediaAreaDropdown;
