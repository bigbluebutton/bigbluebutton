import styled, { css, keyframes } from 'styled-components';
import { colorBlack } from '/imports/ui/stylesheets/styled-components/palette';

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

  & > div {
    margin: 0 5px;
    background-color: ${colorBlack};
    border-radius: 100%;
    display: inline-block;

    ${({ animations }) => animations && css`
      animation: ${skBouncedelay} 1.4s infinite ease-in-out both;
    `}

    ${({ size }) => {
      switch (size) {
        case 'md':
          return (`
            width: 14px;
            height: 14px;
          `);
        case 'sm':
          return (`
            width: 10px;
            height: 10px;
          `);
        case 'normal':
        default:
          return (`
            width: 18px;
            height: 18px;
          `);
      }
    }}
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

export default {
  Spinner,
  Bounce1,
  Bounce2,
};
