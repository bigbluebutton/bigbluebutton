import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';

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
        <div className={styles.container}>
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.pollLabel)}
          </h2>
        </div>
        <div className={styles.list}>
          <div className={styles.scrollableList}>
            <div
              role="button"
              tabIndex={0}
              className={styles.listItem}
              onClick={handleClickTogglePoll}
            >
              <Icon iconName="polling" />
              <span>{intl.formatMessage(intlMessages.pollLabel)}</span>
            </div>
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
