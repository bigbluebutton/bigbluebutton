import styled from 'styled-components';
import {
  borderSize,
  borderRadius,
  talkerBorderRadius,
  talkerPaddingXsm,
  talkerPaddingLg,
  talkerMaxWidth,
  talkerMarginSm,
  spokeOpacity,
  talkerPaddingXl,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorSuccess,
  colorDanger,
  colorBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeBase,
  talkerFontWeight,
  fontSizeXS,
  fontSizeSmaller,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import { phoneLandscape } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - as button comes from JS, we can't provide its props
const TalkingIndicatorButton = styled(Button)`
  display: flex;
  flex-direction: row;

  outline: transparent;
  outline-style: dotted;
  outline-width: ${borderSize};

  flex: 0 0 auto;
  color: ${colorWhite};
  font-weight: ${talkerFontWeight};
  border-radius: ${talkerBorderRadius} ${talkerBorderRadius};
  font-size: ${fontSizeBase};
  padding: ${talkerPaddingXsm} ${talkerPaddingLg} ${talkerPaddingXsm} ${talkerPaddingLg};
  box-shadow: none !important;

  @media ${phoneLandscape} {
    height: 1rem;
  }

  i,
  span {
    position: relative;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 0 0 0 !important;
    max-width: ${talkerMaxWidth};

    @media ${phoneLandscape} {
      font-size: ${fontSizeXS};
    }

    [dir='rtl'] & {
      margin-left: ${talkerMarginSm};
    }
  }

  i {
    font-size: ${fontSizeSmaller};
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    background-color: ${colorSuccess};
    border-radius: 50%;
    position: relative;
    right: ${talkerMarginSm};

    @media ${phoneLandscape} {
      height: ${talkerMarginSm};
      width: ${talkerMarginSm};
      font-size: ${fontSizeXS};
    }

    [dir='rtl'] & {
      right: calc(${talkerMarginSm} * -1);
    }
  }

  span:hover {
    opacity: 1;
  }

  ${({ $spoke }) => $spoke
    && `
    opacity: ${spokeOpacity};

    [dir="rtl"]  & {
      padding-right: ${talkerPaddingLg}
    }
  `}

  ${({ $muted }) => $muted && `
    cursor: default;

    i {
      background-color: ${colorDanger};
    }
  `}

  ${({ $isViewer }) => $isViewer
    && `
    cursor: default;
    pointer-events: none;
  `}
`;

const CCIcon = styled(Icon)`
  align-self: center;
  color: ${colorWhite};
  margin: 0 ${borderRadius};
  font-size: calc(${fontSizeSmall} * 0.85);
  opacity: ${({ muted, talking }) => ((muted || !talking) && `${spokeOpacity};`) || '1;'};
`;

const TalkingIndicatorWrapper = styled.div<{ muted?: boolean; talking?: boolean; }>`
  border-radius: ${talkerBorderRadius} ${talkerBorderRadius};
  display: flex;
  margin: 0 ${borderRadius};
  opacity: ${({ muted, talking }) => ((muted || !talking) && `${spokeOpacity};`) || '1;'};
  background: ${({ talking }) => (talking ? `${colorSuccess}` : `${colorBackground};`)};
`;

const Hidden = styled.div`
  display: none;
`;

const IsTalkingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const Speaking = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  max-height: ${talkerPaddingXl};
  scrollbar-width: 0; // firefox
  scrollbar-color: transparent;

  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }
`;

export default {
  TalkingIndicatorButton,
  TalkingIndicatorWrapper,
  CCIcon,
  Hidden,
  IsTalkingWrapper,
  Speaking,
};
