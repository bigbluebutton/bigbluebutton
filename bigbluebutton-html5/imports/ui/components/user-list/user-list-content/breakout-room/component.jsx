import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});
const USERLIST_PATH = 'users/';
const BREAKOUT_PATH = 'breakout/';

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  intl,
  location,
}) => {
  const linkPath = [USERLIST_PATH, BREAKOUT_PATH].join('');
  const path = location.pathname.includes(linkPath) ? USERLIST_PATH : linkPath;
  if (hasBreakoutRoom) {
    return (
      <div >
        <h2 className={styles.smallTitle}> {intl.formatMessage(intlMessages.breakoutTitle).toUpperCase()}</h2>
        <div className={styles.BreakoutRoomsItem}>
          <Link
            to={path}
            className={styles.link}
          >
            <div className={styles.BreakoutRoomsContents}>
              <div className={styles.BreakoutRoomsIcon} >
                <Icon iconName="rooms" />
              </div>
              <span className={styles.BreakoutRoomsText}>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }
  return <span />;
};

export default withRouter(injectIntl(BreakoutRoomItem));
