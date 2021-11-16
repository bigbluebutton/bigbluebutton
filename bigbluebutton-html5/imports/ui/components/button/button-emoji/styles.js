import styled from 'styled-components';
import Icon from '../../icon/component';
import { btnDefaultColor, btnDefaultBg } from '/imports/ui/stylesheets/styled-components/palette';
import { btnSpacing } from '/imports/ui/stylesheets/styled-components/general';

const EmojiButtonIcon = styled(Icon)`
  position: absolute;
  top: 0;
  height: 60%;
  left: 0;
  width: 75%;
  margin-left: 25%;
  font-size: 50%;
  margin-top: 40%;
  color: ${btnDefaultColor};
`;

const Label = styled.span`
  & + i,
  & + button {
    margin: 0 0 0 ${btnSpacing};

    [dir="rtl"] & {
      margin: 0 ${btnSpacing} 0 0;
    }
  }
  &:hover {
    opacity: .5;
  }
`;

const EmojiButton = styled.button`
  position: absolute;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  right: -1px;
  bottom: 0;
  background-color: ${btnDefaultBg};
  overflow: hidden;
  z-index: 2;
  border: none;

  &:hover {
    transform: scale(1.5);
    transition-duration: 150ms;
  }

  & > i {
    position: absolute;
    top: 0;
    height: 60%;
    left: 0;
    width: 75%;
    margin-left: 25%;
    font-size: 50%;
    margin-top: 40%;
    color: ${btnDefaultColor};
  }
`;

export default {
  EmojiButtonIcon,
  Label,
  EmojiButton,
};
