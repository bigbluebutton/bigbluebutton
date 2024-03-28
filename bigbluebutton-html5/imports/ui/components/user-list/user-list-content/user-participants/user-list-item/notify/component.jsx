import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.away.notify.title',
  },
  description: {
    id: 'app.away.notify.description',
  },
  returnToActive: {
    id: 'app.away.notify.returnToActive',
  },

});

const AwayNotifyModal = (props) => {
  const { intl, closeModal, isOpen, priority } = props;

  return (
    <Styled.AwayNotifyModal
      contentLabel={intl.formatMessage(intlMessages.title)}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        isOpen,
        priority,
      }}
    >
      <Styled.Container>
        <Styled.Description>
          {intl.formatMessage(intlMessages.description)}
        </Styled.Description>
        <Styled.Footer>
          <Styled.NotifyButton
            color="primary"
            label={intl.formatMessage(intlMessages.returnToActive)}
            onClick={closeModal}
          />
        </Styled.Footer>
      </Styled.Container>
    </Styled.AwayNotifyModal>
  );
};

export default injectIntl(AwayNotifyModal);
