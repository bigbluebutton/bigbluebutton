import styled from 'styled-components';
import ReactModal from 'react-modal';
import {
  scrollFadeColor,
  scrollbarThumb,
  scrollbarThumbHover,
} from '/imports/ui/stylesheets/styled-components/palette';

const ScrollboxVertical = styled.div`
  overflow-y: auto;
  background: linear-gradient(${scrollFadeColor} 30%, transparent),
    linear-gradient(transparent, ${scrollFadeColor} 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-repeat: no-repeat;
  background-color: transparent;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  background-attachment: local, local, scroll, scroll;

  // Fancy scroll
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: ${scrollbarThumb};
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-thumb:hover { background: ${scrollbarThumbHover}; }
  &::-webkit-scrollbar-thumb:active { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-track {
    background: ${scrollbarThumb};
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-track:hover { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-track:active { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-corner { background: 0 0; }
`;

const ModalScrollboxVertical = styled(ReactModal)`
  overflow-y: auto;
  background: linear-gradient(${scrollFadeColor} 30%, transparent),
    linear-gradient(transparent, ${scrollFadeColor} 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-repeat: no-repeat;
  background-color: transparent;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  background-attachment: local, local, scroll, scroll;

  // Fancy scroll
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: ${scrollbarThumb};
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-thumb:hover { background: ${scrollbarThumbHover}; }
  &::-webkit-scrollbar-thumb:active { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-track {
    background: ${scrollbarThumb};
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-track:hover { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-track:active { background: ${scrollbarThumb}; }
  &::-webkit-scrollbar-corner { background: 0 0; }
`;

export {
  ScrollboxVertical,
  ModalScrollboxVertical,
};
