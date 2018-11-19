import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});
const toggleBreakoutPanel = () => {
  Session.set(
    'openPanel',
    Session.get('openPanel') === 'breakoutroom'
      ? 'userlist'
      : 'breakoutroom',
  );
};

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  intl,
}) => {
  if (hasBreakoutRoom) {
    return (
      <div role="button" onClick={toggleBreakoutPanel}>
        <h2 className={styles.smallTitle}> {intl.formatMessage(intlMessages.breakoutTitle).toUpperCase()}</h2>
        <div className={styles.BreakoutRoomsItem}>
          <div className={styles.BreakoutRoomsContents}>
            <div className={styles.BreakoutRoomsIcon} >
              <Icon iconName="rooms" />
            </div>
            <span className={styles.BreakoutRoomsText}>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
          </div>
        </div>
      </div>
    );
  }
  return <span />;
};

export default injectIntl(BreakoutRoomItem);
