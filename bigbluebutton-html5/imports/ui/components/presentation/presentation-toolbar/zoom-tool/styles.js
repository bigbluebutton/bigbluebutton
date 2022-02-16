import styled from 'styled-components';
import Styled from '../styles';
import {
  colorOffWhite,
  toolbarButtonColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  whiteboardToolbarMargin,
} from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';

const DecreaseZoomButton = styled(Styled.PrevSlideButton)``;

const IncreaseZoomButton = styled(Styled.NextSlideButton)``;

const ResetZoomButton = styled(Button)`
  text-align: center;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0 !important;
  font-weight: 200;
  margin-left: ${whiteboardToolbarMargin};
  margin-right: ${whiteboardToolbarMargin};

  &:hover {
    opacity: .8;
  }

  position: relative;
  color: ${toolbarButtonColor};
  background-color: ${colorOffWhite};
  border-radius: 0;
  box-shadow: none !important;
  border: 0;

  &:focus {
    background-color: ${colorOffWhite};
    border: 0;
  }
`;

export default {
  DecreaseZoomButton,
  IncreaseZoomButton,
  ResetZoomButton,
};
