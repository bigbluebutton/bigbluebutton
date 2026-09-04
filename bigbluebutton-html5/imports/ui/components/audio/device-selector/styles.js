import styled from 'styled-components';
import {
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorBorder,
  colorGrayLabel,
  colorPrimary,
  colorWhiteSurface,
} from '/imports/ui/stylesheets/styled-components/palette';

const Select = styled.select`
  background-color: ${colorWhiteSurface};
  border: 0.1rem solid ${colorBorder};
  border-radius: ${borderSize};
  color: ${colorGrayLabel};
  width: 100%;
  height: 2rem;
  padding: 1px;

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorPrimary}, inset 0 0 0 1px ${colorPrimary};
  }

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;

export default {
  Select,
};
