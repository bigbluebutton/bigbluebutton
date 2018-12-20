import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

class UserPolls extends PureComponent {
  render() {
    const handleClickTogglePoll = () => {
      Session.set(
        'openPanel',
        Session.get('openPanel') === 'poll'
          ? 'userlist'
          : 'poll',
      );
    };

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
            onClick={handleClickTogglePoll}
          >
            <Icon iconName="polling" className={styles.icon} />
            <span className={styles.label}>{intl.formatMessage(intlMessages.pollLabel)}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(UserPolls);

UserPolls.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
};
