import styled, { css, keyframes } from 'styled-components';
import Modal from '/imports/ui/components/common/modal/simple/component';
import { colorBlack } from '/imports/ui/stylesheets/styled-components/palette';
import { jumboPaddingX } from '/imports/ui/stylesheets/styled-components/general';

const bounce = keyframes`
  0%,
  20%,
  50%,
  80%,
  100% {
    -ms-transform: translateY(0);
    transform: translateY(0);
  }
  40% {
    -ms-transform: translateY(10px);
    transform: translateY(10px);
  }
  60% {
    -ms-transform: translateY(5px);
    transform: translateY(5px);
  }
`;

const PermissionsOverlayModal = styled(Modal)`
  ${({ isFirefox }) => isFirefox && `
    top: 8em;
    left: 22em;
    right: auto;

    [dir="rtl"] & {
      right: none;
      left: none;
      top: 15rem;
    }
  `}

  ${({ isChrome }) => isChrome && `
    top: 5.5em;
    left: 18em;
    right: auto;

    [dir="rtl"] & {
      right: none;
      left: none;
      top: 15rem;
    }
  `}

  ${({ isSafari }) => isSafari && `
    top: 150px;
    left:0;
    right:0;
    margin-left: auto;
    margin-right: auto;
  `}
  
  position: absolute;
  background: none;
  box-shadow: none;
  color: #fff;
  font-size: 16px;
  font-weight: 400;
  padding: 0 0 0 ${jumboPaddingX};
  line-height: 18px;
  width: 340px;

  [dir="rtl"] & {
    padding: 0 ${jumboPaddingX} 0 0;
  }

  small {
    display: block;
    font-size: 12px;
    line-height: 14px;
    margin-top: 3px;
    opacity: .6;
  }

  &:after {
    top: -65px;
    left: -20px;
    right: auto;
    font-size: 20px;
    display: block;
    font-family: 'bbb-icons';
    content: "\\E906";
    position: relative;

    [dir="rtl"] & {
      left: auto;
      right: -20px;
    }

    ${({ animations }) => animations && css`
      animation: ${bounce} 2s infinite;
    `}
  }
`;

const Content = styled.div`
  color: ${colorBlack};
`;

export default {
  PermissionsOverlayModal,
  Content,
};
