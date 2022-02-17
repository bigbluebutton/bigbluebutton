import styled from 'styled-components';

const DropZoneArea = styled.div`
  position: absolute;
  background: transparent;
  -webkit-box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, .2);
  -moz-box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, .2);
  box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, .2);
  color: rgba(0, 0, 0, .2);
  font-weight: bold;
  font-family: sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grabbing;

  &:hover {
    background-color: rgba(0, 0, 0, .1);
  }
`;

const DropZoneBg = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, .2);
  -webkit-box-shadow: inset 0px 0px 0px 1px #666;
  -moz-box-shadow: inset 0px 0px 0px 1px #666;
  box-shadow: inset 0px 0px 0px 1px #666;
  color: rgba(0, 0, 0, .2);
  font-weight: bold;
  font-family: sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default {
  DropZoneArea,
  DropZoneBg,
};
