import styled from 'styled-components';

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
  background-color: #DF2721;
`;

export default {
  ProgressBar,
  Loaded,
  Played,
};
