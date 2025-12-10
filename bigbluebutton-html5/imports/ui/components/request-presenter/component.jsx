import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { notify } from '/imports/ui/services/notification';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleApprove: PropTypes.func.isRequired,
  handleDeny: PropTypes.func.isRequired,
  requesterName: PropTypes.string.isRequired,
  requesterId: PropTypes.string.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.requestPresenter.notification.title',
    description: 'Title for the presenter request notification',
  },
  description: {
    id: 'app.requestPresenter.notification.description',
    description: 'Description for the presenter request notification',
  },
  approveButtonLabel: {
    id: 'app.requestPresenter.notification.confirm.label',
    description: 'Label for the approve presenter button',
  },
  denyButtonLabel: {
    id: 'app.requestPresenter.notification.deny.label',
    description: 'Label for the deny presenter button',
  },
});

const RequestPresenterNotification = ({
  intl,
  handleApprove,
  handleDeny,
  requesterName,
  requesterId,
}) => {
  const toastIdRef = useRef(null);

  useEffect(() => {
    const alert = new Audio(`${window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename}/resources/sounds/notify.mp3`);
    alert.play();

    const title = intl.formatMessage(intlMessages.title);
    const description = intl.formatMessage(intlMessages.description, { userName: requesterName });

    const toastId = notify(
      <div>
        <Styled.TitleText>{title}</Styled.TitleText>
        <Styled.DescriptionText>{description}</Styled.DescriptionText>
      </div>,
      'default',
      false,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        disablePointer: true,
        toastId: `presenter-request-${requesterId}`,
      },
      (
        <Styled.NotificationContent>
          <Styled.NotificationActions>
            <Styled.CancelButton
              data-test="denyPresenter"
              onClick={() => {
                toast.dismiss(`presenter-request-${requesterId}`);
                handleDeny();
              }}
            >
              {intl.formatMessage(intlMessages.denyButtonLabel)}
            </Styled.CancelButton>
            <Styled.ConfirmationButton
              data-test="approvePresenter"
              onClick={() => {
                toast.dismiss(`presenter-request-${requesterId}`);
                handleApprove();
              }}
            >
              <Styled.SvgCapsule>
                <Styled.PresenterIcon iconName="presentation" />
              </Styled.SvgCapsule>
              {intl.formatMessage(intlMessages.approveButtonLabel)}
            </Styled.ConfirmationButton>
          </Styled.NotificationActions>
        </Styled.NotificationContent>
      ),
      false,
      false,
    );

    toastIdRef.current = toastId;

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  return null;
};

RequestPresenterNotification.propTypes = propTypes;

export default RequestPresenterNotification;
