import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import {
  PresentationDropdownItemType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/presentation-dropdown-item/enums';

import Styled from './styles';
import BBBMenu from '/imports/ui/components/common/menu/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import AppService from '/imports/ui/components/app/service';

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
    id: 'app.navBar.optionsDropdown.optionsLabel',
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
  hideToolsDesc: {
    id: 'app.presentation.presentationToolbar.hideToolsDesc',
    description: 'Hide toolbar label',
  },
  showToolsDesc: {
    id: 'app.presentation.presentationToolbar.showToolsDesc',
    description: 'Show toolbar label',
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
  presentationDropdownItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
};

const defaultProps = {
  allowSnapshotOfCurrentSlide: PropTypes.bool.isRequired,
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
    isToolbarVisible,
    setIsToolbarVisible,
    allowSnapshotOfCurrentSlide,
    presentationDropdownItems,
    slideNum,
    currentUser,
    whiteboardId,
    persistShape
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
  
  const formattedVisibilityLabel = (visible) => (visible
    ? intl.formatMessage(intlMessages.hideToolsDesc)
    : intl.formatMessage(intlMessages.showToolsDesc)
  );

  const extractShapes = (savedState) => {
    let data;

    // Check if savedState is a string (JSON) or an object
    if (typeof savedState === 'string') {
      try {
        data = JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return {};
      }
    } else if (typeof savedState === 'object' && savedState !== null) {
      data = savedState;
    } else {
      console.error('Invalid savedState type:', typeof savedState);
      return {};
    }

    // Check if 'records' key exists and extract shapes into an object keyed by shape ID
    if (data && data.records) {
      return data.records.reduce((acc, record) => {
        if (record.typeName === 'shape') {
          acc[record.id] = record;
        }
        return acc;
      }, {});
    }

    return {};
  };

  const handleFileInput = (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        const dataObj = extractShapes(JSON.parse(fileContent));
        const dataArray = Object.values(dataObj);
        dataArray.forEach(shape => {
          shape.parentId = `page:${slideNum}`;
          shape.meta.createdBy = currentUser.userId;
          persistShape(shape, whiteboardId, currentUser.isModerator);
        });
      };
      reader.readAsText(file);

      // Reset the file input
      fileInput.value = '';
    }
  };

  const handleFileClick = () => {
    const fileInput = document.getElementById('hiddenFileInput');
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('File input not found');
    }
  };

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

    if (!isSafari && allowSnapshotOfCurrentSlide) {
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

            // This is a workaround to a conflict of the
            // dark mode's styles and the html-to-image lib.
            // Issue:
            //  https://github.com/bubkoo/html-to-image/issues/370
            const darkThemeState = AppService.isDarkThemeEnabled();
            AppService.setDarkTheme(false);

            try {
              const { copySvg, getShape, getShapes, currentPageId } = tldrawAPI;

              // filter shapes that are inside the slide
              const backgroundShape = getShape('slide-background-shape');
              const shapes = getShapes(currentPageId)
                .filter((shape) =>
                  shape.point[0] <= backgroundShape.size[0] &&
                  shape.point[1] <= backgroundShape.size[1] &&
                  shape.point[0] >= 0 &&
                  shape.point[1] >= 0
                );
              const svgString = await copySvg(shapes.map((shape) => shape.id));
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
    
    const tools = document.querySelector('.tlui-toolbar, .tlui-style-panel__wrapper, .tlui-menu-zone');
    if (tools && (props.hasWBAccess || props.amIPresenter)){
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

    if (props.amIPresenter) {
      menuItems.push({
        key: 'list-item-load-shapes',
        dataTest: 'loadShapes',
        label: 'Load .tldr Data',
        icon: 'pen_tool',
        onClick: handleFileClick,
      });
    }

    presentationDropdownItems.forEach((item, index) => {
      switch (item.type) {
        case PresentationDropdownItemType.OPTION:
          menuItems.push({
            key: `${item.id}-${index}`,
            label: item.label,
            icon: item.icon,
            onClick: item.onClick,
          });
          break;
        case PresentationDropdownItemType.SEPARATOR:
          menuItems.push({
            key: `${item.id}-${index}`,
            isSeparator: true,
          });
          break;
        default:
          break;
      }
    });

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
    <Styled.Left id='WhiteboardOptionButton'>
      <BBBMenu
        trigger={(
          <TooltipContainer title={intl.formatMessage(intlMessages.optionsLabel)}>
            <Styled.DropdownButton
              state={isDropdownOpen ? 'open' : 'closed'}
              aria-label={`${intl.formatMessage(intlMessages.whiteboardLabel)} ${intl.formatMessage(intlMessages.optionsLabel)}`}
              data-test="whiteboardOptionsButton"
              data-state={isDropdownOpen ? 'open' : 'closed'}
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
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          container: fullscreenRef,
        }}
        actions={options}
      />
      <input
        type="file"
        id="hiddenFileInput"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </Styled.Left>
  );
};

PresentationMenu.propTypes = propTypes;
PresentationMenu.defaultProps = defaultProps;

export default injectIntl(PresentationMenu);
