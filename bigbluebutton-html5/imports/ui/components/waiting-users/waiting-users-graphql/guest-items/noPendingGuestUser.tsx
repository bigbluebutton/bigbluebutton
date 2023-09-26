import React from 'react';
import Styled from '../styles';

const renderNoUserWaitingItem = (message: string) => (
  <Styled.PendingUsers>
    <Styled.NoPendingUsers>
      {message}
    </Styled.NoPendingUsers>
  </Styled.PendingUsers>
);

export default renderNoUserWaitingItem;
