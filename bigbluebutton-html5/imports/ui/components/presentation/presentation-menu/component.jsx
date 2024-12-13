import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toPng, toSvg } from 'html-to-image';
import { toast } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import {
  PresentationDropdownItemType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/presentation-dropdown-item/enums';

import Styled from './styles';
import BBBMenu from '/imports/ui/components/common/menu/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import AppService from '/imports/ui/components/app/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import SvgIcon from '/imports/ui/components/common/icon-svg/component';

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
  allowSnapshotOfCurrentSlide: PropTypes.bool,
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
    getSvg: PropTypes.func.isRequired,
    getCurrentPageShapes: PropTypes.func.isRequired,
  }),
  presentationDropdownItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
  })).isRequired,
};

const PresentationMenu = (props) => {
  const Settings = getSettingsSingletonInstance();
  const {
    intl,
    isFullscreen = false,
    elementId = '',
    elementName = '',
    elementGroup = '',
    currentElement = '',
    currentGroup = '',
    fullscreenRef = null,
    tldrawAPI = null,
    handleToggleFullscreen,
    layoutContextDispatch,
    meetingName = '',
    isIphone = false,
    isRTL = Settings.application.isRTL,
    isToolbarVisible,
    setIsToolbarVisible,
    allowSnapshotOfCurrentSlide = false,
    presentationDropdownItems,
    slideNum,
    currentUser,
    whiteboardId,
    persistShape,
    hasWBAccess,
  } = props;

  const [state, setState] = useState({
    hasError: false,
    loading: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toastId = useRef('presentation-menu-toast');
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
        dataArray.forEach((originalShape) => {
          const shape = {
            ...originalShape,
            parentId: `page:${slideNum}`,
            meta: {
              ...originalShape.meta,
              createdBy: currentUser.userId,
            },
          };
          persistShape(shape, whiteboardId, currentUser.isModerator);
        });
      };
      reader.readAsText(file);

      // Reset the file input
      fileInput.value = '';
    }
  };

  // const handleFileClick = () => {
  //   const fileInput = document.getElementById('hiddenFileInput');
  //   if (fileInput) {
  //     fileInput.click();
  //   } else {
  //     console.error('File input not found');
  //   }
  // };

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

    const { isIos } = deviceInfo;
    const { isSafari } = browserInfo;

    if (allowSnapshotOfCurrentSlide) {
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

            toast.info(renderToastContent(), {
              hideProgressBar: true,
              autoClose: false,
              newestOnTop: true,
              closeOnClick: true,
              toastId: toastId.current,
            });

            // This is a workaround to a conflict of the
            // dark mode's styles and the html-to-image lib.
            // Issue:
            //  https://github.com/bubkoo/html-to-image/issues/370
            const darkThemeState = AppService.isDarkThemeEnabled();
            AppService.setDarkTheme(false);

            try {
              // filter shapes that are inside the slide
              const backgroundShape = tldrawAPI.getCurrentPageShapes().find((s) => s.id === `shape:BG-${slideNum}`);
              const shapes = tldrawAPI.getCurrentPageShapes();
              const pollShape = shapes.find((shape) => shape.type === 'poll');
              const svgElem = await tldrawAPI.getSvg(
                shapes
                  .filter((shape) => shape.type !== 'poll')
                  .map((shape) => shape.id),
              );
              svgElem.setAttribute('width', backgroundShape.props.w);
              svgElem.setAttribute('height', backgroundShape.props.h);
              svgElem.setAttribute('viewBox', `1 1 ${backgroundShape.props.w} ${backgroundShape.props.h}`);
              if (pollShape) {
                const pollShapeElement = document.getElementById(pollShape.id);
                const pollShapeSvg = await toSvg(pollShapeElement);
                const pollShapeImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                pollShapeImage.setAttribute('href', pollShapeSvg);
                pollShapeImage.setAttribute('width', pollShape.props.w);
                pollShapeImage.setAttribute('height', pollShape.props.h);
                pollShapeImage.setAttribute('x', pollShape.x);
                pollShapeImage.setAttribute('y', pollShape.y);
                svgElem.appendChild(pollShapeImage);
              }

              // workaround for ios
              if (isIos || isSafari) {
                const svgString = new XMLSerializer().serializeToString(svgElem);
                const blob = new Blob([svgString], { type: 'image/svg+xml' });

                const data = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = data;
                anchor.setAttribute(
                  'download',
                  `${elementName}_${meetingName}_${new Date().toISOString()}.svg`,
                );
                anchor.click();
              } else {
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
              }

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

    const showVisibilityOption = currentUser?.presenter || hasWBAccess;

    showVisibilityOption && menuItems.push(
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

    // if (props.amIPresenter) {
    //   menuItems.push({
    //     key: 'list-item-load-shapes',
    //     dataTest: 'loadShapes',
    //     label: 'Load .tldr Data',
    //     icon: 'pen_tool',
    //     onClick: handleFileClick,
    //   });
    // }

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
    if (toast.isActive(toastId.current)) {
      toast.update(toastId.current, {
        render: renderToastContent(),
        hideProgressBar: state.loading,
        autoClose: state.loading ? false : 3000,
        newestOnTop: true,
        closeOnClick: true,
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
    <Styled.Right id="WhiteboardOptionButton">
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
              <SvgIcon iconName="whiteboardOptions" />
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
    </Styled.Right>
  );
};

PresentationMenu.propTypes = propTypes;

export default injectIntl(PresentationMenu);
