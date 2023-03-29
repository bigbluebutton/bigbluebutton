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
  ${({ menuOffset }) => `
    #TD-StylesMenu {
      position: relative;
      right: ${menuOffset};
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
  ${({ isPresenter }) => (!isPresenter) && `
    #presentationInnerWrapper div{
      cursor: default !important;
    }
  `}
`;

const TldrawGlobalStyleText = (arg) => {
  const styleText = `
  ${ arg.hideContextMenu ? `
    #TD-ContextMenu {
      display: none;
    }
  ` : ''}
  #TD-PrimaryTools-Image {
    display: none;
  }
  #slide-background-shape div {
    pointer-events: none;
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
  ${ (arg.hasWBAccess || arg.isPresenter) ? `
    button {
      background: none;
    }
    #TD-Tools-Dots {
      height: ${arg.size}px;
      width: ${arg.size}px;
    }
    #TD-Delete button {
        height: ${arg.size}px;
        width: ${arg.size}px;
    }
    #TD-PrimaryTools button {
        height: ${arg.size}px;
        width: ${arg.size}px;
    }
    #TD-PrimaryTools button > div {
      &:hover:not(:disabled) {
        background-color: var(--colors-hover);
      }
    }
    #TD-Styles {
      border-width: ${borderSize};
    }
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles {
      height: 92%;
      border-radius: 7px;
    }
    #TD-TopPanel-Undo:hover,
    #TD-TopPanel-Redo:hover,
    #TD-Styles:hover {
      border: solid ${borderSize} #ECECEC;
      background-color: #ECECEC;
    }
    #TD-TopPanel-Undo > div:hover,
    #TD-TopPanel-Redo > div:hover,
    #TD-Styles > div:hover {
      background-color: var(--colors-hover);
    }
    #TD-Styles:focus {
      border: solid ${borderSize} ${colorBlack};
    }
    #TD-Styles,
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo {
      margin: ${borderSize} ${borderSizeLarge} 0px ${borderSizeLarge};
    }
    
    /* For manually supplementing the style of the TD-Tools-Dots */
    div[style*="--radix-popper-transform-origin"] > div {
        display: flex;
    }
    /* stop propagate mouse click so that the browser's context menu won't appear everytime you open the tldraw context menu */
    div:has(#TD-ContextMenu) {
      pointer-events: none;
    }
    
    /* For tldraw tooltips; for an edge case where the user enters the detached mode without showing any tooltip */
    div[style*="--radix-tooltip-content-transform-origin"] {
        border-radius: 3px;
        padding: var(--space-3) var(--space-3) var(--space-3) var(--space-3);
        font-size: var(--fontSizes-1);
        background-color: var(--colors-tooltip);
        color: var(--colors-tooltipContrast);
        box-shadow: var(--shadows-3);
        display: flex;
        align-items: center;
        font-family: var(--fonts-ui);
        user-select: none;
    }
    
    /* for sticky notes */
    div[data-shape="sticky"] > div > div > div > div {
        text-align: ${ arg.isRTL ? `right` : `left` } ;
    }
    /*this has been supplemented by temporarily showing sticky before detaching*/
    /*div[data-shape="sticky"] > div > div > div > div {
      position: absolute;
      top: 16px;
      left: 16px;
      width: calc(100% - 32px);
      height: fit-content;
      font: inherit;
      pointer-events: none;
      user-select: none;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      letter-spacing: -0.03em;
    }*/
    div[data-shape="sticky"] /*> div > div > div >*/ textarea {
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      background: none;
      outline: none;
      textAlign: left;
      font: inherit;
      padding: 0;
      color: transparent;
      verticalAlign: top;
      resize: none;
      caretColor: black;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      letter-spacing: -0.03em;
    }
    /* for text */
    div[data-shape="text"] /*> div > div > div > div >*/ textarea {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 1;
      width: 100%;
      height: 100%;
      border: none;
      padding: 4px;
      resize: none;
      text-align: inherit;
      min-height: inherit;
      min-width: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      outline: 0px;
      font-weight: inherit;
      overflow: hidden;
      backface-visibility: hidden;
      display: inline-block;
      pointer-events: all;
      background: var(--colors-boundsBg);
      user-select: text;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
  ` : ''}
  
  ${ (arg.darkTheme) ? `
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles:focus {
      border: solid ${borderSize} ${colorWhite} !important;
    }
  ` : ''}
  
  `;

  return styleText;
};

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
  TldrawGlobalStyleText,
  EditableWBWrapper,
  PanTool,
};
