import React, { Component } from 'react';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { styles } from './styles';

const intlMessages = defineMessages({
  pollLabel: {
    id: 'app.poll.pollPaneTitle',
    description: 'label for user-list poll button',
  },
});

class UserPolls extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      intl,
      isPresenter,
      pollIsOpen,
      forcePollOpen,
    } = this.props;

    if (!isPresenter) return null;
    if (!pollIsOpen && !forcePollOpen) return null;

    return (
      <div className={styles.messages}>
        {
          <h2 className={styles.smallTitle}>
            {'Polling'}
          </h2>
        }
        <div className={styles.scrollableList}>
          <div
            role="button"
            tabIndex={0}
            className={styles.pollLink}
            onClick={() => {
              Session.set('isChatOpen', false);
              Session.set('breakoutRoomIsOpen', false);

              return Session.equals('isPollOpen', true)
                ? Session.set('isPollOpen', false)
                : Session.set('isPollOpen', true);
            }}
          >
            <Icon iconName="polling" className={styles.icon} />
            <span className={styles.label} >{intl.formatMessage(intlMessages.pollLabel)}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(UserPolls);
