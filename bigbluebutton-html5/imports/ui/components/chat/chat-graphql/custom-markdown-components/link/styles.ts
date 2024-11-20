import styled from 'styled-components';
import { colorPrimary, colorBlueLighterChannel } from '/imports/ui/stylesheets/styled-components/palette';

const Mention = styled.strong`
  color: ${colorPrimary};
  background-color: rgb(${colorBlueLighterChannel} / 0.5);
  display: inline-block;
  padding: 4px;
  border-radius: 8px;
  line-height: 1;

  &:hover {
    background-color: rgb(${colorBlueLighterChannel} / 0.75);
  }
`;

export default {
  Mention,
};
