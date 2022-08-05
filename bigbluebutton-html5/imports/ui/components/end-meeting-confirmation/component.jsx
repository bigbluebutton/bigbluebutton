import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';

const intlMessages = defineMessages({
  endMeetingTitle: {
    id: 'app.endMeeting.title',
    description: 'end meeting title',
  },
  endMeetingDescription: {
    id: 'app.endMeeting.description',
    description: 'end meeting description with affected users information',
  },
  endMeetingNoUserDescription: {
    id: 'app.endMeeting.noUserDescription',
    description: 'end meeting description',
  },
  contentWarning: {
    id: 'app.endMeeting.contentWarning',
    description: 'end meeting content warning',
  },
});

const { warnAboutUnsavedContentOnMeetingEnd } = Meteor.settings.public.app;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  endMeeting: PropTypes.func.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  users: PropTypes.number.isRequired,
};

class EndMeetingComponent extends PureComponent {
  render() {
    const {
      users, intl, endMeeting, meetingTitle,
    } = this.props;

    const title = intl.formatMessage(intlMessages.endMeetingTitle, { 0: meetingTitle });

    let description = users > 0
      ? intl.formatMessage(intlMessages.endMeetingDescription, { 0: users })
      : intl.formatMessage(intlMessages.endMeetingNoUserDescription);

    if (warnAboutUnsavedContentOnMeetingEnd) {
      // the double breakline it to put one empty line between the descriptions
      description += `\n\n${intl.formatMessage(intlMessages.contentWarning)}`;
    }

    return (
      <ConfirmationModal
        intl={intl}
        onConfirm={endMeeting}
        title={title}
        description={description}
        confirmButtonColor="danger"
        confirmButtonDataTest="confirmEndMeeting"
      />
    );
  }
}

EndMeetingComponent.propTypes = propTypes;

export default injectIntl(EndMeetingComponent);
