import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { LAYOUT_TYPE, CAMERADOCK_POSITION, HIDDEN_LAYOUTS } from '/imports/ui/components/layout/enums';
import SettingsService from '/imports/ui/components/settings/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import Toggle from '/imports/ui/components/common/switch/component';
import Styled from './styles';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';

const LayoutModalComponent = ({
  intl,
  setIsOpen,
  isModerator = false,
  isPresenter,
  application,
  updateSettings,
  onRequestClose,
  isOpen,
  setLocalSettings,
}) => {
  const [selectedLayout, setSelectedLayout] = useState(application.selectedLayout);

  const isKeepPushingLayoutEnabled = SettingsService.isKeepPushingLayoutEnabled();

  const getKeepPushingLayout = () => {
    if (!isKeepPushingLayoutEnabled) return false;

    const storageKey = `keepPushingLayout_${Auth.meetingID}`;
    return Storage.getItem(storageKey) === true;
  };

  const setKeepPushingLayout = (value) => {
    const storageKey = `keepPushingLayout_${Auth.meetingID}`;
    Storage.setItem(storageKey, value);
  };

  const BASE_NAME = window.meetingClientSettings.public.app.cdn + window.meetingClientSettings.public.app.basename;

  const LAYOUTS_PATH = `${BASE_NAME}/resources/images/layouts/`;

  const intlMessages = defineMessages({
    title: {
      id: 'app.layout.modal.title',
      description: 'Modal title',
    },
    update: {
      id: 'app.layout.modal.update',
      description: 'Modal confirm button',
    },
    updateAll: {
      id: 'app.layout.modal.updateAll',
      description: 'Label for the push layout toggle when presenter',
    },
    followPresentersLayout: {
      id: 'app.layout.modal.followPresentersLayout',
      description: 'Label for the push layout toggle when not presenter',
    },
    pushToggleWarningTooltip: {
      id: 'app.layout.modal.pushToggleWarningTooltip',
      description: 'Tooltip for the push layout toggle when not presenter',
    },
    layoutLabel: {
      id: 'app.layout.modal.layoutLabel',
      description: 'Layout label',
    },
    layoutToastLabelAuto: {
      id: 'app.layout.modal.layoutToastLabelAuto',
      description: 'Layout toast label',
    },
    layoutToastLabelAutoOff: {
      id: 'app.layout.modal.layoutToastLabelAutoOff',
      description: 'Layout toast label',
    },
    layoutToastLabel: {
      id: 'app.layout.modal.layoutToastLabel',
      description: 'Layout toast label',
    },
    customLayout: {
      id: 'app.layout.style.custom',
      description: 'label for custom layout style',
    },
    smartLayout: {
      id: 'app.layout.style.smart',
      description: 'label for smart layout style',
    },
    presentationFocusLayout: {
      id: 'app.layout.style.presentationFocus',
      description: 'label for presentationFocus layout style',
    },
    videoFocusLayout: {
      id: 'app.layout.style.videoFocus',
      description: 'label for videoFocus layout style',
    },
    layoutSingular: {
      id: 'app.layout.modal.layoutSingular',
      description: 'label for singular layout',
    },
    layoutBtnDesc: {
      id: 'app.layout.modal.layoutBtnDesc',
      description: 'label for singular layout',
    },
    on: {
      id: 'app.switch.onLabel',
      description: 'label for toggle switch on state',
    },
    off: {
      id: 'app.switch.offLabel',
      description: 'label for toggle switch off state',
    },
  });

  const handleSwitchLayout = (e) => {
    setSelectedLayout(e);
  };

  const handleUpdateLayout = () => {
    const keepPushingLayout = getKeepPushingLayout();

    const obj = {
      application:
        { ...application, selectedLayout, pushLayout: keepPushingLayout },
    };
    if ((isModerator || isPresenter) && keepPushingLayout) {
      updateSettings(obj, intlMessages.layoutToastLabelAuto);
    } else if ((isModerator || isPresenter) && !keepPushingLayout) {
      updateSettings(obj, intlMessages.layoutToastLabelAutoOff);
    } else {
      updateSettings(obj, intlMessages.layoutToastLabel);
    }
    updateSettings(obj, intlMessages.layoutToastLabel, setLocalSettings);
    setIsOpen(false);
  };

  const toggleKeepPushingLayout = () => {
    const current = getKeepPushingLayout();
    setKeepPushingLayout(!current);
  };

  const displayToggleStatus = (toggleValue) => (
    <Styled.ToggleLabel>
      {toggleValue ? intl.formatMessage(intlMessages.on)
        : intl.formatMessage(intlMessages.off)}
    </Styled.ToggleLabel>
  );

  const renderToggle = () => {
    const keepPushingLayout = getKeepPushingLayout();

    return (
      <Styled.ToggleStatusWrapper>
        {displayToggleStatus(keepPushingLayout)}
        <Toggle
          id="TogglePush"
          icons={false}
          defaultChecked={keepPushingLayout}
          onChange={toggleKeepPushingLayout}
          ariaLabel="push"
          data-test="updateEveryoneLayoutToggle"
          showToggleLabel={false}
        />
      </Styled.ToggleStatusWrapper>
    )
  };

  const renderPushLayoutsOptions = () => {
    if (!isModerator && !isPresenter) {
      return null;
    }

    if (isKeepPushingLayoutEnabled) {
      return (
        <Tooltip title={intl.formatMessage(intlMessages.pushToggleWarningTooltip)}>
          <Styled.PushContainer>
            <Styled.LabelPushLayout>
              {isPresenter
                ? intl.formatMessage(intlMessages.updateAll)
                : intl.formatMessage(intlMessages.followPresentersLayout)}
            </Styled.LabelPushLayout>
            {renderToggle()}
          </Styled.PushContainer>
        </Tooltip>
      );
    }
    return null;
  };

  const renderLayoutButtons = () => (
    <Styled.ButtonsContainer>
      {Object.values(LAYOUT_TYPE)
        .filter((layout) => !HIDDEN_LAYOUTS.includes(layout))
        .map((layout) => (
          <Styled.ButtonLayoutContainer key={layout}>
            <Styled.LayoutBtn
              layout={layout}
              label=""
              customIcon={(
                <Styled.IconSvg
                  src={`${LAYOUTS_PATH}${layout}.svg`}
                  alt={`${layout} ${intl.formatMessage(intlMessages.layoutSingular)}`}
                />
              )}
              onClick={() => {
                handleSwitchLayout(layout);
                if (layout === LAYOUT_TYPE.CUSTOM_LAYOUT && application.selectedLayout !== layout) {
                  document.getElementById('layout')?.setAttribute('data-cam-position', CAMERADOCK_POSITION.CONTENT_TOP);
                }
              }}
              active={(layout === selectedLayout).toString()}
              aria-describedby="layout-btn-desc"
              data-test={`${layout}Layout`}
            />
            <Styled.LabelLayoutNames
              layout={layout}
              aria-hidden>{intl.formatMessage(intlMessages[`${layout}Layout`])}
            </Styled.LabelLayoutNames>
          </Styled.ButtonLayoutContainer>
        ))}
    </Styled.ButtonsContainer>
  );

  return (
    <Styled.LayoutModal
      contentLabel={intl.formatMessage(intlMessages.title)}
      shouldShowCloseButton
      shouldCloseOnOverlayClick
      isPhone={deviceInfo.isPhone}
      data-test="layoutChangeModal"
      onRequestClose={() => setIsOpen(false)}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        isOpen,
        onRequestClose,
      }}
    >
      <Styled.Content>
        <Styled.BodyContainer>
          {renderLayoutButtons()}
        </Styled.BodyContainer>
      </Styled.Content>
      <Styled.ButtonBottomContainer>
        {renderPushLayoutsOptions()}
        <Button
          color="primary"
          label={intl.formatMessage(intlMessages.update)}
          onClick={() => handleUpdateLayout()}
          data-test="updateLayoutBtn"
        />
      </Styled.ButtonBottomContainer>
      <div style={{ display: 'none' }} id="layout-btn-desc">{intl.formatMessage(intlMessages.layoutBtnDesc)}</div>
    </Styled.LayoutModal>
  );
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isModerator: PropTypes.bool.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    selectedLayout: PropTypes.string.isRequired,
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
  setLocalSettings: PropTypes.func.isRequired,
};

LayoutModalComponent.propTypes = propTypes;

export default injectIntl(LayoutModalComponent);
