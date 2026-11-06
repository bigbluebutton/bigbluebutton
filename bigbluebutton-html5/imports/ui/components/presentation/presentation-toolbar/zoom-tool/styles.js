import styled from 'styled-components';
import {
  appsGalleryOutlineColorSurface,
  colorBlack,
  colorControlBorder,
  colorOffWhite,
  toolbarButtonColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  whiteboardToolbarMargin,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';

const DecreaseZoomButton = styled(Button)``;

const IncreaseZoomButton = styled(Button)``;

const ResetZoomButton = styled(Button)`
  text-align: center;
  color: ${colorBlack};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0 !important;
  font-weight: 200;
  margin-left: ${whiteboardToolbarMargin};
  margin-right: ${whiteboardToolbarMargin};
  position: relative;
  color: ${toolbarButtonColor};
  background-color: ${colorOffWhite};
  border-radius: 0;
  box-shadow: none !important;
  border: 0;

  &:focus,
  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    background-color: ${appsGalleryOutlineColorSurface};
    border-radius: 4px;
  }

  &:hover {
    opacity: .8;
  }

  &:focus {
    outline-style: solid;
    box-shadow: 0 0 0 1px ${colorControlBorder} !important;
  }
`;

export default {
  DecreaseZoomButton,
  IncreaseZoomButton,
  ResetZoomButton,
};
