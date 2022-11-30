import styled from 'styled-components';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import {
  colorOffWhite,
  colorPrimary,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';

const EmojiList = styled(ScrollboxVertical)`
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  border: 1px solid ${colorGrayLightest};
  border-radius: 10px 0 0 10px;
  margin-bottom: 4px;
  background-color: white;
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  z-index: 99;
`;

const EmojiItem = styled.li`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: .5rem .2rem;

  &:hover,
  &:focus {
    background-color: ${colorOffWhite};
    color: ${colorPrimary};
    cursor: pointer;
  }

  &:hover,
  &:focus-visible,
  &:focus {
    outline: none;
  }

  &:active {
    background-color: ${colorGrayLightest};
  }

  ${({ focused }) => focused && `
    background-color: ${colorOffWhite};
    color: ${colorPrimary};
  `}
`;

export default {
  EmojiList,
  EmojiItem,
};
