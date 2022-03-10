import React, { useState, useRef } from 'react';
import { findDOMNode } from 'react-dom';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';
import {
  EFFECT_TYPES,
  BLUR_FILENAME,
  IMAGE_NAMES,
  getVirtualBackgroundThumbnail,
  isVirtualBackgroundSupported,
} from '/imports/ui/services/virtual-background/service';

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
  },
  background: {
    id: 'app.video.virtualBackground.background',
    description: 'Label for the background word',
  },
  ...IMAGE_NAMES.reduce((prev, imageName) => {
    const id = imageName.split('.').shift();
    return {
      ...prev,
      [id]: {
        id: `app.video.virtualBackground.${id}`,
        description: `Label for the ${id} camera option`,
        defaultMessage: '{background} {index}',
      },
    };
  }, {})
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
          findDOMNode(inputElementsRef.current[index]).focus();
        }
        return setCurrentVirtualBg({ type, name });
      });

  const renderDropdownSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <div>
        <Styled.Select
          value={JSON.stringify(currentVirtualBg)}
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
        </Styled.Select>
      </div>
    );
  }

  const renderThumbnailSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <Styled.VirtualBackgroundRowThumbnail>
        <Styled.BgWrapper
          role="group"
          aria-label={intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
        >
          <>
            <Styled.BgNoneButton
              icon='close'
              label={intl.formatMessage(intlMessages.noneLabel)}
              aria-pressed={currentVirtualBg?.name === undefined}
              aria-describedby={`vr-cam-btn-none`}
              hideLabel
              tabIndex={disabled ? -1 : 0}
              disabled={disabled}
              onClick={() => _virtualBgSelected(EFFECT_TYPES.NONE_TYPE)}
            />
            <div aria-hidden className="sr-only" id={`vr-cam-btn-none`}>
              {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.NONE_TYPE })}
            </div>
          </>

          <>
            <Styled.ThumbnailButton
              style={{ backgroundImage: `url('${getVirtualBackgroundThumbnail(BLUR_FILENAME)}')` }}
              aria-label={intl.formatMessage(intlMessages.blurLabel)}
              label={intl.formatMessage(intlMessages.blurLabel)}
              aria-describedby={`vr-cam-btn-blur`}
              tabIndex={disabled ? -1 : 0}
              hideLabel
              aria-pressed={currentVirtualBg?.name?.includes('blur') || currentVirtualBg?.name?.includes('Blur')}
              disabled={disabled}
              ref={ref => { inputElementsRef.current[0] = ref; }}
              onClick={() => _virtualBgSelected(EFFECT_TYPES.BLUR_TYPE, 'Blur', 0)}
            />
            <div aria-hidden className="sr-only" id={`vr-cam-btn-blur`}>
              {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.BLUR_TYPE })}
            </div>
          </>

          {IMAGE_NAMES.map((imageName, index) => {
            const label = intl.formatMessage(intlMessages[imageName.split('.').shift()], {
              index: index + 2,
              background: intl.formatMessage(intlMessages.background),
            });

            return (
              <div key={`${imageName}-${index}`} style={{ position: 'relative' }}>
                <Styled.ThumbnailButton
                  id={`${imageName}-${index}`}
                  label={label}
                  tabIndex={disabled ? -1 : 0}
                  role="button"
                  aria-label={label}
                  aria-describedby={`vr-cam-btn-${index}`}
                  aria-pressed={currentVirtualBg?.name?.includes(imageName.split('.').shift())}
                  hideLabel
                  ref={ref => inputElementsRef.current[index + 1] = ref}
                  onClick={() => _virtualBgSelected(EFFECT_TYPES.IMAGE_TYPE, imageName, index + 1)}
                  disabled={disabled}
                />
                <Styled.Thumbnail onClick={() => {
                  const node = findDOMNode(inputElementsRef.current[index + 1]);
                  node.focus();
                  node.click();
                }} aria-hidden src={getVirtualBackgroundThumbnail(imageName)} />
                <div aria-hidden className="sr-only" id={`vr-cam-btn-${index}`}>
                  {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: label })}
                </div>
              </div>
            )
          })}
        </Styled.BgWrapper>
      </Styled.VirtualBackgroundRowThumbnail>
    );
  };

  const renderSelector = () => {
    if (showThumbnails) return renderThumbnailSelector();
    return renderDropdownSelector();
  };

  return (
    <>
      <Styled.Label>
        {!isVirtualBackgroundSupported()
          ? intl.formatMessage(intlMessages.virtualBackgroundSettingsDisabledLabel)
          : intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
      </Styled.Label>

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