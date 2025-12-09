import React from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Typography } from '@mui/material';
import Styled from './styles';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';

interface BackButtonProps {
  onClick: () => void;
  title: string;
}

const BackButton : React.FC<BackButtonProps> = ({ onClick, title }) => {
  const CLOSE_CHAT_AK = useShortcut('closeprivatechat');
  return (
    <Styled.Form onClick={onClick}>
      {/* eslint-disable-next-line jsx-a11y/no-access-key */}
      <Styled.InputWrapper data-test="privateChatBackButton" accessKey={CLOSE_CHAT_AK}>
        <Styled.ArrowWrapper>
          <ArrowBackIosNewIcon fontSize="small" sx={{ marginRight: '8px', backgroundColor: '#E3F2FD' }} />
        </Styled.ArrowWrapper>
        <Typography variant="body2" fontWeight="bold" sx={{ paddingLeft: '1rem' }}>
          {title}
        </Typography>
      </Styled.InputWrapper>
    </Styled.Form>
  );
};

export default BackButton;
