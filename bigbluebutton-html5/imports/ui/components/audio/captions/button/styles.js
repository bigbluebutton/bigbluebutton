import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import Toggle from '/imports/ui/components/common/switch/component';
import {
  colorWhite,
  colorPrimary,
  colorOffWhite,
  colorDangerDark,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';

const ClosedCaptionToggleButton = styled(Button)`
  ${({ ghost }) => ghost && `
    span {
      box-shadow: none;
      background-color: transparent !important;
      border-color: ${colorWhite} !important;
    }
    i {
      margin-top: .4rem;
    }
  `}
`;

const SpanButtonWrapper = styled.span`
  position: relative;
`;

const TranscriptionToggle = styled(Toggle)`
  display: flex;
  justify-content: flex-start;
  padding-left: 1em;
`;

const TitleLabel = {
  fontWeight: 'bold',
  opacity: 1,
};

const EnableTrascription = {
  color: colorSuccess,
};

const DisableTrascription = {
  color: colorDangerDark,
};

const SelectedLabel = {
  color: colorPrimary,
  backgroundColor: colorOffWhite,
};

export default {
  ClosedCaptionToggleButton,
  SpanButtonWrapper,
  TranscriptionToggle,
  TitleLabel,
  EnableTrascription,
  DisableTrascription,
  SelectedLabel,
};
