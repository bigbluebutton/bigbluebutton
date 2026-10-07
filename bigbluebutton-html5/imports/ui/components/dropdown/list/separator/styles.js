import styled from 'styled-components';
import { colorGrayLighterSurface } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';

const Separator = styled.li`
  display: flex;
  flex: 1 1 100%;
  height: 1px;
  min-height: 1px;
  background-color: ${colorGrayLighterSurface};
  padding: 0;
  margin-top: calc(${lineHeightComputed} * .5);
  margin-bottom: calc(${lineHeightComputed} * .5);
`;

export default {
  Separator,
};
