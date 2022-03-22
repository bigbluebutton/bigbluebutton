import styled from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  borderSizeSmall,
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
import Button from '/imports/ui/components/common/button/component';

const VirtualBackgroundRowThumbnail = styled.div`
  margin-top: 0.4rem;
`;

const BgWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  margin: ${borderSizeLarge};
  padding: ${borderSizeLarge};
`;

const BgNoneButton = styled(Button)`
  border-radius: ${borderSizeLarge};
  height: 48px;
  width: 48px;
  border: ${borderSizeSmall} solid ${userThumbnailBorder};
  margin: 0 0.15em;
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
  margin: 0 0.15em;
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
`;

const Thumbnail = styled.img`
  position: absolute;
  cursor: pointer;
  width: 47px;
  height: 47px;
  top: 0.063rem;
  left: 0.188rem;
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

export default {
  VirtualBackgroundRowThumbnail,
  BgWrapper,
  BgNoneButton,
  ThumbnailButton,
  Thumbnail,
  Select,
  Label,
};