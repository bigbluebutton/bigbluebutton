import styled from 'styled-components';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lgPadding } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';

const EmojiButton = styled.button`
  line-height: 1;
  font-size: ${fontSizeSmaller};
  background: none;
  border: none;
  outline: none;
  padding: ${lgPadding};
  color: ${colorGray};
  cursor: pointer;

  &:focus,
  &:hover {
    opacity: 0.5;
  }

  &:active {
    transform: scale(0.9);
  }

  i::before {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

export default {
  EmojiButton,
};
