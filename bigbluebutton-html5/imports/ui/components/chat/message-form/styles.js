import styled from 'styled-components';
import {
  colorBlueLight,
  colorText,
  colorGrayLighter,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  borderRadius,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import TextareaAutosize from 'react-autosize-textarea';
import Button from '/imports/ui/components/common/button/component';

const Form = styled.form`
  flex-grow: 0;
  flex-shrink: 0;
  align-self: flex-end;
  width: 100%;
  position: relative;
  margin-bottom: calc(-1 * ${smPaddingX});
  margin-top: .2rem;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Input = styled(TextareaAutosize)`
  flex: 1;
  background: #fff;
  background-clip: padding-box;
  margin: 0;
  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) calc(${smPaddingX} * 1.25);
  resize: none;
  transition: none;
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  line-height: 1;
  min-height: 2.5rem;
  max-height: 10rem;
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }

  &:focus {
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  &:hover,
  &:active,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;

const SendButton = styled(Button)`
  margin:0 0 0 ${smPaddingX};
  align-self: center;
  font-size: 0.9rem;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

export default {
  Form,
  Wrapper,
  Input,
  SendButton,
};
