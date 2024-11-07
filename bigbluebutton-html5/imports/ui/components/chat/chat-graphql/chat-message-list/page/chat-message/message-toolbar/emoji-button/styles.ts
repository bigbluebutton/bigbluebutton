import styled from 'styled-components';
import { colorGray, colorGrayDark, colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smPadding } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';

const EmojiButton = styled.button`
  line-height: 1;
  font-size: ${fontSizeSmaller};
  background: none;
  border: none;
  outline: none;
  padding: ${smPadding};
  color: ${colorGray};
  cursor: pointer;
  border-radius: 0.25rem;

  &:focus,
  &:hover {
    color: ${colorGrayDark};
    background-color: ${colorOffWhite};
  }

  &:active {
    transform: scale(0.9);
  }

  i::before {
    display: block;
    width: 100%;
    height: 100%;
  }

  svg {
    width: 1rem;
    height: 1rem;
    vertical-align: middle;
  }
`;

export default {
  EmojiButton,
};
