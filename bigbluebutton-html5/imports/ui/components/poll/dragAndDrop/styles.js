import styled from 'styled-components';
import {
  colorGrayLighter,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

const DndTextArea = styled.textarea`
  ${({ active }) => active && `
    background: ${colorGrayLighter};
  `}

  ${({ active }) => !active && `
    background: ${colorWhite};
  `}
`;

export default {
  DndTextArea,
};
