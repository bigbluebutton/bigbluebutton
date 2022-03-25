import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

import Modal from '/imports/ui/components/common/modal/simple/component';

import Service from './service';

import Styled from './styles';

const propTypes = {
  intl: PropTypes.object.isRequired,
  meetingId: PropTypes.string.isRequired,
  requesterUserId: PropTypes.string.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.user-info.title',
    description: 'User info title label',
  },
});

class UserInfoComponent extends Component {
  renderUserInfo() {
    const { UserInfo } = this.props;
    const userInfoList = UserInfo.map((user, index, array) => {
      const infoList = user.userInfo.map((info) => {
        const key = Object.keys(info)[0];
        return (
          <tr key={key}>
            <Styled.KeyCell>{key}</Styled.KeyCell>
            <Styled.ValueCell>{info[key]}</Styled.ValueCell>
          </tr>
        );
      });
      if (array.length > 1) {
        infoList.unshift(
          <tr key={infoList.length}>
            <th>{`User ${index + 1}`}</th>
          </tr>,
        );
      }
      return infoList;
    });
    return (
      <Styled.UserInfoTable>
        <tbody>
          {userInfoList}
        </tbody>
      </Styled.UserInfoTable>
    );
  }

  render() {
    const { intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        onRequestClose={() => Service.handleCloseUserInfo()}
      >
        {this.renderUserInfo()}
      </Modal>
    );
  }
}

UserInfoComponent.propTypes = propTypes;

export default UserInfoComponent;
