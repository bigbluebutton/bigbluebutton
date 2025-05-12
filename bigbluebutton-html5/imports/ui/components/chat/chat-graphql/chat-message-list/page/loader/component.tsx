import React from 'react';
import { CircularProgress } from '@mui/material';
import Styled from './styles';

const ChatPageLoading = () => {
  return (
    <Styled.ChatPageLoading>
      <CircularProgress />
    </Styled.ChatPageLoading>
  );
};

export default ChatPageLoading;
