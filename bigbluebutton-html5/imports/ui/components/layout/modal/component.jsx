import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { LAYOUT_TYPE, LAYOUT_TYPE_MOBILE } from '/imports/ui/components/layout/enums';
import { withModalMounter } from '/imports/ui/components/modal/service';
import SettingsService from '/imports/ui/components/settings/service';
import LayoutService from '/imports/ui/components/layout/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Toggle from '/imports/ui/components/switch/component';
import Button from '/imports/ui/components/button/component';
import deviceInfo from '/imports/utils/deviceInfo';
import cx from 'classnames';
import { styles } from './styles';

const LayoutModalComponent = (props) => {
  const {
    intl,
    closeModal,
    isPresenter,
    showToggleLabel,
    application,
    updateSettings,
  } = props;

  const [selectedLayout, setSelectedLayout] = useState(application.selectedLayout);
  const [pushLayout, setPushLayout] = useState(false);
  // eslint-disable-next-line react/prop-types
  const [isKeepPushingLayout, setIsKeepPushingLayout] = useState(application.pushLayout);

  const BASE_NAME = Meteor.settings.public.app.basename;
  const LAYOUTS_PATH = `${BASE_NAME}/resources/images/layouts/`;
  const isKeepPushingLayoutEnabled = SettingsService.isKeepPushingLayoutEnabled();
  const { isMobile } = deviceInfo;

  const intlMessages = defineMessages({
    title: {
      id: 'app.layout.modal.title',
      description: 'Modal title',
    },
    confirm: {
      id: 'app.layout.modal.confirm',
      description: 'Modal confirm button',
    },
    cancel: {
      id: 'app.layout.modal.cancel',
      description: 'Modal cancel button',
    },
    layoutLabel: {
      id: 'app.layout.modal.layoutLabel',
      description: 'Layout label',
    },
    layoutToastLabel: {
      id: 'app.layout.modal.layoutToastLabel',
      description: 'Layout toast label',
    },
    keepPushingLayoutLabel: {
      id: 'app.layout.modal.keepPushingLayoutLabel',
      description: 'Keep push layout Label',
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
  });

  const handleSwitchLayout = (e) => {
    setSelectedLayout(e);
  };

  const handleKeepPushingLayout = () => {
    setIsKeepPushingLayout((newValue) => !newValue);
  };

  const handleCloseModal = () => {
    const obj = {
      application:
      { ...application, selectedLayout, pushLayout: isKeepPushingLayout },
    };

    if (pushLayout) {
      LayoutService.setMeetingLayout({ layout: selectedLayout });
    }

    updateSettings(obj, intl.formatMessage(intlMessages.layoutToastLabel));
    closeModal();
  };

  const renderPushLayoutsOptions = () => {
    if (!isPresenter) {
      return null;
    }
    if (isKeepPushingLayoutEnabled) {
      return (
        <div className={styles.pushContainer}>
          <label htmlFor="TogglePush" className={styles.labelPushLayout}>
            {intl.formatMessage(intlMessages.keepPushingLayoutLabel)}
          </label>
          <Toggle
            id="TogglePush"
            icons={false}
            defaultChecked={isKeepPushingLayout}
            onChange={handleKeepPushingLayout}
            ariaLabel="push"
            showToggleLabel={showToggleLabel}
          />
        </div>
      );
    }
  };

  const renderLayoutButtons = () => (
    <div className={styles.buttonsContainer}>
      {Object.values(isMobile ? LAYOUT_TYPE_MOBILE : LAYOUT_TYPE)
        .map((layout) => (
          <div className={styles.buttonLayoutContainer} key={layout}>
            <p className={styles.labelLayoutNames}>{intl.formatMessage(intlMessages[`${layout}Layout`])}</p>
            <Button
              className={cx({
                [styles.layoutBtn]: true,
                [styles.layoutBtnActive]: layout === selectedLayout,
              })}
              label=""
              customIcon={<img src={`${LAYOUTS_PATH}${layout}.svg`} alt={`${LAYOUTS_PATH}${layout}Layout`} className={styles.iconSvg} />}
              onClick={() => handleSwitchLayout(layout)}
            />
          </div>
        ))}
    </div>
  );

  return (
    <Modal
      overlayClassName={styles.overlay}
      className={styles.modal}
      onRequestClose={closeModal}
      hideBorder
    >
      <header className={styles.header}>
        <h3 className={styles.title}>
          {intl.formatMessage(intlMessages.title)}
        </h3>
      </header>
      <div className={styles.content}>
        <div className={styles.bodyContainer}>
          {renderLayoutButtons()}
          {renderPushLayoutsOptions()}
        </div>
        <div className={styles.buttonBottomContainer}>
          <Button
            label={intl.formatMessage(intlMessages.cancel)}
            onClick={closeModal}
            className={styles.bottomButton}
          />
          <Button
            color="primary"
            label={intl.formatMessage(intlMessages.confirm)}
            onClick={handleCloseModal}
          />
        </div>
      </div>
    </Modal>
  );
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  showToggleLabel: PropTypes.bool.isRequired,
  application: PropTypes.shape({
    selectedLayout: PropTypes.string.isRequired,
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
};

LayoutModalComponent.propTypes = propTypes;

export default injectIntl(withModalMounter(LayoutModalComponent));
