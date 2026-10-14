import styled from 'styled-components';
import {
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  height: 5px;
  width: 100%;
  z-index: 3;

  background-color: transparent;   
`;

const Loaded = styled.div`
  height: 100%;
  background-color: gray;
`;

const Played = styled.div`
  height: 100%;  
  background-color: ${colorDanger};
`;

export default {
  ProgressBar,
  Loaded,
  Played,
};
