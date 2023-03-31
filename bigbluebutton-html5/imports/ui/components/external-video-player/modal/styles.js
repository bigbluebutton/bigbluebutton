import styled from 'styled-components';
import {
  borderSize,
  borderRadius,
  smPaddingY,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorGrayLighter,
  colorGray,
  colorBlueLight,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const UrlError = styled.div`
  color: red;
  padding: 1em 0 2.5em 0;

  ${({ animations }) => animations && `
    transition: 1s;
  `}
`;

const ExternalVideoModal = styled(Modal)`
  padding: 1rem;
  min-height: 23rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  margin-right: auto;
  margin-left: auto;
  width: 100%;
`;

const VideoUrl = styled.div`
  margin: 0 ${borderSize} 0 ${borderSize};

  & > label {
    display: block;
  }

  & > label input {
    display: block;
    margin: 10px 0 10px 0;
    padding: 0.4em;
    color: ${colorText};
    line-height: 2rem;
    width: 100%;
    font-family: inherit;
    font-weight: inherit;
    border: 1px solid ${colorGrayLighter};
    border-radius: ${borderRadius};

    ${({ animations }) => animations && `
      transition: box-shadow .2s;
    `}

    &:focus {
      outline: none;
      border-radius: ${borderSize};
      box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
    }
  }

  & > span {
    font-weight: 600;
  }
`;

const ExternalVideoNote = styled.div`
  color: ${colorGray};
  font-size: ${fontSizeSmall};
  font-style: italic;
  padding-top: ${smPaddingY};
`;

const StartButton = styled(Button)`
  display: flex;
  align-self: center;

  &:focus {
    outline: none !important;
  }

  & > i {
    color: #3c5764;
  }

  margin: 0;
  display: block;
  position: absolute;
  bottom: ${mdPaddingX};
`;

export default {
  UrlError,
  ExternalVideoModal,
  Content,
  VideoUrl,
  ExternalVideoNote,
  StartButton,
};
