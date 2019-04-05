import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { makeCall } from '/imports/ui/services/api';

import { styles } from './styles';

const propTypes = {
  intl: intlShape.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.user-info.title',
    description: 'User info title label',
  },
});

class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.handleCloseUserInfo = this.handleCloseUserInfo.bind(this);
  }

  handleCloseUserInfo() {
    const { mountModal, requesterUserId, meetingId } = this.props;
    makeCall('removeUserInformation', meetingId, requesterUserId);
  }

  renderUserInfo(UserInfo) {
    const userInfoList = UserInfo.map((user, index, array) => {
      const infoList = user.userInfo.map((info) => {
        const key = Object.keys(info)[0];
        return (
          <tr key={key}>
            <td className={styles.keyCell}>{key}</td>
            <td className={styles.valueCell}>{info[key]}</td>
          </tr>
        );
      });
      if (array.length > 1) {
        infoList.unshift(<tr key={infoList.length}>
          <th className={styles.titleCell}>{`User ${index + 1}`}</th>
        </tr>);
      }
      return infoList;
    });
    return (
      <table className={styles.userInfoTable}>
        <tbody>
          {userInfoList}
        </tbody>
      </table>
    );
  }

  render() {
    const { intl, UserInfo } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        onRequestClose={this.handleCloseUserInfo}
      >
        {this.renderUserInfo(UserInfo)}
      </Modal>
    );
  }
}

UserInfo.propTypes = propTypes;

export default UserInfo;
