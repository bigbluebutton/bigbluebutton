import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import Styled from '/imports/ui/components/presentation/presentation-menu/styles';
import BBBMenu from './menu/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import AppService from '/imports/ui/components/app/service';

const propTypes = {
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

const PresentationOps = (props) => {
  const {
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
    isToolbarVisible,
    setIsToolbarVisible,
    exitFullscreenLabel,
    fullscreenLabel,
    hideToolsDesc,
    showToolsDesc,
    downloading,
    downloaded,
    downloadFailed,
    snapshotLabel,
    hasWBAccess,
    amIPresenter,
    optionsLabel,
    whiteboardLabel,
  } = props;

  const [state, setState] = useState({
    hasError: false,
    loading: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toastId = useRef(null);
  const dropdownRef = useRef(null);

  const formattedLabel = (fullscreen) => (fullscreen
    ? exitFullscreenLabel
    : fullscreenLabel
  );
  
  const formattedVisibilityLabel = (visible) => (visible
    ? hideToolsDesc
    : showToolsDesc
  );

  function renderToastContent() {
    const { loading, hasError } = state;

    let icon = loading ? 'blank' : 'check';
    if (hasError) icon = 'circle_close';

    return (
      <Styled.Line>
        <Styled.ToastText>
          <span>
            {loading && !hasError && downloading}
            {!loading && !hasError && downloaded}
            {!loading && hasError && downloadFailed}
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
            handleToggleFullscreen(fullscreenRef);
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
          label: snapshotLabel,
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

            // This is a workaround to a conflict of the
            // dark mode's styles and the html-to-image lib.
            // Issue:
            //  https://github.com/bubkoo/html-to-image/issues/370
            const darkThemeState = AppService.isDarkThemeEnabled();
            AppService.setDarkTheme(false);

            try {
              const { copySvg, getShapes, currentPageId } = tldrawAPI;
              const svgString = await copySvg(getShapes(currentPageId).map((shape) => shape.id));
              const container = document.createElement('div');
              container.innerHTML = svgString;
              const svgElem = container.firstChild;
              const width = svgElem?.width?.baseVal?.value ?? window.screen.width;
              const height = svgElem?.height?.baseVal?.value ?? window.screen.height;

              const data = await toPng(svgElem, { width, height, backgroundColor: '#FFF' });

              const anchor = document.createElement('a');
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
            } finally {
              // Workaround
              AppService.setDarkTheme(darkThemeState);
            }
          },
        },
      );
    }
    
    const tools = document.querySelector('#TD-Tools');
    if (tools && (hasWBAccess || amIPresenter)){
      menuItems.push(
        {
          key: 'list-item-toolvisibility',
          dataTest: 'toolVisibility',
          label: formattedVisibilityLabel(isToolbarVisible),
          icon: isToolbarVisible ? 'close' : 'pen_tool',
          onClick: () => {
            setIsToolbarVisible(!isToolbarVisible);
          },
        },
      );
    }

    return menuItems;
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
      document.activeElement.blur();
      dropdownRef.current.focus();
    }
  });

  const options = getAvailableOptions();

  if (options.length === 0) {
    const undoCtrls = document.getElementById('TD-Styles')?.nextSibling;
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
    <Styled.Right id='WhiteboardOptionButton'>
      <BBBMenu
        {...{
            ...props,
        }}
        trigger={(
          <TooltipContainer title={optionsLabel}>
            <Styled.DropdownButton
              state={isDropdownOpen ? 'open' : 'closed'}
              aria-label={`${whiteboardLabel} ${optionsLabel}`}
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
          container: fullscreenRef,
        }}
        actions={options}
      />
    </Styled.Right>
  );
};

PresentationOps.propTypes = propTypes;
PresentationOps.defaultProps = defaultProps;

export default PresentationOps;
