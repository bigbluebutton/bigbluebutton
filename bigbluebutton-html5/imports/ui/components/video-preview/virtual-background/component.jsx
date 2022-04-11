import React, { useState, useRef, useContext, useEffect } from 'react';
import { findDOMNode } from 'react-dom';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Styled from './styles';
import {
  EFFECT_TYPES,
  BLUR_FILENAME,
  IMAGE_NAMES,
  getVirtualBackgroundThumbnail,
  isVirtualBackgroundSupported,
} from '/imports/ui/services/virtual-background/service';
import { CustomVirtualBackgroundsContext } from './context';

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
  customLabel: {
    id: 'app.video.virtualBackground.custom',
    description: 'Label for custom virtual background selected',
  },
  removeLabel: {
    id: 'app.video.virtualBackground.remove',
    description: 'Label for remove custom virtual background',
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
  isVisualEffects,
}) => {
  const [currentVirtualBg, setCurrentVirtualBg] = useState({
    ...initialVirtualBgState,
  });

  const inputElementsRef = useRef([]);

  const {
    dispatch,
    loaded,
    customBackgrounds,
    newCustomBackgrounds,
    loadFromDB,
  } = useContext(CustomVirtualBackgroundsContext);

  useEffect(() => {
    if (!loaded && isVisualEffects) loadFromDB();
  }, []);

  const _virtualBgSelected = (type, name, index, customParams) =>
    handleVirtualBgSelected(type, name, customParams)
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

  const customBgSelectorRef = useRef(null);

  const handleCustomBgChange = (event) => {
    const file = event.target.files[0];
    const { name: filename } = file;
    const reader = new FileReader();
    const substrings = filename.split('.');
    substrings.pop();
    const filenameWithoutExtension = substrings.join('');

    reader.onload = function (e) {
      const background = {
        filename: filenameWithoutExtension,
        data: e.target.result,
        uniqueId: _.uniqueId(),
      };
      dispatch({
        type: 'new',
        background,
      });
    }
    reader.readAsDataURL(file);
  }

  const renderThumbnailSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();

    return (
      <Styled.VirtualBackgroundRowThumbnail>
        <Styled.BgWrapper
          role="group"
          aria-label={intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
          isVisualEffects={isVisualEffects}
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
              isVisualEffects={isVisualEffects}
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
              isVisualEffects={isVisualEffects}
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
              <React.Fragment key={`${imageName}-${index}`}>
                <Styled.ThumbnailButton
                  style={{ backgroundImage: `url('${getVirtualBackgroundThumbnail(imageName)}')` }}
                  id={`${imageName}-${index}`}
                  label={label}
                  tabIndex={disabled ? -1 : 0}
                  role="button"
                  aria-label={label}
                  aria-describedby={`vr-cam-btn-${index}`}
                  aria-pressed={currentVirtualBg?.name?.includes(imageName.split('.').shift())}
                  hideLabel
                  ref={ref => inputElementsRef.current[index + 1] = ref}
                  onClick={() => {
                    const node = findDOMNode(inputElementsRef.current[index + 1]);
                    node.focus();
                    node.click();
                    _virtualBgSelected(EFFECT_TYPES.IMAGE_TYPE, imageName, index + 1);
                  }}
                  disabled={disabled}
                  isVisualEffects={isVisualEffects}
                />
                <div aria-hidden className="sr-only" id={`vr-cam-btn-${index}`}>
                  {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: label })}
                </div>
              </React.Fragment>
            )
          })}

          {isVisualEffects && customBackgrounds
            .concat(newCustomBackgrounds)
            .map(({ filename, data, uniqueId }, index) => {
              const imageIndex = index + IMAGE_NAMES.length + 2;
              const label = `Background ${imageIndex}`;

              return (
                <Styled.ThumbnailButtonWrapper key={`${filename}-${index}`}>
                  <Styled.ThumbnailButton
                    style={{ backgroundImage: `url(${data})` }}
                    id={`${filename}-${imageIndex}`}
                    label={label}
                    tabIndex={disabled ? -1 : 0}
                    role="button"
                    aria-label={label}
                    aria-describedby={`vr-cam-btn-${imageIndex}`}
                    aria-pressed={currentVirtualBg?.name?.includes(filename)}
                    hideLabel
                    ref={ref => inputElementsRef.current[index + IMAGE_NAMES.length + 1] = ref}
                    onClick={() => {
                      const node = findDOMNode(inputElementsRef.current[index + IMAGE_NAMES.length + 1]);
                      node.focus();
                      node.click();
                      _virtualBgSelected(
                        EFFECT_TYPES.IMAGE_TYPE,
                        filename,
                        imageIndex - 1,
                        { file: data },
                      );
                    }}
                    disabled={disabled}
                    isVisualEffects={isVisualEffects}
                  />
                  <Styled.ButtonWrapper>
                    <Styled.ButtonRemove
                      label={intl.formatMessage(intlMessages.removeLabel)}
                      aria-label={intl.formatMessage(intlMessages.removeLabel)}
                      data-test="removeCustomBackground"
                      icon="close"
                      size="sm"
                      color="dark"
                      circle
                      hideLabel
                      onClick={() => {
                        dispatch({
                          type: 'delete',
                          uniqueId,
                        });
                      }}
                    />
                  </Styled.ButtonWrapper>
                  <div aria-hidden className="sr-only" id={`vr-cam-btn-${imageIndex}`}>
                    {label}
                  </div>
                </Styled.ThumbnailButtonWrapper>
              );
            })}

          {isVisualEffects && (
            <>
              <Styled.BgCustomButton
                icon='plus'
                label={intl.formatMessage(intlMessages.customLabel)}
                aria-describedby={`vr-cam-btn-custom`}
                hideLabel
                tabIndex={disabled ? -1 : 0}
                disabled={disabled}
                onClick={() => {
                  if (customBgSelectorRef.current) {
                    customBgSelectorRef.current.click();
                  }
                }}
                isVisualEffects={isVisualEffects}
              />
              <input
                ref={customBgSelectorRef}
                type="file"
                id="customBgSelector"
                onChange={handleCustomBgChange}
                style={{ display: 'none' }}
              />
              <div aria-hidden className="sr-only" id={`vr-cam-btn-custom`}>
                {intl.formatMessage(intlMessages.customLabel)}
              </div>
            </>
          )}
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
      {!isVisualEffects && (
        <Styled.Label>
          {!isVirtualBackgroundSupported()
            ? intl.formatMessage(intlMessages.virtualBackgroundSettingsDisabledLabel)
            : intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
        </Styled.Label>
      )}

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