import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { styles } from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  notesTitle: {
    id: 'app.userList.notesTitle',
    description: 'Title for the notes list',
  },
});

class UserNotes extends PureComponent {
  render() {
    const {
      intl,
    } = this.props;

    if (!Meteor.settings.public.note.enabled) return null;

    return (
      <div className={styles.messages}>
        {
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.notesTitle)}
          </h2>
        }
        <div className={styles.scrollableList}>
          <div
            role='button'
            tabIndex={0}
            className={styles.noteLink}
            onClick={() => {
              Session.set('isChatOpen', false);
              Session.set('isPollOpen', false);
              Session.set('breakoutRoomIsOpen', false);

              return Session.equals('isNoteOpen', true)
                ? Session.set('isNoteOpen', false)
                : Session.set('isNoteOpen', true);
            }}
          >
            <Icon iconName='copy' className={styles.icon} />
            <span className={styles.label} >{intl.formatMessage(intlMessages.notesTitle)}</span>
          </div>
        </div>
      </div>
    );
  }
}

UserNotes.propTypes = propTypes;

export default injectIntl(UserNotes);
