import styled from 'styled-components';
import {
  smPaddingX,
  smPaddingY,
  borderRadius,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorGrayLighter,
  colorBlueLight,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import TextareaAutosize from 'react-autosize-textarea';
import Button from '/imports/ui/components/common/button/component';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const TextArea = styled(TextareaAutosize)`
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
  min-height: 2.5rem;
  max-height: 10rem;
  border: 1px solid ${colorGrayLighter};
  box-shadow: 0 0 0 1px ${colorGrayLighter};

  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:active,
  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
  }

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }
`;

const TextInputButton = styled(Button)`
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
  Wrapper,
  TextArea,
  TextInputButton,
};
