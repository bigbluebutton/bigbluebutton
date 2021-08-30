import React, { useState, useRef } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from './styles';
import Button from '/imports/ui/components/button/component';
import TooltipContainer from '/imports/ui/components/tooltip/container';
import {
  EFFECT_TYPES,
  BLUR_FILENAME,
  IMAGE_NAMES,
  getVirtualBackgroundThumbnail,
  isVirtualBackgroundSupported,
} from '/imports/ui/services/virtual-background/service';
import { capitalizeFirstLetter } from '/imports/utils/string-utils';

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
  },
  camBgAriaDesc: {
    id: 'app.video.virtualBackground.camBgAriaDesc',
    description: 'Label for virtual background button aria',
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

  const inputElementsRef = useRef([]);

  const _virtualBgSelected = (type, name, index) =>
    handleVirtualBgSelected(type, name)
      .then(switched => {
        // Reset to the base NONE_TYPE effect if it failed because the expected
        // behaviour from upstream's method is to actually stop/reset the effect
        // service if it fails
        if (!switched) {
          return setCurrentVirtualBg({ type: EFFECT_TYPES.NONE_TYPE });
        }

        if (index >= 0) {
          inputElementsRef.current[index].focus();
        }
        return setCurrentVirtualBg({ type, name });
      });

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

          {IMAGE_NAMES.map((imageName, i) => {
            const k = `${imageName}-${i}`;
            return (
              <option key={k} value={JSON.stringify({
                type: EFFECT_TYPES.IMAGE_TYPE,
                name: imageName,
              })}>
                {imageName.split(".")[0]}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  const renderThumbnailSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <div className={styles.virtualBackgroundRowThumbnail}>
        <div className={styles.bgWrapper}>
          <>
            <Button
              className={styles.bgNone}
              icon='close'
              label={intl.formatMessage(intlMessages.noneLabel)}
              aria-describedby={`vr-cam-btn-none`}
              hideLabel
              disabled={disabled}
              onClick={() => _virtualBgSelected(EFFECT_TYPES.NONE_TYPE)}
            />
            <div aria-hidden className="sr-only" id={`vr-cam-btn-none`}>
              {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.NONE_TYPE })}
            </div>
          </>

          <TooltipContainer title={intl.formatMessage(intlMessages.blurLabel)} key={`blur-0`}>
            <>
              <div
                role="button"
                className={styles.virtualBackgroundItem}
                aria-label={EFFECT_TYPES.BLUR_TYPE}
                aria-describedby={`vr-cam-btn-blur`}
                tabIndex={0}
                disabled={disabled}
                ref={ref => { inputElementsRef.current[0] = ref; }}
                onClick={() => _virtualBgSelected(EFFECT_TYPES.BLUR_TYPE, 'Blur', 0)}
              >
                <img aria-hidden className={styles.bgImage} src={getVirtualBackgroundThumbnail(BLUR_FILENAME)} />
              </div>
              <div aria-hidden className="sr-only" id={`vr-cam-btn-blur`}>
                {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.BLUR_TYPE })}
              </div>
            </>
          </TooltipContainer>

          {IMAGE_NAMES.map((imageName, index) => (
            <TooltipContainer
              title={capitalizeFirstLetter(imageName.split('.').shift())}
              key={`${imageName}-${index}`}
            >
              <>
                <div
                  tabIndex={0}
                  role="button"
                  className={styles.virtualBackgroundItem}
                  aria-label={capitalizeFirstLetter(imageName.split('.').shift())}
                  aria-describedby={`vr-cam-btn-${index}`}
                  ref={ref => inputElementsRef.current[index + 1] = ref}
                  onClick={() => _virtualBgSelected(EFFECT_TYPES.IMAGE_TYPE, imageName, index + 1)}
                  disabled={disabled}
                >
                  <img aria-hidden className={styles.bgImage} src={getVirtualBackgroundThumbnail(imageName)} />
                </div>
                <div aria-hidden className="sr-only" id={`vr-cam-btn-${index}`}>
                  {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: capitalizeFirstLetter(imageName.split('.').shift()) })}
                </div>
            </>
            </TooltipContainer>
          ))}

        </div>
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
