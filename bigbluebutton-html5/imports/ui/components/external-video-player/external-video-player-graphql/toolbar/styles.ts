import Styled from 'styled-components';

interface HoverToolbarProps {
  toolbarStyle: string;
}

const HoverToolbar = Styled.div<HoverToolbarProps>`
  ${({ toolbarStyle }) => toolbarStyle === 'hoverToolbar' && `
    display: none;
    z-index: 3;
    [data-test="videoPlayer"]:hover & {
      display: flex;
    }
  `}

  ${({ toolbarStyle }) => toolbarStyle === 'dontShowMobileHoverToolbar' && `
    display: none;
  `}

  ${({ toolbarStyle }) => toolbarStyle === 'showMobileHoverToolbar' && `
    display: flex;
    z-index: 2;
  `}
`;

const ButtonsWrapper = Styled.div`
  position: absolute;
  right: auto;
  left: 0;
  bottom: 0;
  top: 0;
  display: flex;
  z-index: 3;

  [dir="rtl"] & {
    right: 0;
    left : auto;
  }
`;

const MobileControlsOverlay = Styled.span`
  position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 3;
`;

export default {
  HoverToolbar,
  MobileControlsOverlay,
  ButtonsWrapper,
};
