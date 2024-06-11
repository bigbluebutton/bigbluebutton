import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Session from '/imports/ui/services/storage/in-memory';
import Styled from '../styles';

const intlMessages = defineMessages({
  noPresentationSelected: {
    id: 'app.poll.noPresentationSelected',
    description: 'no presentation label',
  },
  clickHereToSelect: {
    id: 'app.poll.clickHereToSelect',
    description: 'open uploader modal button label',
  },
});

const EmptySlideArea: React.FC = () => {
  const intl = useIntl();
  return (
    <Styled.NoSlidePanelContainer>
      <Styled.SectionHeading data-test="noPresentation">
        {intl.formatMessage(intlMessages.noPresentationSelected)}
      </Styled.SectionHeading>
      <Styled.PollButton
        label={intl.formatMessage(intlMessages.clickHereToSelect)}
        color="primary"
        onClick={() => Session.setItem('showUploadPresentationView', true)}
      />
    </Styled.NoSlidePanelContainer>
  );
};

export default EmptySlideArea;
