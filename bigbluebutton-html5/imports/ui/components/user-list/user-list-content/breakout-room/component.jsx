import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';

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
      <div className={styles.messages}>
        <div className={styles.container}>
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.breakoutTitle)}
          </h2>
        </div>
        <div className={styles.scrollableList}>
          <div className={styles.list}>
            <div
              role="button"
              tabIndex={0}
              onClick={toggleBreakoutPanel}
              className={styles.listItem}
              aria-label={intl.formatMessage(intlMessages.breakoutTitle)}
            >
              <Icon iconName="rooms" />
              <span aria-hidden>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <span />;
};

export default injectIntl(BreakoutRoomItem);

BreakoutRoomItem.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
};
