import styled, { createGlobalStyle } from 'styled-components';
import { colorOffWhite, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const TldrawV2GlobalStyle = createGlobalStyle`
  ${({ isPresenter, hasWBAccess }) => (!isPresenter && hasWBAccess) && `
    [data-testid="tools.hand"] {
      display: none !important;
    }
  `}

  ${({ isMultiUserActive }) => !isMultiUserActive && `
    .tl-nametag {
      display: none;
    }
  `}

  ${({ isToolbarVisible }) => (!isToolbarVisible) && `
    .tlui-toolbar,
    .tlui-style-panel__wrapper {
      visibility: hidden;
    }
    #WhiteboardOptionButton {
      opacity: 0.2;
    }
  `}

  #whiteboard-element {
    position: relative;
    height: 100%;
  }

  #whiteboard-element > * {
    position: relative; 
    height: 100%;
  }

  #whiteboard-element .tl-overlays {
    left: 0px;
    bottom: 0px;
  }

  .tlui-navigation-zone,
  .tlui-help-menu,
  .tlui-debug-panel {
    display: none !important;
  }

  .tl-container:focus-within {
    outline: none !important;
  }

  .tlui-style-panel__wrapper {
    right: 0px;
    top: -0.35rem;
    position: relative;
  }

  .tl-overlays__item {
    height: auto !important;
    width: auto !important;
  }

  .tlui-popover__content {
    left: -50px !important;
  }

  ${({ isPresenter, isMultiUserActive }) => !isPresenter && !isMultiUserActive && `
    .tl-cursor use {
      transform: scale(0.05)!important;
    }

    .tl-collaborator__cursor {
      position: absolute !important;
      left: -7px !important;
      top: -6px !important;
    }
  `}

  .tlui-toolbar__extras {
    position: fixed !important;
    top: 2px !important;
    
  }

  .tlui-toolbar__extras__controls {
    border-radius: var(--radius-4);
    border: none;
    background-color: ${colorOffWhite};
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.16),
      0px 2px 3px rgba(0, 0, 0, 0.24),
      0px 2px 6px rgba(0, 0, 0, 0.1);
  }

  ${({ isRTL }) => (!isRTL) && `
    .tlui-toolbar__extras {
      right: 0;
      left: 50px !important;
    }
  `}

  ${({ isRTL }) => (isRTL) && `
    .tlui-toolbar__extras {
      right: 50px !important;
      left: 0;
    }

    .tlui-toolbar__extras__controls {
      margin-right: 8px;
      margin-left: 0;
    }
  `}

  ${({ bgSelected }) => (bgSelected) && `
      [data-testid="menu-item.toggle-lock"],
      [data-testid="menu-item.toggle-locked"],
      [data-testid="menu-item.paste"],
      [data-testid="menu-item.copy"] {
        display: none !important;
      }
  `}

  [data-testid="menu-item.bring-to-front"],
  [data-testid="menu-item.bring-forward"],
  [data-testid="menu-item.send-backward"],
  [data-testid="menu-item.send-to-back"],
  [data-testid="menu-item.modify"],
  [data-testid="menu-item.conversions"],
  .tlui-helper-buttons,
  [data-testid="main.page-menu"],
  [data-testid="main.menu"],
  [data-testid="tools.more.laser"],
  [data-tool="asset"],
  [data-testid="page-menu.button"],
  [data-testid="menu-item.zoom-to-100"],
  .tlui-menu-zone {
    display: none !important;
  }

  .tl-collaborator__cursor {
    height: auto !important;
    width: auto !important;
  }

  .tlui-layout__mobile .tlui-button__tool {
    height: 30px !important;
    width: 20px !important;
  }

  .tlui-toolbar__inner {
    flex-direction: column-reverse !important;
  }

  .tlui-toolbar__tools {
    flex-direction: column !important;
  }

  .tlui-toolbar {
    align-items: end !important;
  }

  .tlui-layout__bottom {
    grid-row: auto / auto !important;
    position: absolute !important;
    right: 10px !important;
  }

  .tlui-kbd > span {
    font-family: 'Arial', sans-serif !important;
  }

  [data-side="bottom"][data-align="end"][data-state="open"][role="dialog"] {
    right: 3.5rem !important;
    bottom: 9.5rem !important;
  }

  [id*="shape:poll-result"] {
    background-color: white !important;
  }

  [data-testid="tools.delete-selected-items"] {
    display: flex;
  }

  ${({ presentationHeight }) => {
    const minRange = { height: 345, top: 14 };
    const maxRange = { height: 1200, top: 384 };

    const interpolateTop = (height) => {
      if (height <= minRange.height) return `${minRange.top}px`;
      if (height >= maxRange.height) return `${maxRange.top}px`;

      const slope = (maxRange.top - minRange.top) / (maxRange.height - minRange.height);
      const interpolatedTop = minRange.top + slope * (height - minRange.height);
      return `${interpolatedTop}px`;
    };

    const topValue = interpolateTop(presentationHeight);

    let additionalStyles = '';
    if (presentationHeight <= 405) {
      additionalStyles += `
        .tlui-layout__mobile .tlui-button__tool > .tlui-icon {
          height: 10px !important;
          width: 10px !important;
        }

        .tlui-toolbar__tools {
          flex-direction: row !important;
        }

        .tlui-toolbar__inner {
          flex-direction: row-reverse !important;
        }

        .tlui-layout__bottom {
          grid-row: auto / auto !important;
          position: relative !important;
          top: 2px !important;
        }

        .tlui-toolbar__tools.tlui-toolbar__tools__mobile {
          height: 30px !important;
        }

        [data-side="top"][role="dialog"]:has(.tlui-style-panel) {
          left: 10rem !important;
        }
      `;
    }

    return `.tlui-layout__bottom { top: ${topValue} !important; }${additionalStyles}`;
  }}
  [data-darkreader-scheme="dark"] button[data-testid="mobile.styles"] {
    & > div.tlui-icon {
      color: ${colorWhite};
    }
  }

    ${({ cursorType }) => (cursorType) && `
      .tl-canvas {
        cursor: ${cursorType} !important;
      }
  `}

`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

export default {
  TldrawV2GlobalStyle,
  EditableWBWrapper,
};
