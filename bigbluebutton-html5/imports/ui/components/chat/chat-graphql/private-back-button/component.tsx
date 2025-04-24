import React from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Typography } from '@mui/material';
import Styled from './styles';

interface BackButtonProps {
  onClick: () => void;
  title: string;
}

const BackButton : React.FC<BackButtonProps> = ({ onClick, title }) => {
  return (
    <Styled.Form onClick={onClick}>
      <Styled.InputWrapper data-test="privateChatBackButton">
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
