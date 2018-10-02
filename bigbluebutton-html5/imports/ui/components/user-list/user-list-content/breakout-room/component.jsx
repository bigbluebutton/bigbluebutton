import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

class BreakoutRoomItem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      isPresenter,
      hasBreakoutRoom,
      intl,
    } = this.props;
    if (isPresenter && hasBreakoutRoom) {
      return (
        <div >
          <h2 className={styles.smallTitle}> {intl.formatMessage(intlMessages.breakoutTitle).toUpperCase()}</h2>
          <div className={styles.BreakoutRoomsItem}>
            <Link
            to="users/breakout"
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
  }
}

export default injectIntl(BreakoutRoomItem);
