import styled from 'styled-components';
import { fontSizeLarge, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  smPaddingX,
  borderSize,
  borderSizeLarge,
  borderSizeSmall,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite, colorPrimary, colorGray } from '/imports/ui/stylesheets/styled-components/palette';

const RecordingIndicatorIcon = styled.span`
  width: ${fontSizeLarge};
  height: ${fontSizeLarge};
  font-size: ${fontSizeBase};

  ${({ titleMargin }) => titleMargin && `
    [dir="ltr"] & {
      margin-right: ${smPaddingX};
    }
  `}
`;

const RecordingControl = styled.div`
  display: flex;
  border-radius: 2em 2em;
  align-items: center;

  span {
    border: none;
    box-shadow: none;
    background-color: transparent !important;
    color: ${colorWhite} !important;
  }

  &:hover {
    color: ${colorWhite} !important;
    cursor: pointer;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 ${borderSize} ${colorPrimary};
  }
  
  ${({ recording }) => recording && `
    padding: 5px;
    background-color: ${colorPrimary};
    border: ${borderSizeLarge} solid ${colorPrimary};

    &:focus {
      background-clip: padding-box;
      border: ${borderSizeLarge} solid transparent;
    }
  `}

  ${({ recording }) => !recording && `
    padding: 7px;
    border: ${borderSizeSmall} solid ${colorWhite};

    &:focus {
      padding: 5px;
      border: ${borderSizeLarge} solid ${colorWhite};
      box-shadow: none;
    }
  `}
`;

const PresentationTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: 200;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  padding: 0;
  margin-right: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30vw;

  [dir="rtl"]  & {
    margin-left: 0;
    margin-right: ${smPaddingX};
  }

  & > [class^="icon-bbb-"] {
    font-size: 75%;
  }

  span {
    vertical-align: middle;
  }
`;

const VisuallyHidden = styled.span`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
`;

const PresentationTitleSeparator = styled.span`
  color: ${colorGray};
  font-size: ${fontSizeBase};
  margin: 0 1rem;
`;

const RecordingIndicator = styled.div`
  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:active,
  &:focus,
  &:focus-within {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
  }
`;

const RecordingStatusViewOnly = styled.div`
  display: flex;
`;

export default {
  RecordingIndicatorIcon,
  RecordingControl,
  PresentationTitle,
  VisuallyHidden,
  PresentationTitleSeparator,
  RecordingIndicator,
  RecordingStatusViewOnly,
};
