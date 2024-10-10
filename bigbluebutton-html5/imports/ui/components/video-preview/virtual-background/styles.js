import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  borderSizeSmall,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  userThumbnailBorder,
  btnPrimaryBorder,
  btnDefaultColor,
  colorGrayLabel,
  colorGrayLighter,
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { fontSizeSmallest } from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const VirtualBackgroundRowThumbnail = styled.div`
  margin: 0.4rem;
`;

const BgWrapper = styled(ScrollboxVertical)`
  display: flex;
  justify-content: flex-start;
  max-width: 272px;
  max-height: 216px;
  flex-wrap: wrap;
  overflow-y: auto;
  margin: ${borderSizeLarge};
  padding: ${borderSizeLarge};

  @media ${smallOnly}, ${mediumOnly} {
    justify-content: center;
    max-height: 22vh;
  }
`;

const BgNoneButton = styled(Button)`
  border-radius: ${borderSizeLarge};
  height: 48px;
  width: 48px;
  border: ${borderSizeSmall} solid ${userThumbnailBorder};
  margin: 0.5rem 0.5rem;
  flex-shrink: 0;
`;

const ThumbnailButton = styled(Button)`
  outline: none;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  border-radius: ${borderSizeLarge};
  cursor: pointer;
  height: 48px;
  width: 48px;
  z-index: 1;
  background-color: transparent;
  border: ${borderSizeSmall} solid ${userThumbnailBorder};
  flex-shrink: 0;

  & + img {
    border-radius: ${borderSizeLarge};
  }

  &:focus {
    color: ${btnDefaultColor};
    background-color: transparent;
    background-clip: padding-box;
    box-shadow: 0 0 0 ${borderSize} ${btnPrimaryBorder};
  }

  ${({ disabled }) => disabled && `
    filter: grayscale(1);

    & + img {
      filter: grayscale(1);
    }
  `}

  ${({ background }) => background && `
    background-image: url(${background});
    background-origin: padding-box;
    background-size: cover;
    background-position: center;

    &:active {
      background-image: url(${background});
    }
  `}
`;

const Select = styled.select`
  background-color: ${colorWhite};
  border: ${borderSize} solid ${colorWhite};
  border-radius: ${borderSize};
  border-bottom: 0.1rem solid ${colorGrayLighter};
  color: ${colorGrayLabel};
  width: 100%;
  height: 1.75rem;
  padding: 1px;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 ${borderSizeLarge} ${colorPrimary};
    border-radius: ${borderSize};
  }

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;

const Label = styled.label`
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: bold;
  color: ${colorGrayLabel};
`;

const ThumbnailButtonWrapper = styled.div`
  position: relative;
  margin: 0.5rem 0.5rem;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 2;
  right: 0;
  top: 0;
`;

const ButtonRemove = styled(Button)`
  span {
    font-size: ${fontSizeSmallest};
    padding: ${smPaddingY};
  }
`;

const BgCustomButton = styled(BgNoneButton)``;

const SkeletonWrapper = styled.div`
  flex-basis: 0 0 48px;
  margin: 0 0.15rem;
  height: 48px;

  & .react-loading-skeleton {    
    height: 48px;
    width: 48px;
  }
`;

export default {
  VirtualBackgroundRowThumbnail,
  BgWrapper,
  BgNoneButton,
  ThumbnailButton,
  Select,
  Label,
  ThumbnailButtonWrapper,
  ButtonWrapper,
  ButtonRemove,
  BgCustomButton,
  SkeletonWrapper,
};
