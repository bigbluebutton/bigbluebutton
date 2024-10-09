import styled from 'styled-components';
import { colorBlueLighter, colorBlueLightest, colorGray } from '/imports/ui/stylesheets/styled-components/palette';

const EmojiWrapper = styled.button<{ highlighted: boolean }>`
  background-color: ${colorBlueLightest};
  border-radius: 10px;
  margin-left: 3px;
  margin-top: 3px;
  padding: 3px;
  display: flex;
  flex-wrap: nowrap;
  border: 1px solid transparent;
  cursor: pointer;

  ${({ highlighted }) => highlighted && `
    background-color: ${colorBlueLighter};
  `}

  &:hover {
    border: 1px solid ${colorGray};
  }
`;

const ReactionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export default {
  EmojiWrapper,
  ReactionsWrapper,
};
