import styled from 'styled-components';
import {
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayLabel,
  colorWhite,
  colorGrayLighter,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';

const CaptionsSelector = styled.div`
  display: grid;
  grid-auto-flow: column;
  padding: 1rem 0px;
  align-items: center;
`;

const Select = styled.select`
  background-color: ${colorWhite};
  border: 0.1rem solid ${colorGrayLighter};
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
  CaptionsSelector,
  Select,
};
