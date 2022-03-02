import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toPng } from 'html-to-image';
import { toast } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import browserInfo from '/imports/utils/browserInfo';

const OLD_MINIMIZE_BUTTON_ENABLED = Meteor.settings.public.presentation.oldMinimizeButton;

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
    description: 'Snapshot of current presentation label',
    defaultMessage: 'Snapshot of current presentation',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  isDropdownOpen: PropTypes.bool,
  toggleSwapLayout: PropTypes.func.isRequired,
  isFullscreen: PropTypes.bool,
  elementName: PropTypes.string,
  fullscreenRef: PropTypes.instanceOf(Element),
  screenshotRef: PropTypes.instanceOf(Element),
  meetingName: PropTypes.string,
  isIphone: PropTypes.bool,
};

const defaultProps = {
  isDropdownOpen: false,
  isIphone: false,
  isFullscreen: false,
  elementName: '',
  meetingName: '',
  fullscreenRef: null,
  screenshotRef: null,
};

const PresentationMenu = (props) => {
  const {
    intl,
    toggleSwapLayout,
    isFullscreen,
    elementId,
    elementName,
    elementGroup,
    currentElement,
    currentGroup,
    fullscreenRef,
    screenshotRef,
    handleToggleFullscreen,
    layoutContextDispatch,
    meetingName,
    isIphone,
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

  function renderMenuItems() {
    const menuItems = [];

    if (!isIphone) {
      menuItems.push(
        {
          key: 'list-item-fullscreen',
          dataTest: 'presentationFullscreen',
          label: formattedLabel(isFullscreen),
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

    if (OLD_MINIMIZE_BUTTON_ENABLED) {
      menuItems.push(
        {
          key: 'list-item-minimize',
          label: intl.formatMessage(intlMessages.minimizePresentationLabel),
          onClick: () => {
            toggleSwapLayout(layoutContextDispatch);
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
          onClick: () => {
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

            toPng(screenshotRef, {
              width: window.screen.width,
              height: window.screen.height,
            }).then((data) => {
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
            }).catch((error) => {
              logger.warn({
                logCode: 'presentation_snapshot_error',
                extraInfo: error,
              });

              setState({
                loading: false,
                hasError: true,
              });
            });
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

  return (
    <Styled.Right>
      <TooltipContainer title={intl.formatMessage(intlMessages.optionsLabel)}>
        <Styled.DropdownButton
          state={isDropdownOpen ? 'open' : 'closed'}
          aria-label={intl.formatMessage(intlMessages.optionsLabel)}
          data-test="whiteboardOptionsButton"
          onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
        >
          <Styled.ButtonIcon iconName="more" />
        </Styled.DropdownButton>
      </TooltipContainer>
      { isDropdownOpen && (
        <>
          <Styled.Overlay onClick={() => setIsDropdownOpen(false)} />
          <Styled.Dropdown
            ref={dropdownRef}
            onBlur={() => setIsDropdownOpen(false)}
            tabIndex={0}
          >
            <Styled.List>
              { renderMenuItems().map((option) => {
                const {
                  label, onClick, key, dataTest,
                } = option;

                return (
                  <Styled.ListItem
                    {...{
                      onClick,
                      key,
                      'data-test': dataTest ?? '',
                    }}
                  >
                    {label}
                  </Styled.ListItem>
                );
              }) }
            </Styled.List>
          </Styled.Dropdown>
        </>
      ) }
    </Styled.Right>
  );
};

PresentationMenu.propTypes = propTypes;
PresentationMenu.defaultProps = defaultProps;

export default injectIntl(PresentationMenu);
