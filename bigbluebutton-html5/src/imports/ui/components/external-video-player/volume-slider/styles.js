import styled from 'styled-components';

const Slider = styled.div`
  width: 0.9em;
  display: flex;
  position: absolute;
  bottom: 2.5em;
  left: 1em;
  padding: 0.25rem 0.5rem;
  min-width: 200px;
  background-color: rgba(0,0,0,0.5);
  border-radius: 32px;

  i {
    color: white;
    transition: 0.5s;
    font-size: 200%;
    cursor: pointer;
  }
  z-index: 2;
`;

const Volume = styled.span`
  margin-right: 0.5em;
  cursor: pointer;
`;

const VolumeSlider = styled.input`
  width: 100%;
  cursor: pointer;
`;

export default {
  Slider,
  Volume,
  VolumeSlider,
};
