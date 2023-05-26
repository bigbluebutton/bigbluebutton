import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import ExternalVideoModal from '/imports/ui/components/external-video-player/modal/container';
import RandomUserSelectContainer from '/imports/ui/components/common/modal/random-user/container';
import LayoutModalContainer from '/imports/ui/components/layout/modal/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { PANELS, ACTIONS, LAYOUT_TYPE } from '../../layout/enums';
import { uniqueId } from '/imports/utils/string-utils';
import { isPresentationEnabled, isLayoutsEnabled } from '/imports/ui/services/features';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import { screenshareHasEnded } from '/imports/ui/components/screenshare/service';

const propTypes = {
  amIPresenter: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIModerator: PropTypes.bool.isRequired,
  shortcuts: PropTypes.string,
  handleTakePresenter: PropTypes.func.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  stopExternalVideoShare: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setMeetingLayout: PropTypes.func.isRequired,
  setPushLayout: PropTypes.func.isRequired,
  showPushLayout: PropTypes.bool.isRequired,
};

const defaultProps = {
  shortcuts: '',
  settingsLayout: LAYOUT_TYPE.SMART_LAYOUT,
};

const intlMessages = defineMessages({
  actionsLabel: {
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
  pollBtnLabel: {
    id: 'app.actionsBar.actionsDropdown.pollBtnLabel',
    description: 'poll menu toggle button label',
  },
  pollBtnDesc: {
    id: 'app.actionsBar.actionsDropdown.pollBtnDesc',
    description: 'poll menu toggle button description',
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
  selectRandUserLabel: {
    id: 'app.actionsBar.actionsDropdown.selectRandUserLabel',
    description: 'Label for selecting a random user',
  },
  selectRandUserDesc: {
    id: 'app.actionsBar.actionsDropdown.selectRandUserDesc',
    description: 'Description for select random user option',
  },
  propagateLayoutLabel: {
    id: 'app.actionsBar.actionsDropdown.propagateLayoutLabel',
    description: 'Label for propagate layout button',
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

const handlePresentationClick = () => Session.set('showUploadPresentationView', true);

class ActionsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.presentationItemId = uniqueId('action-item-');
    this.pollId = uniqueId('action-item-');
    this.takePresenterId = uniqueId('action-item-');
    this.selectUserRandId = uniqueId('action-item-');
    this.state = {
      isExternalVideoModalOpen: false,
      isRandomUserSelectModalOpen: false,
      isLayoutModalOpen: false,
      isCameraAsContentModalOpen: false,
    };

    this.handleExternalVideoClick = this.handleExternalVideoClick.bind(this);
    this.makePresentationItems = this.makePresentationItems.bind(this);
    this.setExternalVideoModalIsOpen = this.setExternalVideoModalIsOpen.bind(this);
    this.setRandomUserSelectModalIsOpen = this.setRandomUserSelectModalIsOpen.bind(this);
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

  getAvailableActions() {
    const {
      intl,
      amIPresenter,
      allowExternalVideo,
      handleTakePresenter,
      isSharingVideo,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      stopExternalVideoShare,
      layoutContextDispatch,
      setMeetingLayout,
      setPushLayout,
      showPushLayout,
      amIModerator,
      isMobile,
      hasCameraAsContent,
      isCameraAsContentEnabled,
    } = this.props;

    const {
      pollBtnLabel,
      presentationLabel,
      takePresenter,
    } = intlMessages;

    const {
      formatMessage,
    } = intl;

    const actions = [];

    if (amIPresenter && isPresentationEnabled()) {
      actions.push({
        icon: "upload",
        dataTest: "managePresentations",
        label: formatMessage(presentationLabel),
        key: this.presentationItemId,
        onClick: handlePresentationClick,
        dividerTop: this.props?.presentations?.length > 1 ? true : false,
      })
    }

    if (amIPresenter && isPollingEnabled) {
      actions.push({
        icon: "polling",
        dataTest: "polling",
        label: formatMessage(pollBtnLabel),
        key: this.pollId,
        onClick: () => {
          if (Session.equals('pollInitiated', true)) {
            Session.set('resetPollPanel', true);
          }
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.POLL,
          });
          Session.set('forcePollOpen', true);
        },
      })
    }

    if (!amIPresenter && amIModerator) {
      actions.push({
        icon: "presentation",
        label: formatMessage(takePresenter),
        key: this.takePresenterId,
        onClick: () => handleTakePresenter(),
      });
    }

    if (amIPresenter && allowExternalVideo) {
      actions.push({
        icon: !isSharingVideo ? "external-video" : "external-video_off",
        label: !isSharingVideo ? intl.formatMessage(intlMessages.startExternalVideoLabel)
          : intl.formatMessage(intlMessages.stopExternalVideoLabel),
        key: "external-video",
        onClick: isSharingVideo ? stopExternalVideoShare : this.handleExternalVideoClick,
        dataTest: "shareExternalVideo",
      })
    }

    if (amIPresenter && isSelectRandomUserEnabled) {
      actions.push({
        icon: "user",
        label: intl.formatMessage(intlMessages.selectRandUserLabel),
        key: this.selectUserRandId,
        onClick: () => this.setRandomUserSelectModalIsOpen(true),
        dataTest: "selectRandomUser",
      })
    }

    if (amIPresenter && showPushLayout && isLayoutsEnabled()) {
      actions.push({
        icon: 'send',
        label: intl.formatMessage(intlMessages.propagateLayoutLabel),
        key: 'propagate layout',
        onClick: amIPresenter ? setMeetingLayout : setPushLayout,
        dataTest: 'propagateLayout',
      });
    }

    if (isLayoutsEnabled()){
      actions.push({
        icon: 'send',
        label: intl.formatMessage(intlMessages.layoutModal),
        key: 'layoutModal',
        onClick: () => this.setLayoutModalIsOpen(true),
        dataTest: 'layoutModal',
      });
    }

    if (isCameraAsContentEnabled && amIPresenter && !isMobile) {
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
      });
    }

    return actions;
  }

  makePresentationItems() {
    const {
      presentations,
      setPresentation,
      podIds,
    } = this.props;

    if (!podIds || podIds.length < 1) return [];

    // We still have code for other pods from the Flash client. This intentionally only cares
    // about the first one because it's the default.
    const { podId } = podIds[0];

    const presentationItemElements = presentations
      .sort((a, b) => (a.name.localeCompare(b.name)))
      .map((p) => {
        const customStyles = { color: colorPrimary };

        return (
          {
            customStyles: p.current ? customStyles : null,
            icon: "file",
            iconRight: p.current ? 'check' : null,
            selected: p.current ? true : false,
            label: p.name,
            description: "uploaded presentation file",
            key: `uploaded-presentation-${p.id}`,
            onClick: () => {
              setPresentation(p.id, podId);
            },
          }
        );
      });

    return presentationItemElements;
  }

  setExternalVideoModalIsOpen(value) {
    this.setState({isExternalVideoModalOpen: value});
  }
  setRandomUserSelectModalIsOpen(value) {
    this.setState({isRandomUserSelectModalOpen: value});
  }
  setLayoutModalIsOpen(value) {
    this.setState({isLayoutModalOpen: value});
  }
  setCameraAsContentModalIsOpen(value) {
    this.setState({isCameraAsContentModalOpen: value});
  }
  setPropsToPassModal(value) {
    this.setState({propsToPassModal: value});
  }
  setForceOpen(value){
    this.setState({forceOpen: value});
  }

  renderModal(isOpen, setIsOpen, priority, Component) {
    return isOpen ? <Component 
      {...{
        onRequestClose: () => setIsOpen(false),
        priority,
        setIsOpen,
        isOpen
      }}
    /> : null
  }

  render() {
    const {
      intl,
      amIPresenter,
      shortcuts: OPEN_ACTIONS_AK,
      isMeteorConnected,
      isDropdownOpen,
      isMobile,
      isRTL,
      isSelectRandomUserEnabled,
      propsToPassModal,
    } = this.props;

    const {
      isExternalVideoModalOpen,
      isRandomUserSelectModalOpen,
      isLayoutModalOpen,
      isCameraAsContentModalOpen,
    } = this.state;

    const availableActions = this.getAvailableActions();
    const availablePresentations = this.makePresentationItems();
    const children = availablePresentations.length > 1 && amIPresenter
      ? availablePresentations.concat(availableActions) : availableActions;

    const customStyles = { top: '-1rem' };

    if (availableActions.length === 0
      || !isMeteorConnected) {
      return null;
    }

    return (
      <>
        <BBBMenu
          customStyles={!isMobile ? customStyles : null}
          accessKey={OPEN_ACTIONS_AK}
          trigger={
            <Styled.HideDropdownButton
              open={isDropdownOpen}
              hideLabel
              aria-label={intl.formatMessage(intlMessages.actionsLabel)}
              data-test="actionsButton"
              label={intl.formatMessage(intlMessages.actionsLabel)}
              icon="plus"
              color="primary"
              size="lg"
              circle
              onClick={() => null}
            />
          }
          actions={children}
          opts={{
            id: "actions-dropdown-menu",
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getcontentanchorel: null,
            fullwidth: "true",
            anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          }}
        />
        {this.renderModal(isExternalVideoModalOpen, this.setExternalVideoModalIsOpen, "low",
          ExternalVideoModal)}
        {(amIPresenter && isSelectRandomUserEnabled) ? this.renderModal(isRandomUserSelectModalOpen, this.setRandomUserSelectModalIsOpen, 
          "low", RandomUserSelectContainer) : null }
        {this.renderModal(isLayoutModalOpen, this.setLayoutModalIsOpen,
          "low", LayoutModalContainer)}
        {this.renderModal(isCameraAsContentModalOpen, this.setCameraAsContentModalIsOpen,
          'low', () => (
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
          ))}
      </>
    );
  }
}

ActionsDropdown.propTypes = propTypes;
ActionsDropdown.defaultProps = defaultProps;

export default withShortcutHelper(ActionsDropdown, 'openActions');
