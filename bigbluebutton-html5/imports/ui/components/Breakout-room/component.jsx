import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import Icon from '../icon/component';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout duration time',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'breakout duration time',
  },
  breakoutListen: {
    id: 'app.createBreakoutRoom.listen',
    description: 'breakout duration time',
  },
});

class BreakoutRoom extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { intl } = this.props;
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <Link
            to="/users"
            role="button"
            className={styles.link} 
          >
            <Icon iconName="left_arrow" />
            {intl.formatMessage(intlMessages.breakoutTitle)}
          </Link>
          <span>{intl.formatMessage(intlMessages.breakoutDuration, '14:55')}</span>
        </div>
        <div className={styles.content}>
          <span>{intl.formatMessage(intlMessages.breakoutRoom, '1')}</span>
          <div className={styles.breakoutActions}>
            <Button
            label={intl.formatMessage(intlMessages.breakoutJoin)}
            className={styles.button}
            />
            |
            <Button
            label={intl.formatMessage(intlMessages.breakoutListen)}
            className={styles.button}
            />
            </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(BreakoutRoom);
