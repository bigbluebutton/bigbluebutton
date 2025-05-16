import React, { Fragment, Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const intlMessages = defineMessages({
  lockViewersTitle: {
    id: 'app.lock-viewers.title',
    description: 'lock-viewers title',
  },
  closeLabel: {
    id: 'app.shortcut-help.closeLabel',
    description: 'label for close button',
  },
  closeDesc: {
    id: 'app.shortcut-help.closeDesc',
    description: 'description for close button',
  },
  lockViewersDescription: {
    id: 'app.lock-viewers.description',
    description: 'description for lock viewers feature',
  },
  featuresLable: {
    id: 'app.lock-viewers.featuresLable',
    description: 'features label',
  },
  lockStatusLabel: {
    id: 'app.lock-viewers.lockStatusLabel',
    description: 'description for close button',
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
    id: 'app.lock-viewers.microphoneLable',
    description: 'label for microphone toggle',
  },
  publicChatLabel: {
    id: 'app.lock-viewers.PublicChatLabel',
    description: 'label for public chat toggle',
  },
  privateChatLabel: {
    id: 'app.lock-viewers.PrivateChatLable',
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
  lockedLabel: {
    id: 'app.lock-viewers.locked',
    description: 'locked element label',
  },
  hideCursorsLabel: {
    id: 'app.lock-viewers.hideViewersCursor',
    description: 'label for other viewers cursor',
  },
  hideAnnotationsLabel: {
    id: 'app.lock-viewers.hideAnnotationsLabel',
    description: 'label for other viewers annotation',
  },
  presentationUpload: {
    id: 'app.lock-viewers.presentationUpload',
    description: 'label for presentation upload',
  },
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  meeting: PropTypes.shape({}).isRequired,
  updateLockSettings: PropTypes.func.isRequired,
  updateWebcamsOnlyForModerator: PropTypes.func.isRequired,
};

class LockViewersComponent extends Component {
  constructor(props) {
    super(props);

    const { meeting: { lockSettings, usersPolicies } } = this.props;

    this.state = {
      lockSettingsProps: lockSettings,
      usersProp: usersPolicies,
    };
  }

  componentWillUnmount() {
    const { closeModal } = this.props;

    closeModal();
  }

  toggleLockSettings(property) {
    const { lockSettingsProps } = this.state;

    lockSettingsProps[property] = !lockSettingsProps[property];

    this.setState({
      lockSettingsProps,
    });
  }

  toggleUserProps(property) {
    const { usersProp } = this.state;

    usersProp[property] = !usersProp[property];

    this.setState({
      usersProp,
    });
  }

  displayLockStatus(status) {
    const { intl } = this.props;
    return (
      status && (
      <Styled.ToggleLabel>
        {intl.formatMessage(intlMessages.lockedLabel)}
      </Styled.ToggleLabel>
      )
    );
  }

  render() {
    const {
      closeModal,
      intl,
      updateLockSettings,
      updateWebcamsOnlyForModerator,
      isOpen,
      onRequestClose,
      priority,
      isChatEnabled,
      isPrivateChatEnabled,
      isSharedNotesEnabled,
    } = this.props;

    const { lockSettingsProps, usersProp } = this.state;

    console.log({ usersProp, lockSettingsProps });
    return (
      <Styled.LockViewersModal
        onRequestClose={closeModal}
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        title={intl.formatMessage(intlMessages.lockViewersTitle)}
        {...{
          isOpen,
          onRequestClose,
          priority,
        }}
      >
        <Styled.Container>
          <Styled.Description>
            {`${intl.formatMessage(intlMessages.lockViewersDescription)}`}
          </Styled.Description>

          <Styled.Form>
            <Styled.Row data-test="lockShareWebcamItem">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.disableCam}
                    onChange={() => this.toggleLockSettings('disableCam')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.webcamLabel)}`,
                      'data-test': 'lockShareWebcam',
                    }}
                  />
                  {/* {this.displayLockStatus(lockSettingsProps.disableCam)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.webcamLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>
            <Styled.Row data-test="lockSeeOtherViewersWebcamItem">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!usersProp.webcamsOnlyForModerator}
                    onChange={() => this.toggleUserProps('webcamsOnlyForModerator')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.otherViewersWebcamLabel),
                      'data-test': 'lockSeeOtherViewersWebcam',
                    }}
                  />
                  {/* {this.displayLockStatus(usersProp.webcamsOnlyForModerator)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.otherViewersWebcamLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>
            <Styled.Row data-test="lockShareMicrophoneItem">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.disableMic}
                    onChange={() => this.toggleLockSettings('disableMic')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.microphoneLabel),
                      'data-test': 'lockShareMicrophone',
                    }}
                  />
                  {/* {this.displayLockStatus(lockSettingsProps.disableMic)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.microphoneLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>

            {isChatEnabled ? (
              <>
                <Styled.Row data-test="lockPublicChatItem">
                  <Styled.ColToggle>
                    <Styled.FormElementLeft>
                      <Styled.MaterialSwitch
                        checked={!lockSettingsProps.disablePublicChat}
                        onChange={() => this.toggleLockSettings('disablePublicChat')}
                        inputProps={{
                          'aria-label': intl.formatMessage(intlMessages.publicChatLabel),
                          'data-test': 'lockPublicChat',
                        }}
                      />
                      {/* {this.displayLockStatus(lockSettingsProps.disablePublicChat)} */}
                    </Styled.FormElementLeft>
                  </Styled.ColToggle>
                  <Styled.Col aria-hidden="true">
                    <Styled.FormElement>
                      <Styled.Label>
                        {intl.formatMessage(intlMessages.publicChatLabel)}
                      </Styled.Label>
                    </Styled.FormElement>
                  </Styled.Col>
                </Styled.Row>
                {isPrivateChatEnabled ? (
                  <Styled.Row data-test="lockPrivateChatItem">
                    <Styled.ColToggle>
                      <Styled.FormElementLeft>
                        <Styled.MaterialSwitch
                          checked={!lockSettingsProps.disablePrivateChat}
                          onChange={() => this.toggleLockSettings('disablePrivateChat')}
                          inputProps={{
                            'aria-label': intl.formatMessage(intlMessages.privateChatLabel),
                            'data-test': 'lockPrivateChat',
                          }}
                        />
                        {/* {this.displayLockStatus(lockSettingsProps.disablePrivateChat)} */}
                      </Styled.FormElementLeft>
                    </Styled.ColToggle>
                    <Styled.Col aria-hidden="true">
                      <Styled.FormElement>
                        <Styled.Label>
                          {intl.formatMessage(intlMessages.privateChatLabel)}
                        </Styled.Label>
                      </Styled.FormElement>
                    </Styled.Col>
                  </Styled.Row>
                ) : null}
              </>
            ) : null}
            {isSharedNotesEnabled
              ? (
                <Styled.Row data-test="lockEditSharedNotesItem">
                  <Styled.ColToggle>
                    <Styled.FormElementLeft>
                      <Styled.MaterialSwitch
                        checked={!lockSettingsProps.disableNotes}
                        onChange={() => this.toggleLockSettings('disableNotes')}
                        inputProps={{
                          'aria-label': intl.formatMessage(intlMessages.notesLabel),
                          'data-test': 'lockEditSharedNotes',
                        }}
                      />
                      {/* {this.displayLockStatus(lockSettingsProps.disableNotes)} */}
                    </Styled.FormElementLeft>
                  </Styled.ColToggle>
                  <Styled.Col aria-hidden="true">
                    <Styled.FormElement>
                      <Styled.Label>
                        {intl.formatMessage(intlMessages.notesLabel)}
                      </Styled.Label>
                    </Styled.FormElement>
                  </Styled.Col>
                </Styled.Row>
              )
              : null}
            <Styled.Row data-test="lockUserListItem">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.hideUserList}
                    onChange={() => this.toggleLockSettings('hideUserList')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.userListLabel),
                      'data-test': 'lockUserList',
                    }}
                  />
                  {/* {this.displayLockStatus(lockSettingsProps.hideUserList)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.userListLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>

            <Styled.Row data-test="hideViewersCursorItem">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.hideViewersCursor}
                    onChange={() => this.toggleLockSettings('hideViewersCursor')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.hideCursorsLabel),
                      'data-test': 'hideViewersCursor',
                    }}
                  />
                  {/* {this.displayLockStatus(lockSettingsProps.hideViewersCursor)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.hideCursorsLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>

            <Styled.Row data-test="hideViewersAnnotation">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.hideViewersAnnotation}
                    onChange={() => this.toggleLockSettings('hideViewersAnnotation')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.hideAnnotationsLabel),
                      'data-test': 'hideViewersAnnotation',
                    }}
                  />
                  {/* {this.displayLockStatus(lockSettingsProps.hideViewersAnnotation)} */}
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.hideAnnotationsLabel)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>

            <Styled.Row data-test="lockUploadPresentation">
              <Styled.ColToggle>
                <Styled.FormElementLeft>
                  <Styled.MaterialSwitch
                    checked={!lockSettingsProps.disablePresentationUpload}
                    onChange={() => this.toggleLockSettings('disablePresentationUpload')}
                    inputProps={{
                      'aria-label': intl.formatMessage(intlMessages.presentationUpload),
                      'data-test': 'hideViewersAnnotation',
                    }}
                  />
                </Styled.FormElementLeft>
              </Styled.ColToggle>
              <Styled.Col aria-hidden="true">
                <Styled.FormElement>
                  <Styled.Label>
                    {intl.formatMessage(intlMessages.presentationUpload)}
                  </Styled.Label>
                </Styled.FormElement>
              </Styled.Col>
            </Styled.Row>
          </Styled.Form>
        </Styled.Container>
        <Styled.Footer>
          <Styled.Actions>
            <Styled.ButtonCancel
              label={intl.formatMessage(intlMessages.buttonCancel)}
              onClick={closeModal}
              color="secondary"
            />
            <Styled.ButtonApply
              color="primary"
              label={intl.formatMessage(intlMessages.buttonApply)}
              onClick={() => {
                updateLockSettings(lockSettingsProps);
                updateWebcamsOnlyForModerator(usersProp.webcamsOnlyForModerator);
                closeModal();
              }}
              data-test="applyLockSettings"
            />
          </Styled.Actions>
        </Styled.Footer>
      </Styled.LockViewersModal>
    );
  }
}

LockViewersComponent.propTypes = propTypes;

export default injectIntl(LockViewersComponent);
