import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { clone } from 'radash';
import { MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import UnsavedChangesModal from '/imports/ui/components/common/modal/unsaved-changes/component';
import Styled from './styles';

const PRESENTATION_POLICY = {
  MODERATOR_ONLY: 'moderatorOnly',
  REQUIRE_APPROVAL: 'requireApproval',
  FREE_FOR_ALL: 'freeForAll',
};

const intlMessages = defineMessages({
  lockViewersTitle: {
    id: 'app.lock-viewers.title',
    description: 'lock-viewers title',
  },
  ariaModalTitle: {
    id: 'app.lock-viewers.ariaTitle',
    description: 'aria label for modal title',
  },
  buttonApply: {
    id: 'app.lock-viewers.button.apply',
    description: 'label for apply button',
  },
  buttonCancel: {
    id: 'app.lock-viewers.button.cancel',
    description: 'label for cancel button',
  },
  guestPolicyTab: {
    id: 'app.lock-viewers.tabs.guestPolicy',
    description: 'Guest policy tab label',
  },
  participantPermissionsTab: {
    id: 'app.lock-viewers.tabs.participantPermissions',
    description: 'Participant permissions tab label',
  },
  presentationPermissionsTab: {
    id: 'app.lock-viewers.tabs.presentationPermissions',
    description: 'Presentation permissions tab label',
  },
  guestPolicyTitle: {
    id: 'app.lock-viewers.guestPolicy.title',
    description: 'Guest policy section title',
  },
  guestPolicyDescription: {
    id: 'app.lock-viewers.guestPolicy.description',
    description: 'Guest policy section description',
  },
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
  lobbyMessageLabel: {
    id: 'app.userList.guest.inputPlaceholder',
    description: 'Lobby message label',
  },
  participantPermissionsTitle: {
    id: 'app.lock-viewers.participantPermissions.title',
    description: 'Participant permissions section title',
  },
  participantPermissionsDescription: {
    id: 'app.lock-viewers.participantPermissions.description',
    description: 'Participant permissions section description',
  },
  webcamLabel: {
    id: 'app.lock-viewers.webcamLabel',
    description: 'label for webcam toggle',
  },
  otherViewersWebcamLabel: {
    id: 'app.lock-viewers.otherViewersWebcamLabel',
    description: 'label for other viewers webcam toggle',
  },
  microphoneLabel: {
    id: 'app.lock-viewers.microphoneLabel',
    description: 'label for microphone toggle',
  },
  publicChatLabel: {
    id: 'app.lock-viewers.PublicChatLabel',
    description: 'label for public chat toggle',
  },
  privateChatLabel: {
    id: 'app.lock-viewers.PrivateChatLabel',
    description: 'label for private chat toggle',
  },
  notesLabel: {
    id: 'app.lock-viewers.notesLabel',
    description: 'label for shared notes toggle',
  },
  userListLabel: {
    id: 'app.lock-viewers.userListLabel',
    description: 'label for user list toggle',
  },
  hideCursorsLabel: {
    id: 'app.lock-viewers.hideViewersCursor',
    description: 'label for other viewers cursor',
  },
  hideAnnotationsLabel: {
    id: 'app.lock-viewers.hideAnnotationsLabel',
    description: 'label for other viewers annotation',
  },
  submitLabel: {
    id: 'app.chat.submitLabel',
    description: 'Submit button label',
  },
  presentationPermissionsTitle: {
    id: 'app.lock-viewers.presentationPermissions.title',
    description: 'Presentation permissions section title',
  },
  presentationPermissionsDescription: {
    id: 'app.lock-viewers.presentationPermissions.description',
    description: 'Presentation permissions section description',
  },
  presModeratorOnly: {
    id: 'app.lock-viewers.presentationPermissions.moderatorOnly',
    description: 'Only moderator can assign presenter',
  },
  presModeratorOnlyTooltip: {
    id: 'app.lock-viewers.presentationPermissions.moderatorOnly.tooltip',
    description: 'Tooltip for moderator only option',
  },
  presRequireApproval: {
    id: 'app.lock-viewers.presentationPermissions.requireApproval',
    description: 'Participants can request with approval',
  },
  presRequireApprovalTooltip: {
    id: 'app.lock-viewers.presentationPermissions.requireApproval.tooltip',
    description: 'Tooltip for require approval option',
  },
  presFreeForAll: {
    id: 'app.lock-viewers.presentationPermissions.freeForAll',
    description: 'Anyone can present freely',
  },
  presFreeForAllTooltip: {
    id: 'app.lock-viewers.presentationPermissions.freeForAll.tooltip',
    description: 'Tooltip for free for all option',
  },
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  meeting: PropTypes.shape({
    lockSettings: PropTypes.shape({
      presenterPolicy: PropTypes.string,
      disableCam: PropTypes.bool,
      disableMic: PropTypes.bool,
      disablePublicChat: PropTypes.bool,
      disablePrivateChat: PropTypes.bool,
      disableNotes: PropTypes.bool,
      isolateUsers: PropTypes.bool,
      hideViewersCursor: PropTypes.bool,
      hideViewersAnnotation: PropTypes.bool,
      lockOnJoin: PropTypes.bool,
      lockOnJoinConfigurable: PropTypes.bool,
    }),
    usersPolicies: PropTypes.shape({
      guestPolicy: PropTypes.string,
      webcamsOnlyForModerator: PropTypes.bool,
    }),
  }).isRequired,
  updateLockSettings: PropTypes.func.isRequired,
  updateWebcamsOnlyForModerator: PropTypes.func.isRequired,
  changeGuestPolicy: PropTypes.func.isRequired,
  setLobbyMessage: PropTypes.func.isRequired,
  guestLobbyMessage: PropTypes.string,
  isChatEnabled: PropTypes.bool.isRequired,
  isPrivateChatEnabled: PropTypes.bool.isRequired,
  isSharedNotesEnabled: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool,
  priority: PropTypes.string,
};

class LockViewersComponent extends Component {
  constructor(props) {
    super(props);

    const { meeting: { lockSettings, usersPolicies } } = this.props;

    const presentationPolicy = lockSettings.presenterPolicy || PRESENTATION_POLICY.REQUIRE_APPROVAL;

    this.state = {
      selectedTab: 0,
      lockSettingsProps: clone(lockSettings),
      usersProp: clone(usersPolicies),
      guestPolicy: usersPolicies.guestPolicy || 'ASK_MODERATOR',
      lobbyMessageEnabled: !!props.guestLobbyMessage,
      lobbyMessage: props.guestLobbyMessage || '',
      presentationPolicy,
      unsavedModalOpen: false,
    };

    this.initialState = {
      lockSettingsProps: clone(lockSettings),
      usersProp: clone(usersPolicies),
      guestPolicy: usersPolicies.guestPolicy || 'ASK_MODERATOR',
      lobbyMessageEnabled: !!props.guestLobbyMessage,
      lobbyMessage: props.guestLobbyMessage || '',
      presentationPolicy,
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleIgnoreChanges = this.handleIgnoreChanges.bind(this);
  }

  handleClose() {
    const { closeModal } = this.props;
    if (this.hasChanges()) {
      this.setState({ unsavedModalOpen: true });
      return;
    }
    closeModal();
  }

  handleIgnoreChanges() {
    const { closeModal } = this.props;
    this.setState({ unsavedModalOpen: false }, closeModal);
  }

  handleSave() {
    const {
      closeModal,
      updateLockSettings,
      updateWebcamsOnlyForModerator,
      changeGuestPolicy,
      setLobbyMessage,
    } = this.props;

    const {
      lockSettingsProps,
      usersProp,
      guestPolicy,
      lobbyMessageEnabled,
      lobbyMessage,
      presentationPolicy,
    } = this.state;

    const finalLockSettings = { ...lockSettingsProps };
    finalLockSettings.presenterPolicy = presentationPolicy;

    updateLockSettings(finalLockSettings);
    updateWebcamsOnlyForModerator(usersProp.webcamsOnlyForModerator);
    changeGuestPolicy(guestPolicy);

    if (!lobbyMessageEnabled) {
      setLobbyMessage('');
    } else if (lobbyMessage) {
      setLobbyMessage(lobbyMessage);
    }

    closeModal();
  }

  handleSelectTab(tabIndex) {
    this.setState({ selectedTab: tabIndex });
  }

  hasChanges() {
    const {
      lockSettingsProps, usersProp, guestPolicy,
      lobbyMessageEnabled, lobbyMessage, presentationPolicy,
    } = this.state;
    const i = this.initialState;
    return (
      JSON.stringify(lockSettingsProps) !== JSON.stringify(i.lockSettingsProps)
      || JSON.stringify(usersProp) !== JSON.stringify(i.usersProp)
      || guestPolicy !== i.guestPolicy
      || lobbyMessageEnabled !== i.lobbyMessageEnabled
      || lobbyMessage !== i.lobbyMessage
      || presentationPolicy !== i.presentationPolicy
    );
  }

  toggleLockSettings(property) {
    const { lockSettingsProps } = this.state;
    this.setState({
      lockSettingsProps: {
        ...lockSettingsProps,
        [property]: !lockSettingsProps[property],
      },
    });
  }

  toggleUserProps(property) {
    const { usersProp } = this.state;
    this.setState({
      usersProp: {
        ...usersProp,
        [property]: !usersProp[property],
      },
    });
  }

  renderGuestPolicyTab() {
    const { intl } = this.props;
    const { guestPolicy, lobbyMessageEnabled, lobbyMessage } = this.state;

    return (
      <Styled.TabContent>
        <Styled.SectionTitle>
          {intl.formatMessage(intlMessages.guestPolicyTitle)}
        </Styled.SectionTitle>
        <Styled.SectionDescription>
          {intl.formatMessage(intlMessages.guestPolicyDescription)}
        </Styled.SectionDescription>
        <Styled.GuestPolicySelector
          value={guestPolicy}
          IconComponent={ExpandMoreIcon}
          onChange={(e) => this.setState({ guestPolicy: e.target.value })}
          data-test="guestPolicySelector"
        >
          <MenuItem value="ASK_MODERATOR" data-test="askModerator">
            {intl.formatMessage(intlMessages.askModerator)}
          </MenuItem>
          <MenuItem value="ALWAYS_ACCEPT" data-test="alwaysAccept">
            {intl.formatMessage(intlMessages.alwaysAccept)}
          </MenuItem>
          <MenuItem value="ALWAYS_DENY" data-test="alwaysDeny">
            {intl.formatMessage(intlMessages.alwaysDeny)}
          </MenuItem>
        </Styled.GuestPolicySelector>
        <Styled.LobbyMessageSection>
          <Styled.SwitchRow>
            <Styled.MaterialSwitch
              checked={lobbyMessageEnabled}
              onChange={(_, checked) => {
                this.setState({ lobbyMessageEnabled: checked });
                if (!checked) this.setState({ lobbyMessage: '' });
              }}
            />
            <Styled.SwitchLabel
              onClick={() => {
                const next = !lobbyMessageEnabled;
                this.setState({ lobbyMessageEnabled: next });
                if (!next) this.setState({ lobbyMessage: '' });
              }}
            >
              {intl.formatMessage(intlMessages.lobbyMessageLabel)}
            </Styled.SwitchLabel>
          </Styled.SwitchRow>
          {lobbyMessageEnabled && (
            <Styled.LobbyInputWrapper>
              <Styled.LobbyInput
                placeholder={intl.formatMessage(intlMessages.lobbyMessageLabel)}
                value={lobbyMessage}
                onChange={(e) => this.setState({ lobbyMessage: e.target.value })}
                data-test="lobbyMessageInput"
              />
              <Styled.LobbyInputSendButton
                aria-label={intl.formatMessage(intlMessages.submitLabel)}
                onClick={() => {
                  const { setLobbyMessage: setMsg } = this.props;
                  const { lobbyMessage: msg } = this.state;
                  setMsg(msg);
                }}
              >
                ▶
              </Styled.LobbyInputSendButton>
            </Styled.LobbyInputWrapper>
          )}
        </Styled.LobbyMessageSection>
      </Styled.TabContent>
    );
  }

  renderParticipantPermissionsTab() {
    const {
      intl, isChatEnabled, isPrivateChatEnabled, isSharedNotesEnabled,
    } = this.props;
    const { lockSettingsProps, usersProp } = this.state;

    const checkboxItems = [
      {
        key: 'disableCam',
        label: intlMessages.webcamLabel,
        checked: !lockSettingsProps.disableCam,
        toggle: () => this.toggleLockSettings('disableCam'),
        dataTest: 'lockShareWebcam',
      },
      {
        key: 'webcamsOnlyForModerator',
        label: intlMessages.otherViewersWebcamLabel,
        checked: !usersProp.webcamsOnlyForModerator,
        toggle: () => this.toggleUserProps('webcamsOnlyForModerator'),
        dataTest: 'lockSeeOtherViewersWebcam',
      },
      {
        key: 'disableMic',
        label: intlMessages.microphoneLabel,
        checked: !lockSettingsProps.disableMic,
        toggle: () => this.toggleLockSettings('disableMic'),
        dataTest: 'lockShareMicrophone',
      },
    ];

    if (isChatEnabled) {
      checkboxItems.push({
        key: 'disablePublicChat',
        label: intlMessages.publicChatLabel,
        checked: !lockSettingsProps.disablePublicChat,
        toggle: () => this.toggleLockSettings('disablePublicChat'),
        dataTest: 'lockPublicChat',
      });
      if (isPrivateChatEnabled) {
        checkboxItems.push({
          key: 'disablePrivateChat',
          label: intlMessages.privateChatLabel,
          checked: !lockSettingsProps.disablePrivateChat,
          toggle: () => this.toggleLockSettings('disablePrivateChat'),
          dataTest: 'lockPrivateChat',
        });
      }
    }

    if (isSharedNotesEnabled) {
      checkboxItems.push({
        key: 'disableNotes',
        label: intlMessages.notesLabel,
        checked: !lockSettingsProps.disableNotes,
        toggle: () => this.toggleLockSettings('disableNotes'),
        dataTest: 'lockEditSharedNotes',
      });
    }

    checkboxItems.push(
      {
        key: 'isolateUsers',
        label: intlMessages.userListLabel,
        checked: !lockSettingsProps.isolateUsers,
        toggle: () => this.toggleLockSettings('isolateUsers'),
        dataTest: 'lockUserList',
      },
      {
        key: 'hideViewersCursor',
        label: intlMessages.hideCursorsLabel,
        checked: !lockSettingsProps.hideViewersCursor,
        toggle: () => this.toggleLockSettings('hideViewersCursor'),
        dataTest: 'hideViewersCursor',
      },
      {
        key: 'hideViewersAnnotation',
        label: intlMessages.hideAnnotationsLabel,
        checked: !lockSettingsProps.hideViewersAnnotation,
        toggle: () => this.toggleLockSettings('hideViewersAnnotation'),
        dataTest: 'lockShareWhiteboard',
      },
    );

    return (
      <Styled.TabContent>
        <Styled.SectionTitle>
          {intl.formatMessage(intlMessages.participantPermissionsTitle)}
        </Styled.SectionTitle>
        <Styled.SectionDescription>
          {intl.formatMessage(intlMessages.participantPermissionsDescription)}
        </Styled.SectionDescription>
        <Styled.CheckboxList>
          {checkboxItems.map((item) => (
            <Styled.CheckboxRow key={item.key} data-test={`${item.key}Item`}>
              <Styled.MaterialCheckbox
                checked={item.checked}
                onChange={item.toggle}
                inputProps={{
                  'aria-label': intl.formatMessage(item.label),
                  'data-test': item.dataTest,
                }}
              />
              <Styled.CheckboxLabel onClick={item.toggle}>
                {intl.formatMessage(item.label)}
              </Styled.CheckboxLabel>
            </Styled.CheckboxRow>
          ))}
        </Styled.CheckboxList>
      </Styled.TabContent>
    );
  }

  renderPresentationPermissionsTab() {
    const { intl } = this.props;
    const { presentationPolicy } = this.state;

    const options = [
      {
        value: PRESENTATION_POLICY.MODERATOR_ONLY,
        label: intlMessages.presModeratorOnly,
        tooltip: intlMessages.presModeratorOnlyTooltip,
        dataTest: 'presModeratorOnly',
      },
      {
        value: PRESENTATION_POLICY.REQUIRE_APPROVAL,
        label: intlMessages.presRequireApproval,
        tooltip: intlMessages.presRequireApprovalTooltip,
        dataTest: 'presRequireApproval',
      },
      {
        value: PRESENTATION_POLICY.FREE_FOR_ALL,
        label: intlMessages.presFreeForAll,
        tooltip: intlMessages.presFreeForAllTooltip,
        dataTest: 'presFreeForAll',
      },
    ];

    return (
      <Styled.TabContent>
        <Styled.SectionTitle>
          {intl.formatMessage(intlMessages.presentationPermissionsTitle)}
        </Styled.SectionTitle>
        <Styled.SectionDescription>
          {intl.formatMessage(intlMessages.presentationPermissionsDescription)}
        </Styled.SectionDescription>
        <Styled.PresentationPolicySelector
          value={presentationPolicy}
          IconComponent={ExpandMoreIcon}
          onChange={(e) => this.setState({ presentationPolicy: e.target.value })}
          data-test="presentationPolicySelector"
          renderValue={(value) => {
            const selected = options.find((o) => o.value === value);
            return selected ? intl.formatMessage(selected.label) : '';
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              data-test={option.dataTest}
            >
              <Styled.PresentationMenuItem>
                <span>{intl.formatMessage(option.label)}</span>
                <TooltipContainer
                  title={intl.formatMessage(option.tooltip)}
                  position="right"
                >
                  <Styled.TooltipIcon>
                    <InfoOutlinedIcon fontSize="small" />
                  </Styled.TooltipIcon>
                </TooltipContainer>
              </Styled.PresentationMenuItem>
            </MenuItem>
          ))}
        </Styled.PresentationPolicySelector>
      </Styled.TabContent>
    );
  }

  render() {
    const {
      intl,
      isOpen,
      priority,
      closeModal,
    } = this.props;

    const { selectedTab, unsavedModalOpen } = this.state;

    if (unsavedModalOpen) {
      return (
        <UnsavedChangesModal
          isOpen={unsavedModalOpen}
          onCancel={() => this.setState({ unsavedModalOpen: false })}
          onConfirm={this.handleIgnoreChanges}
        />
      );
    }

    const tabs = [
      {
        label: intlMessages.guestPolicyTab,
        icon: 'guest_policy',
        dataTest: 'guestPolicyTab',
      },
      {
        label: intlMessages.participantPermissionsTab,
        icon: 'lock_viewers',
        dataTest: 'participantPermissionsTab',
      },
      {
        label: intlMessages.presentationPermissionsTab,
        icon: 'presentation_permission',
        dataTest: 'presentationPermissionsTab',
      },
    ];

    return (
      <Styled.LockViewersModal
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        title={intl.formatMessage(intlMessages.lockViewersTitle)}
        {...{
          isOpen,
          onRequestClose: this.handleClose,
          priority,
        }}
      >
        <Styled.SettingsTabs
          onSelect={(index) => this.handleSelectTab(index)}
          selectedIndex={selectedTab}
          role="presentation"
        >
          <Styled.SettingsTabList>
            {tabs.map((tab) => (
              <Styled.SettingsTabSelector
                key={tab.dataTest}
                selectedClassName="is-selected"
                data-test={tab.dataTest}
              >
                <Styled.TabIcon iconName={tab.icon} />
                <span>{intl.formatMessage(tab.label)}</span>
              </Styled.SettingsTabSelector>
            ))}
          </Styled.SettingsTabList>
          <Styled.SettingsTabPanel selectedClassName="is-selected">
            {this.renderGuestPolicyTab()}
          </Styled.SettingsTabPanel>
          <Styled.SettingsTabPanel selectedClassName="is-selected">
            {this.renderParticipantPermissionsTab()}
          </Styled.SettingsTabPanel>
          <Styled.SettingsTabPanel selectedClassName="is-selected">
            {this.renderPresentationPermissionsTab()}
          </Styled.SettingsTabPanel>
        </Styled.SettingsTabs>
        <Styled.ActionsContainer>
          <Styled.ActionButton
            onClick={closeModal}
            data-test="cancelLockSettings"
          >
            {intl.formatMessage(intlMessages.buttonCancel)}
          </Styled.ActionButton>
          <Styled.ActionButtonPrimary
            onClick={() => this.handleSave()}
            data-test="applyLockSettings"
          >
            {intl.formatMessage(intlMessages.buttonApply)}
          </Styled.ActionButtonPrimary>
        </Styled.ActionsContainer>
      </Styled.LockViewersModal>
    );
  }
}

LockViewersComponent.propTypes = propTypes;

export default injectIntl(LockViewersComponent);
