import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import BBBMenu from '/imports/ui/components/common/menu/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

let firstReact = 0; //To touch TLD popup menus and shapes only once

const intlMessages = defineMessages({
  downloading: {
    id: 'app.presentation.options.downloading',
    description: 'Downloading label',
    defaultMessage: 'Downloading...',
  },
  downloaded: {
    id: 'app.presentation.options.downloaded',
    description: 'Downloaded label',
    defaultMessage: 'Current presentation was downloaded',
  },
  downloadFailed: {
    id: 'app.presentation.options.downloadFailed',
    description: 'Downloaded failed label',
    defaultMessage: 'Could not download current presentation',
  },
  fullscreenLabel: {
    id: 'app.presentation.options.fullscreen',
    description: 'Fullscreen label',
    defaultMessage: 'Fullscreen',
  },
  exitFullscreenLabel: {
    id: 'app.presentation.options.exitFullscreen',
    description: 'Exit fullscreen label',
    defaultMessage: 'Exit fullscreen',
  },
  minimizePresentationLabel: {
    id: 'app.presentation.options.minimize',
    description: 'Minimize presentation label',
    defaultMessage: 'Minimize',
  },
  optionsLabel: {
    id: 'app.navBar.settingsDropdown.optionsLabel',
    description: 'Options button label',
    defaultMessage: 'Options',
  },
  snapshotLabel: {
    id: 'app.presentation.options.snapshot',
    description: 'Snapshot of current slide label',
    defaultMessage: 'Snapshot of current slide',
  },
  whiteboardLabel: {
    id: 'app.shortcut-help.whiteboard',
    description: 'used for aria whiteboard options button label',
    defaultMessage: 'Whiteboard',
  },
  splitPresentationDesc: {
    id: 'app.presentation.presentationToolbar.splitPresentationDesc',
    description: 'Detach the presentation area label',
  },
  mergePresentationDesc: {
    id: 'app.presentation.presentationToolbar.mergePresentationDesc',
    description: 'Merge the detached presentation area label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  isFullscreen: PropTypes.bool,
  elementName: PropTypes.string,
  fullscreenRef: PropTypes.instanceOf(Element),
  meetingName: PropTypes.string,
  isIphone: PropTypes.bool,
  elementId: PropTypes.string,
  elementGroup: PropTypes.string,
  currentElement: PropTypes.string,
  currentGroup: PropTypes.string,
  layoutContextDispatch: PropTypes.func.isRequired,
  isRTL: PropTypes.bool,
  tldrawAPI: PropTypes.shape({
    copySvg: PropTypes.func.isRequired,
    getShapes: PropTypes.func.isRequired,
    currentPageId: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  isIphone: false,
  isFullscreen: false,
  isRTL: false,
  elementName: '',
  meetingName: '',
  fullscreenRef: null,
  elementId: '',
  elementGroup: '',
  currentElement: '',
  currentGroup: '',
  tldrawAPI: null,
};

const PresentationMenu = (props) => {
  const {
    intl,
    isFullscreen,
    elementId,
    elementName,
    elementGroup,
    currentElement,
    currentGroup,
    fullscreenRef,
    tldrawAPI,
    handleToggleFullscreen,
    layoutContextDispatch,
    meetingName,
    isIphone,
    isRTL,
    isPresentationDetached,
    presentationWindow,
    togglePresentationDetached,
  } = props;

  const [state, setState] = useState({
    hasError: false,
    loading: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toastId = useRef(null);
  const dropdownRef = useRef(null);

  const formattedLabel = (fullscreen) => (fullscreen
    ? intl.formatMessage(intlMessages.exitFullscreenLabel)
    : intl.formatMessage(intlMessages.fullscreenLabel)
  );
  
  const formattedDetachedLabel = (detached) => (detached
    ? intl.formatMessage(intlMessages.mergePresentationDesc)
    : intl.formatMessage(intlMessages.splitPresentationDesc)
  );


  function renderToastContent() {
    const { loading, hasError } = state;

    let icon = loading ? 'blank' : 'check';
    if (hasError) icon = 'circle_close';

    return (
      <Styled.Line>
        <Styled.ToastText>
          <span>
            {loading && !hasError && intl.formatMessage(intlMessages.downloading)}
            {!loading && !hasError && intl.formatMessage(intlMessages.downloaded)}
            {!loading && hasError && intl.formatMessage(intlMessages.downloadFailed)}
          </span>
        </Styled.ToastText>
        <Styled.StatusIcon>
          <Styled.ToastIcon
            done={!loading && !hasError}
            error={hasError}
            loading={loading}
            iconName={icon}
          />
        </Styled.StatusIcon>
      </Styled.Line>
    );
  }

  function getAvailableOptions() {
    const menuItems = [];

    if (!isIphone) {
      menuItems.push(
        {
          key: 'list-item-fullscreen',
          dataTest: 'presentationFullscreen',
          label: formattedLabel(isFullscreen),
          icon: isFullscreen ? 'exit_fullscreen' : 'fullscreen',
          onClick: () => {
            handleToggleFullscreen(isPresentationDetached ? presentationWindow.document.documentElement : fullscreenRef, isPresentationDetached, presentationWindow);
            const newElement = (elementId === currentElement) ? '' : elementId;
            const newGroup = (elementGroup === currentGroup) ? '' : elementGroup;

            layoutContextDispatch({
              type: ACTIONS.SET_FULLSCREEN_ELEMENT,
              value: {
                element: newElement,
                group: newGroup,
              },
            });
          },
        },
      );
    }

    const { isSafari } = browserInfo;

    if (!isSafari) {
      menuItems.push(
        {
          key: 'list-item-screenshot',
          label: intl.formatMessage(intlMessages.snapshotLabel),
          dataTest: 'presentationSnapshot',
          icon: 'video',
          onClick: async () => {
            setState({
              loading: true,
              hasError: false,
            });

            toastId.current = toast.info(renderToastContent(), {
              hideProgressBar: true,
              autoClose: false,
              newestOnTop: true,
              closeOnClick: true,
              onClose: () => {
                toastId.current = null;
              },
            });

            try {
              const { copySvg, getShapes, currentPageId } = tldrawAPI;
              const svgString = await copySvg(getShapes(currentPageId).map((shape) => shape.id));
              const container = presentationWindow.document.createElement('div');
              container.innerHTML = svgString;
              const svgElem = container.firstChild;
              const width = svgElem?.width?.baseVal?.value ?? presentationWindow.screen.width;
              const height = svgElem?.height?.baseVal?.value ?? presentationWindow.screen.height;

              const data = await toPng(svgElem, { width, height, backgroundColor: '#FFF' });

              const anchor = presentationWindow.document.createElement('a');
              anchor.href = data;
              anchor.setAttribute(
                'download',
                `${elementName}_${meetingName}_${new Date().toISOString()}.png`,
              );
              anchor.click();

              setState({
                loading: false,
                hasError: false,
              });
            } catch (e) {
              setState({
                loading: false,
                hasError: true,
              });

              logger.warn({
                logCode: 'presentation_snapshot_error',
                extraInfo: e,
              });
            }
          },
        },
      );
    }
    
    const {isMobile, isTablet} = deviceInfo;
    if (!isMobile && !isTablet && props.amIPresenter && !props.darkTheme) {
      //Currently the detach presentation function does not work on darkTheme
      // (spreadArray not defined for document.styleSheets).
      menuItems.push(
        {
          key: 'list-item-detachscreen',
          dataTest: 'presentationDetached',
          label: formattedDetachedLabel(isPresentationDetached),
          icon: isPresentationDetached ? 'application' : 'rooms',
          onClick: () => {
            toggleDetachPresentation();
          },
        },
      );
    }

    return menuItems;
  }

  function toggleDetachPresentation(){
    if (firstReact == 0){
      firstReact = 1;
      tldrawAPI.setSetting('keepStyleMenuOpen', true);
      //tldrawAPI.setSetting('dockPosition', isRTL ? 'left' : 'right'); // -> whiteboard/component
      tldrawAPI.createShapes({ id: 'rectdummy', type: 'rectangle', point: [0, 0], size: [0, 0], },
                             { id: 'textdummy', type: 'text', text: ' ', point: [0, 0], },
                             { id: 'stickydummy', type: 'sticky', text: ' ', point: [0, 0], size: [0, 0], });
      tldrawAPI.selectNone();
      const ms = 50; // a dirty workaround...
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms)
      }).then(() => {
        tldrawAPI.setSetting('keepStyleMenuOpen', false);
        tldrawAPI.delete(['rectdummy', 'textdummy', 'stickydummy']);
        togglePresentationDetached();
      });
    } else {
      togglePresentationDetached();
    }
  }

  useEffect(() => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: renderToastContent(),
        hideProgressBar: state.loading,
        autoClose: state.loading ? false : 3000,
        newestOnTop: true,
        closeOnClick: true,
        onClose: () => {
          toastId.current = null;
        },
      });
    }

    if (dropdownRef.current) {
      presentationWindow.document.activeElement.blur();
      dropdownRef.current.focus();
    }
  });

  const options = getAvailableOptions();

  if (options.length === 0) {
    const undoCtrls = presentationWindow.document.getElementById('TD-Styles')?.nextSibling;
    if (undoCtrls?.style) {
      undoCtrls.style = 'padding:0px';
    }
    const styleTool = document.getElementById('TD-Styles')?.parentNode;
    if (styleTool?.style) {
      styleTool.style = 'right:0px';
    }
    return null;
  }

  return (
    <Styled.Right>
      <BBBMenu
        trigger={(
          <TooltipContainer title={intl.formatMessage(intlMessages.optionsLabel)}>
            <Styled.DropdownButton
              state={isDropdownOpen ? 'open' : 'closed'}
              aria-label={`${intl.formatMessage(intlMessages.whiteboardLabel)} ${intl.formatMessage(intlMessages.optionsLabel)}`}
              data-test="whiteboardOptionsButton"
              onClick={() => {
                setIsDropdownOpen((isOpen) => !isOpen);
              }}
            >
              <Styled.ButtonIcon iconName="more" />
            </Styled.DropdownButton>
          </TooltipContainer>
        )}
        opts={{
          id: 'presentation-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getContentAnchorEl: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          container: isPresentationDetached ? presentationWindow.document.body : fullscreenRef
        }}
        actions={options}
        isPresentationDetached={isPresentationDetached}
        presentationWindow={presentationWindow}
      />
    </Styled.Right>
  );
};

PresentationMenu.propTypes = propTypes;
PresentationMenu.defaultProps = defaultProps;

export default injectIntl(PresentationMenu);
