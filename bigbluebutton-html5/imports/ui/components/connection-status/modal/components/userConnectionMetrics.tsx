import React from 'react';
import ListOfOcurrencesContainer from './listOfOcurrences';
import ConnectionStatusSummaryContainer from './connectionStatusSummary';
import Styled from '../styles';

interface UserConnectionMetricsContainerProps {
  userId: string;
}

const UserConnectionMetrics: React.FC<UserConnectionMetricsContainerProps> = ({ userId }) => {
  return (
    <Styled.UserConnectionMetricsContainer>
      <ConnectionStatusSummaryContainer userId={userId} />
      <ListOfOcurrencesContainer userId={userId} />
    </Styled.UserConnectionMetricsContainer>
  );
};

const UserConnectionMetricsContainer: React.FC<UserConnectionMetricsContainerProps> = ({
  userId,
}) => {
  return (
    <UserConnectionMetrics
      userId={userId}
    />
  );
};

export default UserConnectionMetricsContainer;
