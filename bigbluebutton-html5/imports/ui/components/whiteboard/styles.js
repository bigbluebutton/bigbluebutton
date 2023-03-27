import styled, { createGlobalStyle } from 'styled-components';
import { borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import { toolbarButtonColor, colorWhite, colorBlack } from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarger,
} from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const TldrawGlobalStyle = createGlobalStyle`
  ${({ hideContextMenu }) => hideContextMenu && `
    #TD-ContextMenu {
      display: none;
    }
  `}
  ${({ isRTL }) => `
    #TD-StylesMenu {
      position: relative;
      right: ${isRTL ? '7rem' : '-7rem'};
    }
  `}
  #TD-PrimaryTools-Image {
    display: none;
  }
  #slide-background-shape div {
    pointer-events: none;
    user-select: none;
  }
  div[dir*="ltr"]:has(button[aria-expanded*="false"][aria-controls*="radix-"]) {
    pointer-events: none;
  }
  [aria-expanded*="false"][aria-controls*="radix-"] {
    display: none;
  }
  [class$="-side-right"] {
    top: -1px;
  }
  ${({ hasWBAccess, isPresenter, size }) => (hasWBAccess || isPresenter) && `
    #TD-Tools-Dots {
      height: ${size}px;
      width: ${size}px;
    }
    #TD-Delete {
      & button {
        height: ${size}px;
        width: ${size}px;
      }
    }
    #TD-PrimaryTools button {
        height: ${size}px;
        width: ${size}px;
    }
    #TD-Styles {
      border-width: ${borderSize};
    }
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles {
      height: 92%;
      border-radius: 7px;

      &:hover {
        border: solid ${borderSize} #ECECEC;
        background-color: #ECECEC;
      }
      &:focus {
        border: solid ${borderSize} ${colorBlack};
      }
    }
    #TD-Styles,
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo {
      margin: ${borderSize} ${borderSizeLarge} 0px ${borderSizeLarge};
    }
  `}
  ${({ darkTheme }) => darkTheme && `
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles {
      &:focus {
        border: solid ${borderSize} ${colorWhite} !important;
      }
    }
  `}
`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

const PanTool = styled(Button)`
  border: none !important;
  padding: 0;
  margin: 0;
  border-radius: 7px;
  background-color: ${colorWhite};
  color: ${toolbarButtonColor};

  & > i {
    font-size: ${fontSizeLarger} !important;
    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }

  &:hover,
  &:focus {
    background-color: var(--colors-hover);
  }
`;

export default {
  TldrawGlobalStyle,
  EditableWBWrapper,
  PanTool,
};
