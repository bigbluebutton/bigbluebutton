import styled, { createGlobalStyle } from 'styled-components';

const TldrawV2GlobalStyle = createGlobalStyle`
  ${({ isPresenter, hasWBAccess }) => (!isPresenter && hasWBAccess) && `
    [data-testid="tools.hand"] {
      display: none;
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

  .tlui-style-panel__wrapper {
    right: 0px;
    top: -0.35rem;
    position: relative;
  }

  // Add the following lines to override height and width attributes for .tl-overlays__item
  .tl-overlays__item {
    height: auto !important;
    width: auto !important;
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
    top: -2px !important;
    left: 40px !important;
  }

  ${({ isRTL }) => (!isRTL) && `
    .tlui-toolbar__extras {
      position: fixed !important;
      top: -2px !important;
      right: 50px !important;
    }
  `}

  [data-testid="main.page-menu"],
  [data-testid="main.menu"],
  [data-testid="tools.more.laser"],
  [data-testid="tools.asset"],
  [data-testid="page-menu.button"],
  tlui-menu-zone {
    display: none !important;
  }

  .tl-collaborator__cursor {
    height: auto !important;
    width: auto !important;
  }

  .tlui-layout__bottom {
    grid-row: auto / auto !important;
    position: absolute !important;
    right: 10px !important;
    top: 6.5rem !important;
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
