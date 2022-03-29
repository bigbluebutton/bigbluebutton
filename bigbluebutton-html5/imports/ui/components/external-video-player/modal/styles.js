import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  borderSize,
  borderRadius,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorText,
  colorGrayLighter,
  colorGray,
  colorWhite,
  colorLink,
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
  padding: 1.5rem;
  min-height: 23rem;
`;

const Header = styled.header`
  margin: 0;
  padding: 0;
  border: none;
  line-height: 2rem;
`;

const Title = styled.h3`
  text-align: center;
  font-weight: 400;
  font-size: 1.3rem;
  white-space: normal;

  @media ${smallOnly} {
    font-size: 1rem;
    padding: 0 1rem;
  }
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
  width: 40%;
  display: block;
  position: absolute;
  bottom: 20px;
  color: ${colorWhite} !important;
  background-color: ${colorLink} !important;
`;

export default {
  UrlError,
  ExternalVideoModal,
  Header,
  Title,
  Content,
  VideoUrl,
  ExternalVideoNote,
  StartButton,
};
