import React, { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from './styles';
import Button from '/imports/ui/components/button/component';
import {
  EFFECT_TYPES,
  BLUR_FILENAME,
  IMAGE_NAMES,
  getVirtualBackgroundThumbnail,
  isVirtualBackgroundSupported,
} from '/imports/ui/services/virtual-background/service'

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleVirtualBgSelected: PropTypes.func.isRequired,
  locked: PropTypes.bool.isRequired,
  showThumbnails: PropTypes.bool,
  initialVirtualBgState: PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
};

const intlMessages = defineMessages({
  virtualBackgroundSettingsLabel: {
    id: 'app.videoPreview.webcamVirtualBackgroundLabel',
    description: 'Label for the virtual background',
  },
  virtualBackgroundSettingsDisabledLabel: {
    id: 'app.videoPreview.webcamVirtualBackgroundDisabledLabel',
    description: 'Label for the unsupported virtual background',
  },
  noneLabel: {
    id: 'app.video.virtualBackground.none',
    description: 'Label for no virtual background selected',
  },
  blurLabel: {
    id: 'app.video.virtualBackground.blur',
    description: 'Label for the blurred camera option',
  }
});

const VirtualBgSelector = ({
  intl,
  handleVirtualBgSelected,
  locked,
  showThumbnails,
  initialVirtualBgState,
}) => {
  const [currentVirtualBg, setCurrentVirtualBg] = useState({
    ...initialVirtualBgState,
  });

  const _virtualBgSelected = (type, name) => {
    handleVirtualBgSelected(type, name).then(switched => {
      // Reset to the base NONE_TYPE effect if it failed because the expected
      // behaviour from upstream's method is to actually stop/reset the effect
      // service if it fails
      if (!switched) {
        return setCurrentVirtualBg({ type: EFFECT_TYPES.NONE_TYPE });
      }

      setCurrentVirtualBg({ type, name });
    });
  };

  const renderDropdownSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <div className={styles.virtualBackgroundRowDropdown}>
        <select
          value={JSON.stringify(currentVirtualBg)}
          className={styles.select}
          disabled={disabled}
          onChange={event => {
            const { type, name } = JSON.parse(event.target.value);
            _virtualBgSelected(type, name);
          }}
        >
          <option value={JSON.stringify({ type: EFFECT_TYPES.NONE_TYPE })}>
            {intl.formatMessage(intlMessages.noneLabel)}
          </option>

          <option value={JSON.stringify({ type: EFFECT_TYPES.BLUR_TYPE })}>
            {intl.formatMessage(intlMessages.blurLabel)}
          </option>

          {IMAGE_NAMES.map((imageName, index) => (
            <option key={`${imageName}-${index}`} value={JSON.stringify({
              type: EFFECT_TYPES.IMAGE_TYPE,
              name: imageName,
            })}>
            {imageName.split(".")[0]}
          </option>
          ))}
        </select>
      </div>
    );
  }

  const renderThumbnailSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <div className={styles.virtualBackgroundRowThumbnail}>
        <Button
          icon='close'
          label={intl.formatMessage(intlMessages.noneLabel)}
          hideLabel
          disabled={disabled}
          onClick={() => _virtualBgSelected(EFFECT_TYPES.NONE_TYPE)}
        />

      <input
        type="image"
        alt="image-input"
        aria-label={EFFECT_TYPES.BLUR_TYPE}
        src={getVirtualBackgroundThumbnail(BLUR_FILENAME)}
        disabled={disabled}
        onClick={() => _virtualBgSelected(EFFECT_TYPES.BLUR_TYPE)}
      />

    {IMAGE_NAMES.map((imageName, index) => (
      <input
        type="image"
        alt="image-input"
        aria-label={imageName}
        key={`${imageName}-${index}`}
        src={getVirtualBackgroundThumbnail(imageName)}
        onClick={() => _virtualBgSelected(EFFECT_TYPES.IMAGE_TYPE, imageName)}
        disabled={disabled}
      />
    ))}
  </div>
    );
  };

  const renderSelector = () => {
    if (showThumbnails) return renderThumbnailSelector();
    return renderDropdownSelector();
  };

  return (
    <>
      <label className={styles.label}>
        {!isVirtualBackgroundSupported()
          ? intl.formatMessage(intlMessages.virtualBackgroundSettingsDisabledLabel)
          : intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
      </label>

      {renderSelector()}
    </>
  );
};

VirtualBgSelector.propTypes = propTypes;
VirtualBgSelector.defaultProps = {
  showThumbnails: false,
  initialVirtualBgState: {
    type: EFFECT_TYPES.NONE_TYPE,
  },
};

export default injectIntl(VirtualBgSelector);
