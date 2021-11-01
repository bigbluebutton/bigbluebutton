import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

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
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'label for yes button for end meeting',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'label for no button for end meeting',
  },
});

const { warnAboutUnsavedContentOnMeetingEnd } = Meteor.settings.public.app;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  endMeeting: PropTypes.func.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  users: PropTypes.number.isRequired,
};

class EndMeetingComponent extends PureComponent {
  render() {
    const {
      users, intl, closeModal, endMeeting, meetingTitle,
    } = this.props;

    return (
      <Styled.EndMeetingModal
        onRequestClose={closeModal}
        hideBorder
        title={intl.formatMessage(intlMessages.endMeetingTitle, { 0: meetingTitle })}
      >
        <Styled.Container>
          <Styled.Description>
            {
              users > 0
                ? intl.formatMessage(intlMessages.endMeetingDescription, { 0: users })
                : intl.formatMessage(intlMessages.endMeetingNoUserDescription)
            }
            {
              warnAboutUnsavedContentOnMeetingEnd
                ? (
                  <p>
                    {intl.formatMessage(intlMessages.contentWarning)}
                  </p>
                ) : null
            }
          </Styled.Description>
          <Styled.Footer>
            <Styled.EndMeetingButton
              data-test="confirmEndMeeting"
              color="danger"
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={endMeeting}
            />
            <Styled.EndMeetingButton
              label={intl.formatMessage(intlMessages.noLabel)}
              onClick={closeModal}
            />
          </Styled.Footer>
        </Styled.Container>
      </Styled.EndMeetingModal>
    );
  }
}

EndMeetingComponent.propTypes = propTypes;

export default injectIntl(EndMeetingComponent);
