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

const ClosedCaptionsToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 1em 1em 0;
  min-width: 10em;
`;

const ClosedCaptionsToggle = styled(Toggle)``;

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
  ClosedCaptionsToggleContainer,
  ClosedCaptionsToggle,
  SpanButtonWrapper,
  TranscriptionToggle,
  TitleLabel,
  EnableTrascription,
  DisableTrascription,
  SelectedLabel,
};
