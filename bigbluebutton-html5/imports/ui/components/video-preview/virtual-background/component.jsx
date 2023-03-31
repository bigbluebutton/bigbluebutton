import React, { useState, useRef, useContext, useEffect } from 'react';
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
import { CustomVirtualBackgroundsContext } from './context';
import VirtualBgService from '/imports/ui/components/video-preview/virtual-background/service';
import logger from '/imports/startup/client/logger';
import withFileReader from '/imports/ui/components/common/file-reader/component';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Settings from '/imports/ui/services/settings';
import { isCustomVirtualBackgroundsEnabled } from '/imports/ui/services/features';

const { MIME_TYPES_ALLOWED, MAX_FILE_SIZE } = VirtualBgService;
const ENABLE_CAMERA_BRIGHTNESS = Meteor.settings.public.app.enableCameraBrightness;

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
  customDesc: {
    id: 'app.video.virtualBackground.button.customDesc',
    description: 'Aria description for upload virtual background button',
  },
  background: {
    id: 'app.video.virtualBackground.background',
    description: 'Label for the background word',
  },
  backgroundWithIndex: {
    id: 'app.video.virtualBackground.backgroundWithIndex',
    description: 'Label for the background word indexed',
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

const SKELETON_COUNT = 5;
const VIRTUAL_BACKGROUNDS_CONFIG = Meteor.settings.public.virtualBackgrounds;
const ENABLE_UPLOAD = VIRTUAL_BACKGROUNDS_CONFIG.enableVirtualBackgroundUpload;
const shouldEnableBackgroundUpload = () => ENABLE_UPLOAD && isCustomVirtualBackgroundsEnabled();

const VirtualBgSelector = ({
  intl,
  handleVirtualBgSelected,
  locked,
  showThumbnails,
  initialVirtualBgState,
  isVisualEffects,
  readFile,
}) => {
  const [currentVirtualBg, setCurrentVirtualBg] = useState({
    ...initialVirtualBgState,
  });

  const inputElementsRef = useRef([]);
  const customBgSelectorRef = useRef(null);

  const {
    dispatch,
    loaded,
    defaultSetUp,
    backgrounds,
    loadFromDB,
  } = useContext(CustomVirtualBackgroundsContext);

  const { MIME_TYPES_ALLOWED } = VirtualBgService;

  useEffect(() => {
    if (shouldEnableBackgroundUpload()) {
      if (!defaultSetUp) {
        const defaultBackgrounds = ['Blur', ...IMAGE_NAMES].map((imageName) => ({
          uniqueId: imageName,
          custom: false,
          lastActivityDate: Date.now(),
        }));
        dispatch({
          type: 'setDefault',
          backgrounds: defaultBackgrounds,
        });
      }
      if (!loaded) loadFromDB();
    }
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

        setCurrentVirtualBg({ type, name });

        if (!index || index < 0) return;

        if (!shouldEnableBackgroundUpload()) {
          findDOMNode(inputElementsRef.current[index]).focus();
        } else {
          if (customParams) {
            dispatch({
              type: 'update',
              background: {
                filename: name,
                uniqueId: customParams.uniqueId,
                data: customParams.file,
                custom: true,
                lastActivityDate: Date.now(),
              },
            });
          } else {
            dispatch({
              type: 'update',
              background: {
                uniqueId: name,
                custom: false,
                lastActivityDate: Date.now(),
              },
            });
          }
          findDOMNode(inputElementsRef.current[0]).focus();
        }
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

  const handleCustomBgChange = (event) => {
    const file = event.target.files[0];

    const onSuccess = (background) => {
      dispatch({
        type: 'new',
        background: {
          ...background,
          custom: true,
          lastActivityDate: Date.now(),
        },
      });
      const { filename, data, uniqueId } = background;
      _virtualBgSelected(
        EFFECT_TYPES.IMAGE_TYPE,
        filename,
        0,
        { file: data, uniqueId },
      );
    };

    const onError = (error) => {
      logger.warn({
        logCode: 'read_file_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, error.message);
    };

    readFile(file, onSuccess, onError);
  };

  const renderThumbnailSelector = () => {
    const disabled = locked || !isVirtualBackgroundSupported();
    const isRTL = Settings.application.isRTL;

    const renderBlurButton = (index) => {
      return (
        <Styled.ThumbnailButtonWrapper
          key={`blur-${index}`}
          isVisualEffects={isVisualEffects}
        >
          <Styled.ThumbnailButton
            background={getVirtualBackgroundThumbnail(BLUR_FILENAME)}
            aria-label={intl.formatMessage(intlMessages.blurLabel)}
            label={intl.formatMessage(intlMessages.blurLabel)}
            aria-describedby={`vr-cam-btn-blur`}
            tabIndex={disabled ? -1 : 0}
            hideLabel
            aria-pressed={currentVirtualBg?.name?.includes('blur') || currentVirtualBg?.name?.includes('Blur')}
            disabled={disabled}
            ref={ref => { inputElementsRef.current[index] = ref; }}
            onClick={() => _virtualBgSelected(EFFECT_TYPES.BLUR_TYPE, 'Blur', index)}
            isVisualEffects={isVisualEffects}
          />
          <div aria-hidden className="sr-only" id={`vr-cam-btn-blur`}>
            {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.BLUR_TYPE })}
          </div>
        </Styled.ThumbnailButtonWrapper>
      );
    };

    const renderDefaultButton = (imageName, index) => {
      const label = intl.formatMessage(intlMessages[imageName.split('.').shift()], {
        index: index + 1,
        background: intl.formatMessage(intlMessages.background),
      });

      return (
        <Styled.ThumbnailButtonWrapper
          key={`${imageName}-${index + 1}`}
          isVisualEffects={isVisualEffects}
        >
          <Styled.ThumbnailButton
            id={`${imageName}-${index + 1}`}
            label={label}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={label}
            aria-describedby={`vr-cam-btn-${index + 1}`}
            aria-pressed={currentVirtualBg?.name?.includes(imageName.split('.').shift())}
            hideLabel
            ref={ref => inputElementsRef.current[index] = ref}
            onClick={() => _virtualBgSelected(EFFECT_TYPES.IMAGE_TYPE, imageName, index)}
            disabled={disabled}
            isVisualEffects={isVisualEffects}
            background={getVirtualBackgroundThumbnail(imageName)}
            data-test="selectDefaultBackground"
          />
          <div aria-hidden className="sr-only" id={`vr-cam-btn-${index + 1}`}>
            {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: label })}
          </div>
        </Styled.ThumbnailButtonWrapper>
      )
    };

    const renderCustomButton = (background, index) => {
      const { filename, data, uniqueId } = background;
      const label = intl.formatMessage(intlMessages.backgroundWithIndex, {
        0: index + 1,
      });

      return (
        <Styled.ThumbnailButtonWrapper
          key={`${filename}-${index + 1}`}
          isVisualEffects={isVisualEffects}
        >
          <Styled.ThumbnailButton
            id={`${filename}-${index + 1}`}
            label={label}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={label}
            aria-describedby={`vr-cam-btn-${index + 1}`}
            aria-pressed={currentVirtualBg?.name?.includes(filename)}
            hideLabel
            ref={ref => inputElementsRef.current[index] = ref}
            onClick={() => _virtualBgSelected(
              EFFECT_TYPES.IMAGE_TYPE,
              filename,
              index,
              { file: data, uniqueId },
            )}
            disabled={disabled}
            isVisualEffects={isVisualEffects}
            background={data}
            data-test="selectCustomBackground"
          />
          <Styled.ButtonWrapper>
            <Styled.ButtonRemove
              disabled={disabled}
              label={intl.formatMessage(intlMessages.removeLabel)}
              aria-label={intl.formatMessage(intlMessages.removeLabel)}
              aria-describedby={`vr-cam-btn-${index + 1}`}
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
                _virtualBgSelected(EFFECT_TYPES.NONE_TYPE);
              }}
            />
          </Styled.ButtonWrapper>
          <div aria-hidden className="sr-only" id={`vr-cam-btn-${index + 1}`}>
            {label}
          </div>
        </Styled.ThumbnailButtonWrapper>
      );
    };

    const renderInputButton = () => (
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
          data-test="inputBackgroundButton"
        />
        <input
          ref={customBgSelectorRef}
          type="file"
          id="customBgSelector"
          onChange={handleCustomBgChange}
          style={{ display: 'none' }}
          accept={MIME_TYPES_ALLOWED.join(', ')}
        />
        <div aria-hidden className="sr-only" id={`vr-cam-btn-custom`}>
          {intl.formatMessage(intlMessages.customDesc)}
        </div>
      </>
    );

    const renderNoneButton = () => (
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
          data-test="noneBackgroundButton"
        />
        <div aria-hidden className="sr-only" id={`vr-cam-btn-none`}>
          {intl.formatMessage(intlMessages.camBgAriaDesc, { 0: EFFECT_TYPES.NONE_TYPE })}
        </div>
      </>
    );

    const renderSkeleton = () => (
      <SkeletonTheme baseColor="#DCE4EC" direction={isRTL ? 'rtl' : 'ltr'}>
        {new Array(SKELETON_COUNT).fill(null).map((_, index) => (
          <Styled.SkeletonWrapper key={`skeleton-${index}`}>
            <Skeleton />
          </Styled.SkeletonWrapper>
        ))}
      </SkeletonTheme>
    );

    const ready = loaded && defaultSetUp;

    return (
      <Styled.VirtualBackgroundRowThumbnail>
        <Styled.BgWrapper
          role="group"
          aria-label={intl.formatMessage(intlMessages.virtualBackgroundSettingsLabel)}
          isVisualEffects={isVisualEffects}
          brightnessEnabled={ENABLE_CAMERA_BRIGHTNESS}
          data-test="virtualBackground"
        >
          {shouldEnableBackgroundUpload() && (
            <>
              {!ready && renderSkeleton()}

              {ready && (
                <>
                  {renderNoneButton()}

                  {Object.values(backgrounds)
                    .sort((a, b) => b.lastActivityDate - a.lastActivityDate)
                    .map((background, index) => {
                      if (background.custom !== false) {
                        return renderCustomButton(background, index);
                      } else {
                        const isBlur = background.uniqueId.includes('Blur');
                        return isBlur ? renderBlurButton(index) : renderDefaultButton(background.uniqueId, index);
                      }
                    })}

                  {renderInputButton()}
                </>
              )}
            </>
          )}

          {!shouldEnableBackgroundUpload() && (
            <>
              {renderNoneButton()}

              {renderBlurButton(0)}

              {IMAGE_NAMES.map((imageName, index) => {
                const actualIndex = index + 1;
                return renderDefaultButton(imageName, actualIndex);
              })}
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

export default injectIntl(withFileReader(VirtualBgSelector, MIME_TYPES_ALLOWED, MAX_FILE_SIZE));
