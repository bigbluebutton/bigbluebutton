import styled from 'styled-components';
import {
  mdPaddingX,
  mdPaddingY,
  borderRadiusRounded,
  borderSizeSmall,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorBlueDark,
  colorGray,
  colorGrayDark,
  colorGrayLight,
  colorOffWhite,
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  lineHeightComputed,
} from '/imports/ui/stylesheets/styled-components/typography';

// The two-option switch of the poll (Poll / Quiz) and timer (Timer / Stopwatch) panels.

const SegmentedButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom: ${mdPaddingX};
`;

const SegmentedButtonContainer = styled.div`
  display: flex;
  padding: 0.15rem;
  background-color: ${colorOffWhite};
  border: ${borderSizeSmall} solid ${colorGrayLight};
  border-radius: ${borderRadiusRounded};
`;

interface SegmentedButtonProps {
  active?: boolean;
}

// A disabled button keeps its look when it is the selected one (the timer disables the
// option already in use) and fades out otherwise (both are disabled while it runs).
const SegmentedButton = styled.button<SegmentedButtonProps>`
  border: 0;
  background-color: transparent;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${colorGray};
  font-weight: 500;
  font-size: ${fontSizeBase};
  line-height: ${lineHeightComputed};
  padding: ${mdPaddingY} ${mdPaddingX};
  min-height: 2.5rem;
  border-radius: .5rem;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  ${({ active }) => (active ? `
    color: ${colorWhite};
    background-color: ${colorPrimary};

    &:hover:not(:disabled) {
      background-color: ${colorBlueDark};
    }
  ` : `
    &:hover:not(:disabled) {
      color: ${colorGrayDark};
    }

    &:disabled {
      opacity: .5;
    }
  `)}
`;

export {
  SegmentedButtonWrapper,
  SegmentedButtonContainer,
  SegmentedButton,
};
