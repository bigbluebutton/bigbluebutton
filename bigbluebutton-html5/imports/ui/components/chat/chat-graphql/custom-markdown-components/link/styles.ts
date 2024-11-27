import styled, { css } from 'styled-components';
import { colorPrimary, colorBlueLighterChannel } from '/imports/ui/stylesheets/styled-components/palette';

const Mention = styled.strong<{ $isMe: boolean }>`
  color: ${colorPrimary};
  display: inline-block;
  padding: 4px;
  border-radius: 8px;
  line-height: 1;

  ${({ $isMe }) => $isMe && css`
    background-color: rgb(${colorBlueLighterChannel} / 0.5);

    &:hover {
      background-color: rgb(${colorBlueLighterChannel} / 0.75);
    }
  `}
`;

export default {
  Mention,
};
