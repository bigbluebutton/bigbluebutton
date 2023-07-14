import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { LAYOUT_TYPE, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import SettingsService from '/imports/ui/components/settings/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';

const LayoutModalComponent = (props) => {
  const {
    intl,
    setIsOpen,
    isModerator,
    isPresenter,
    application,
    updateSettings,
    onRequestClose,
    isOpen,
  } = props;

  const [selectedLayout, setSelectedLayout] = useState(application.selectedLayout);

  const BASE_NAME = Meteor.settings.public.app.basename;

  const LAYOUTS_PATH = `${BASE_NAME}/resources/images/layouts/`;
  const isKeepPushingLayoutEnabled = SettingsService.isKeepPushingLayoutEnabled();

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
      description: 'Modal updateAll button',
    },
    layoutLabel: {
      id: 'app.layout.modal.layoutLabel',
      description: 'Layout label',
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
  });

  const handleSwitchLayout = (e) => {
    setSelectedLayout(e);
  };

  const handleUpdateLayout = (updateAll) => {
    const obj = {
      application:
      { ...application, selectedLayout, pushLayout: updateAll },
    };
    updateSettings(obj, intlMessages.layoutToastLabel);
    setIsOpen(false);
  };

  const renderPushLayoutsOptions = () => {
    if (!isModerator && !isPresenter) {
      return null;
    }

    if (isKeepPushingLayoutEnabled) {
      return (
        <Styled.BottomButton
          label={intl.formatMessage(intlMessages.updateAll)}
          onClick={() => handleUpdateLayout(true)}
          color="secondary"
          data-test="updateEveryoneLayoutBtn"
        />
      );
    }
    return null;
  };

  const renderLayoutButtons = () => (
    <Styled.ButtonsContainer>
      {Object.values(LAYOUT_TYPE)
        .map((layout) => (
          <Styled.ButtonLayoutContainer key={layout}>
            <Styled.LayoutBtn
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
            <Styled.LabelLayoutNames aria-hidden>{intl.formatMessage(intlMessages[`${layout}Layout`])}</Styled.LabelLayoutNames>
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
          onClick={() => handleUpdateLayout(false)}
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
  showToggleLabel: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    selectedLayout: PropTypes.string.isRequired,
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
};

LayoutModalComponent.propTypes = propTypes;

export default injectIntl(LayoutModalComponent);
