import styled, { css, keyframes } from 'styled-components';
import { mdPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { loaderBg, loaderBullet, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const Background = styled.div`
  position: fixed;
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${loaderBg};
  z-index: 4;
`;

const skBouncedelay = keyframes`
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

const Spinner = styled.div`
  width: 100%;
  text-align: center;
  height: 22px;
  margin-bottom: ${mdPaddingX};

  & > div {
    width: 18px;
    height: 18px;
    margin: 0 5px;
    background-color: ${loaderBullet};
    border-radius: 100%;
    display: inline-block;

    ${({ animations }) => animations && css`
      animation: ${skBouncedelay} 1.4s infinite ease-in-out both;
    `}
  }
`;

const Bounce1 = styled.div`
  ${({ animations }) => animations && `
    animation-delay: -0.32s !important;
  `}
`;

const Bounce2 = styled.div`
  ${({ animations }) => animations && `
    animation-delay: -0.16s !important;
  `}
`;

const Message = styled.div`
  font-size: ${fontSizeLarge};
  color: ${colorWhite};
  text-align: center;
`;

export default {
  Background,
  Spinner,
  Bounce1,
  Bounce2,
  Message,
};
