import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

const intlMessages = defineMessages({
  pollLabel: {
    id: 'app.poll.pollPaneTitle',
    description: 'label for user-list poll button',
  },
});

const UserPolls = ({
  intl,
  isPresenter,
  pollIsOpen,
  forcePollOpen,
  sidebarContentPanel,
  layoutContextDispatch,
}) => {
  if (!isPresenter) return null;
  if (!pollIsOpen && !forcePollOpen) return null;

  const handleClickTogglePoll = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.POLL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.POLL
        ? PANELS.NONE
        : PANELS.POLL,
    });
  };

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
            data-test="pollMenuButton"
            onClick={handleClickTogglePoll}
            onKeyPress={() => {}}
          >
            <Icon iconName="polling" />
            <span>{intl.formatMessage(intlMessages.pollLabel)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(UserPolls);

UserPolls.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
};
