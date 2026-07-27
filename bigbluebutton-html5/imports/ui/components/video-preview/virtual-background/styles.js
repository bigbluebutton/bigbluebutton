import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  borderSizeSmall,
  lgPadding,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorBorder,
  userThumbnailBorder,
  btnPrimaryBorder,
  btnDefaultColor,
  colorGrayLabel,
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmallest } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const minThumbnailSize = '80px';

// Thumbnails are laid out as a grid that fits as many columns as the container
// allows, so the same selector adapts to both the video preview modal and the
// (narrower) profile settings sidebar panel. The thumbnails take up the leftover
// width themselves, which keeps a single spacing value between them and around
// them -- padding and gap must stay equal for the spacing to read as uniform.
const BgWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${minThumbnailSize}, 1fr));
  gap: ${lgPadding};
  padding: ${lgPadding};
`;

const BgNoneButton = styled(Button)`
  border-radius: ${borderSizeLarge};
  width: 100%;
  aspect-ratio: 1;
  border: ${borderSizeSmall} solid ${userThumbnailBorder};
  padding: unset;
`;

const ThumbnailButton = styled(Button)`
  outline: none;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  border-radius: ${borderSizeLarge};
  cursor: pointer;
  width: 100%;
  aspect-ratio: 1;
  z-index: 1;
  background-color: transparent;
  border: ${borderSizeSmall} solid ${userThumbnailBorder};

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
  border-bottom: 0.1rem solid ${colorBorder};
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

const BgCustomButton = styled(BgNoneButton)`
  font-size: 130%;
`;

const SkeletonWrapper = styled.div`
  aspect-ratio: 1;

  & .react-loading-skeleton {
    display: block;
    height: 100%;
    width: 100%;
  }
`;

export default {
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
