import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
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
  title: {
    id: 'app.note.title',
    description: 'Title for the shared notes',
  },
});

class UserNotes extends PureComponent {
  render() {
    const {
      intl,
    } = this.props;

    if (!Meteor.settings.public.note.enabled) return null;

    const toggleNotePanel = () => {
      Session.set(
        'openPanel',
        Session.get('openPanel') === 'note'
          ? 'userlist'
          : 'note',
      );
    };

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
            onClick={toggleNotePanel}
          >
            <Icon iconName='copy' className={styles.icon} />
            <span className={styles.label} >{intl.formatMessage(intlMessages.title)}</span>
          </div>
        </div>
      </div>
    );
  }
}

UserNotes.propTypes = propTypes;

export default UserNotes;
