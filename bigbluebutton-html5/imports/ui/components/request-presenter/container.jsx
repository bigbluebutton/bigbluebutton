import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { useMutation, useSubscription } from '@apollo/client';
import RequestPresenterNotification from './component';
import { USER_SET_PRESENTER_REQUEST } from './mutations';
import { PRESENTER_REQUEST_SUBSCRIPTION } from './subscriptions';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const RequestPresenterContainer = ({ intl }) => {
  const [setPresenterRequest] = useMutation(USER_SET_PRESENTER_REQUEST);

  const { data: currentUserData } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));

  const isModerator = currentUserData?.isModerator ?? false;

  const { data: presenterRequestData } = useSubscription(PRESENTER_REQUEST_SUBSCRIPTION, {
    skip: !isModerator,
  });

  const presenterRequests = presenterRequestData?.user ?? [];

  const handleApprove = useCallback(
    (requesterId) => {
      setPresenterRequest({
        variables: {
          requestedPresenter: false,
          userId: requesterId,
          approved: true,
        },
      });
    },
    [setPresenterRequest],
  );

  const handleDeny = useCallback(
    (requesterId) => {
      setPresenterRequest({
        variables: {
          requestedPresenter: false,
          userId: requesterId,
          approved: false,
        },
      });
    },
    [setPresenterRequest],
  );

  if (!isModerator || presenterRequests.length === 0) {
    return null;
  }

  return (
    <>
      {presenterRequests.map((request) => (
        <RequestPresenterNotification
          key={request.userId}
          intl={intl}
          handleApprove={() => handleApprove(request.userId)}
          handleDeny={() => handleDeny(request.userId)}
          requesterName={request.name}
          requesterId={request.userId}
        />
      ))}
    </>
  );
};

RequestPresenterContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(RequestPresenterContainer);
