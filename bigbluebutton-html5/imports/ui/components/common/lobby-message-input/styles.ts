import styled from 'styled-components';
import Button from '@mui/material/Button';
import {
  colorWhite,
  colorBorder,
  colorText,
  colorGrayLabel,
  colorGreen600,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: 0.75rem;
  overflow-y: hidden;
  border: 1px solid ${colorBorder};
  background-color: ${colorWhite};
  align-items: center;
  padding: 0.4rem 0.4rem 0.4rem 0;
  gap: 3px;

  &:focus-within {
    box-shadow: 0 0 0 2px ${colorBorder};
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  padding: 0.5rem 1rem;
  font-size: ${fontSizeBase};
  outline: none;
  background: transparent;
  color: ${colorText};

  &::placeholder {
    color: ${colorGrayLabel};
  }
`;

// @ts-ignore
const SendButton = styled(Button)`
  && {
    align-self: center;
    flex-shrink: 0;
    font-size: ${fontSizeSmall};
    border-radius: 0.75rem;
    min-width: 2.25rem;
    width: 2.25rem;
    height: 2.25rem;
    padding: 6px;
  }

  [dir="rtl"] & {
    transform: scale(-1, 1);
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: ${colorGreen600};
  font-size: ${fontSizeBase};
`;

const TooltipWrapper = styled.span`
  display: inline-flex;
  align-self: center;
`;

export default {
  InputWrapper,
  Input,
  SendButton,
  SuccessMessage,
  TooltipWrapper,
};
