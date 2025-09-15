import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import ExternalVideoModal from '/imports/ui/components/external-video-player/external-video-player-graphql/modal/component';
import LayoutModalContainer from '/imports/ui/components/layout/modal/container';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { ActionButtonDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/action-button-dropdown-item/enums';
import Styled from './styles';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { PANELS, ACTIONS, LAYOUT_TYPE } from '../../layout/enums';
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
  isTimerActive: PropTypes.bool.isRequired,
  isTimerEnabled: PropTypes.bool.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  stopExternalVideoShare: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setMeetingLayout: PropTypes.func.isRequired,
  setPushLayout: PropTypes.func.isRequired,
  showPushLayout: PropTypes.bool.isRequired,
  isTimerFeatureEnabled: PropTypes.bool.isRequired,
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
  actionsLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  activateTimerStopwatchLabel: {
    id: 'app.actionsBar.actionsDropdown.activateTimerStopwatchLabel',
    description: 'Activate timer/stopwatch label',
  },
  deactivateTimerStopwatchLabel: {
    id: 'app.actionsBar.actionsDropdown.deactivateTimerStopwatchLabel',
    description: 'Deactivate timer/stopwatch label',
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
  pollQuizBtnLabel: {
    id: 'app.actionsBar.actionsDropdown.pollQuizBtnLabel',
    description: 'poll/quiz menu toggle button label',
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

class ActionsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.presentationItemId = uniqueId('action-item-');
    this.pollId = uniqueId('action-item-');
    this.takePresenterId = uniqueId('action-item-');
    this.timerId = uniqueId('action-item-');
    this.selectUserRandId = uniqueId('action-item-');
    this.state = {
      isExternalVideoModalOpen: false,
      isLayoutModalOpen: false,
      isCameraAsContentModalOpen: false,
    };

    this.handleExternalVideoClick = this.handleExternalVideoClick.bind(this);
    this.makePresentationItems = this.makePresentationItems.bind(this);
    this.setExternalVideoModalIsOpen = this.setExternalVideoModalIsOpen.bind(this);
    this.setLayoutModalIsOpen = this.setLayoutModalIsOpen.bind(this);
    this.setCameraAsContentModalIsOpen = this.setCameraAsContentModalIsOpen.bind(this);
    this.setPropsToPassModal = this.setPropsToPassModal.bind(this);
    this.setForceOpen = this.setForceOpen.bind(this);
    this.handleTimerClick = this.handleTimerClick.bind(this);
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

  handleTimerClick() {
    const { isTimerActive, activateTimer, deactivateTimer } = this.props;
    if (!isTimerActive) {
      activateTimer();
    } else {
      deactivateTimer();
    }
  }

  getAvailableActions() {
    const {
      intl,
      amIPresenter,
      allowExternalVideo,
      handleTakePresenter,
      isSharingVideo,
      isPollingEnabled,
      stopExternalVideoShare,
      isTimerActive,
      isTimerEnabled,
      layoutContextDispatch,
      amIModerator,
      hasCameraAsContent,
      actionButtonDropdownItems,
      isCameraAsContentEnabled,
      isTimerFeatureEnabled,
      presentations,
      isPresentationEnabled,
      isPresentationManagementDisabled,
      isQuizEnabled,
    } = this.props;

    const {
      pollBtnLabel,
      presentationLabel,
      takePresenter,
      pollQuizBtnLabel,
    } = intlMessages;

    const { formatMessage } = intl;

    const actions = [];

    if (amIPresenter && !isPresentationManagementDisabled && isPresentationEnabled) {
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
      });
    }

    if (amIPresenter && isPollingEnabled) {
      actions.push({
        icon: 'polling',
        dataTest: 'polling',
        label: isQuizEnabled ? formatMessage(pollQuizBtnLabel) : formatMessage(pollBtnLabel),
        key: this.pollId,
        onClick: () => {
          if (Session.equals('pollInitiated', true)) {
            Session.setItem('resetPollPanel', true);
          }
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: true,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.POLL,
          });
          Session.setItem('forcePollOpen', true);
        },
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

    if (amIModerator && isTimerEnabled && isTimerFeatureEnabled) {
      actions.push({
        icon: 'time',
        label: isTimerActive
          ? intl.formatMessage(intlMessages.deactivateTimerStopwatchLabel)
          : intl.formatMessage(intlMessages.activateTimerStopwatchLabel),
        key: this.timerId,
        onClick: () => this.handleTimerClick(),
        dataTest: 'timerStopWatchFeature',
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
            dataTest: actionButtonItem.dataTest,
          });
          break;
        case ActionButtonDropdownItemType.SEPARATOR:
          actions.push({
            key: actionButtonItem.id,
            allowed: actionButtonItem.allowed,
            isSeparator: true,
            dataTest: actionButtonItem.dataTest,
          });
          break;
        default:
          break;
      }
    });

    return actions;
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
      isDropdownOpen,
      isMobile,
      isRTL,
      propsToPassModal,
    } = this.props;

    const {
      isExternalVideoModalOpen,
      isLayoutModalOpen,
      isCameraAsContentModalOpen,
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
          trigger={(
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

ActionsDropdown.propTypes = propTypes;
ActionsDropdown.defaultProps = defaultProps;

export default ActionsDropdown;
