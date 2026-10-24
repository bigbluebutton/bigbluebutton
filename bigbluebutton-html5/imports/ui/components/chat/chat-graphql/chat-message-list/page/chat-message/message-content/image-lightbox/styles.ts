import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const ImageLightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;

  & img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 4px;
    /* The backdrop above is near-black in both themes, so enlarging a dark
       transparent image would otherwise make it less readable than the thumbnail,
       not more. Same opaque backdrop as the inline image. */
    background-color: ${colorWhite};
  }
`;

export default {
  ImageLightbox,
};
