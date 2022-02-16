import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import Styled from './styles';

const messages = defineMessages({
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'confirm button label',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'cancel confirm button label',
  },
  removeConfirmTitle: {
    id: 'app.userList.menu.removeConfirmation.label',
    description: 'title for remove user confirmation modal',
  },
  removeConfirmDesc: {
    id: 'app.userlist.menu.removeConfirmation.desc',
    description: 'description for remove user confirmation',
  },
});

const propTypes = {
};

class RemoveUserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
  }

  render() {
    const {
      mountModal, onConfirm, user, title, intl,
    } = this.props;

    const {
      checked,
    } = this.state;

    return (
      <Styled.RemoveUserModal
        onRequestClose={() => mountModal(null)}
        hideBorder
        contentLabel={title}
      >
        <Styled.Container>
          <Styled.Header>
            <Styled.Title>
              {intl.formatMessage(messages.removeConfirmTitle, { 0: user.name })}
            </Styled.Title>
          </Styled.Header>
          <Styled.Description>
            <label htmlFor="banUserCheckbox" key="eject-or-ban-user">
              <Styled.BanUserCheckBox
                type="checkbox"
                id="banUserCheckbox"
                onChange={() => this.setState({ checked: !checked })}
                checked={checked}
                aria-label={intl.formatMessage(messages.removeConfirmDesc)}
              />
              <span aria-hidden>{intl.formatMessage(messages.removeConfirmDesc)}</span>
            </label>
          </Styled.Description>

          <Styled.Footer>
            <Styled.ConfirmButton
              color="primary"
              label={intl.formatMessage(messages.yesLabel)}
              onClick={() => {
                onConfirm(user.userId, checked);
                mountModal(null);
              }}
            />
            <Styled.DismissButton
              label={intl.formatMessage(messages.noLabel)}
              onClick={() => mountModal(null)}
            />
          </Styled.Footer>
        </Styled.Container>
      </Styled.RemoveUserModal>
    );
  }
}

RemoveUserModal.propTypes = propTypes;
export default withModalMounter(RemoveUserModal);
