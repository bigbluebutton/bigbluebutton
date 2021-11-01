import React from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import Toggle from '/imports/ui/components/switch/component';
import LocalesDropdown from '/imports/ui/components/locales-dropdown/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';
import VideoService from '/imports/ui/components/video-provider/service';
import { ACTIONS, LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

const MIN_FONTSIZE = 0;
const SHOW_AUDIO_FILTERS = (Meteor.settings.public.app
  .showAudioFilters === undefined)
  ? true
  : Meteor.settings.public.app.showAudioFilters;

const intlMessages = defineMessages({
  applicationSectionTitle: {
    id: 'app.submenu.application.applicationSectionTitle',
    description: 'Application section title',
  },
  animationsLabel: {
    id: 'app.submenu.application.animationsLabel',
    description: 'animations label',
  },
  audioFilterLabel: {
    id: 'app.submenu.application.audioFilterLabel',
    description: 'audio filters label',
  },
  fontSizeControlLabel: {
    id: 'app.submenu.application.fontSizeControlLabel',
    description: 'label for font size ontrol',
  },
  increaseFontBtnLabel: {
    id: 'app.submenu.application.increaseFontBtnLabel',
    description: 'label for button to increase font size',
  },
  increaseFontBtnDesc: {
    id: 'app.submenu.application.increaseFontBtnDesc',
    description: 'adds descriptive context to increase font size button',
  },
  decreaseFontBtnLabel: {
    id: 'app.submenu.application.decreaseFontBtnLabel',
    description: 'label for button to reduce font size',
  },
  decreaseFontBtnDesc: {
    id: 'app.submenu.application.decreaseFontBtnDesc',
    description: 'adds descriptive context to decrease font size button',
  },
  languageLabel: {
    id: 'app.submenu.application.languageLabel',
    description: 'displayed label for changing application locale',
  },
  currentValue: {
    id: 'app.submenu.application.currentSize',
    description: 'current value label',
  },
  languageOptionLabel: {
    id: 'app.submenu.application.languageOptionLabel',
    description: 'default change language option when locales are available',
  },
  noLocaleOptionLabel: {
    id: 'app.submenu.application.noLocaleOptionLabel',
    description: 'default change language option when no locales available',
  },
  paginationEnabledLabel: {
    id: 'app.submenu.application.paginationEnabledLabel',
    description: 'enable/disable video pagination',
  },
  layoutOptionLabel: {
    id: 'app.submenu.application.layoutOptionLabel',
    description: 'layout options',
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
  presentationFocusPushLayout: {
    id: 'app.layout.style.presentationFocusPush',
    description: 'label for presentationFocus layout style (push to all)',
  },
  videoFocusPushLayout: {
    id: 'app.layout.style.videoFocusPush',
    description: 'label for videoFocus layout style (push to all)',
  },
  smartPushLayout: {
    id: 'app.layout.style.smartPush',
    description: 'label for smart layout style (push to all)',
  },
  customPushLayout: {
    id: 'app.layout.style.customPush',
    description: 'label for custom layout style (push to all)',
  },
});

class ApplicationMenu extends BaseMenu {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }

  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'application',
      settings: props.settings,
      isLargestFontSize: false,
      isSmallestFontSize: false,
      showSelect: false,
      fontSizes: [
        '12px',
        '14px',
        '16px',
        '18px',
        '20px',
      ],
      audioFilterEnabled: ApplicationMenu.isAudioFilterEnabled(props
        .settings.microphoneConstraints),
    };
  }

  componentDidMount() {
    this.setInitialFontSize();
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = () => {};
  }

  setInitialFontSize() {
    const { fontSizes } = this.state;
    const clientFont = document.getElementsByTagName('html')[0].style.fontSize;
    const hasFont = fontSizes.includes(clientFont);
    if (!hasFont) {
      fontSizes.push(clientFont);
      fontSizes.sort();
    }
    const fontIndex = fontSizes.indexOf(clientFont);
    this.changeFontSize(clientFont);
    this.setState({
      isSmallestFontSize: fontIndex <= MIN_FONTSIZE,
      isLargestFontSize: fontIndex >= (fontSizes.length - 1),
      fontSizes,
    });
  }

  static isAudioFilterEnabled(_constraints) {
    if (typeof _constraints === 'undefined') return true;

    const _isConstraintEnabled = (constraintValue) => {
      switch (typeof constraintValue) {
        case 'boolean':
          return constraintValue;
        case 'string':
          return constraintValue === 'true';
        case 'object':
          return !!(constraintValue.exact || constraintValue.ideal);
        default:
          return false;
      }
    };

    let isAnyFilterEnabled = true;

    const constraints = _constraints && (typeof _constraints.advanced === 'object')
      ? _constraints.advanced
      : _constraints || {};

    isAnyFilterEnabled = Object.values(constraints).find(
      (constraintValue) => _isConstraintEnabled(constraintValue),
    );

    return isAnyFilterEnabled;
  }

  handleAudioFilterChange() {
    const _audioFilterEnabled = !ApplicationMenu.isAudioFilterEnabled(this
      .state.settings.microphoneConstraints);
    const _newConstraints = {
      autoGainControl: _audioFilterEnabled,
      echoCancellation: _audioFilterEnabled,
      noiseSuppression: _audioFilterEnabled,
    };

    const obj = this.state;
    obj.settings.microphoneConstraints = _newConstraints;
    this.handleUpdateSettings(this.state.settings, obj.settings);
  }

  handleUpdateFontSize(size) {
    const obj = this.state;
    obj.settings.fontSize = size;
    this.handleUpdateSettings(this.state.settingsName, obj.settings);
  }

  changeFontSize(size) {
    const { layoutContextDispatch } = this.props;
    const obj = this.state;
    obj.settings.fontSize = size;
    this.setState(obj, () => {
      ApplicationMenu.setHtmlFontSize(this.state.settings.fontSize);
      this.handleUpdateFontSize(this.state.settings.fontSize);
    });

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(size.slice(0, -2), 10),
    });
  }

  handleIncreaseFontSize() {
    const currentFontSize = this.state.settings.fontSize;
    const availableFontSizes = this.state.fontSizes;
    const maxFontSize = availableFontSizes.length - 1;
    const canIncreaseFontSize = availableFontSizes.indexOf(currentFontSize) < maxFontSize;
    const fs = canIncreaseFontSize ? availableFontSizes.indexOf(currentFontSize) + 1 : maxFontSize;
    this.changeFontSize(availableFontSizes[fs]);
    if (fs === maxFontSize) this.setState({ isLargestFontSize: true });
    this.setState({ isSmallestFontSize: false });
  }

  handleDecreaseFontSize() {
    const currentFontSize = this.state.settings.fontSize;
    const availableFontSizes = this.state.fontSizes;
    const canDecreaseFontSize = availableFontSizes.indexOf(currentFontSize) > MIN_FONTSIZE;
    const fs = canDecreaseFontSize ? availableFontSizes.indexOf(currentFontSize) - 1 : MIN_FONTSIZE;
    this.changeFontSize(availableFontSizes[fs]);
    if (fs === MIN_FONTSIZE) this.setState({ isSmallestFontSize: true });
    this.setState({ isLargestFontSize: false });
  }

  handleSelectChange(fieldname, e) {
    const obj = this.state;
    obj.settings[fieldname] = e.target.value;
    this.handleUpdateSettings('application', obj.settings);
  }

  renderAudioFilters() {
    let audioFilterOption = null;

    if (SHOW_AUDIO_FILTERS) {
      const { intl, showToggleLabel, displaySettingsStatus } = this.props;
      const { settings } = this.state;
      const audioFilterStatus = ApplicationMenu
        .isAudioFilterEnabled(settings.microphoneConstraints);

      audioFilterOption = (
        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <div className={styles.formElement}>
              <span className={styles.label}>
                {intl.formatMessage(intlMessages.audioFilterLabel)}
              </span>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
              {displaySettingsStatus(audioFilterStatus)}
              <Toggle
                icons={false}
                defaultChecked={this.state.audioFilterEnabled}
                onChange={() => this.handleAudioFilterChange()}
                ariaLabel={intl.formatMessage(intlMessages.audioFilterLabel)}
                showToggleLabel={showToggleLabel}
              />
            </div>
          </div>
        </div>
      );
    }

    return audioFilterOption;
  }

  renderPaginationToggle() {
    // See VideoService's method for an explanation
    if (!VideoService.shouldRenderPaginationToggle()) return false;

    const { intl, showToggleLabel, displaySettingsStatus } = this.props;
    const { settings } = this.state;

    return (
      <div className={styles.row}>
        <div className={styles.col} aria-hidden="true">
          <div className={styles.formElement}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className={styles.label}>
              {intl.formatMessage(intlMessages.paginationEnabledLabel)}
            </label>
          </div>
        </div>
        <div className={styles.col}>
          <div className={cx(styles.formElement, styles.pullContentRight)}>
            {displaySettingsStatus(settings.paginationEnabled)}
            <Toggle
              icons={false}
              defaultChecked={settings.paginationEnabled}
              onChange={() => this.handleToggle('paginationEnabled')}
              ariaLabel={intl.formatMessage(intlMessages.paginationEnabledLabel)}
              showToggleLabel={showToggleLabel}
            />
          </div>
        </div>
      </div>
    );
  }

  renderChangeLayout() {
    const { intl, isModerator } = this.props;
    const { settings } = this.state;

    if (isModerator) {
      const pushLayouts = {
        CUSTOM_PUSH: 'customPush',
        SMART_PUSH: 'smartPush',
        PRESENTATION_FOCUS_PUSH: 'presentationFocusPush',
        VIDEO_FOCUS_PUSH: 'videoFocusPush',
      };
      Object.assign(LAYOUT_TYPE, pushLayouts);
    }

    return (
      <>
        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formElement}>
              <label htmlFor="layoutList" className={styles.label}>
                {intl.formatMessage(intlMessages.layoutOptionLabel)}
              </label>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
              <select
                className={styles.select}
                onChange={(e) => this.handleSelectChange('selectedLayout', e)}
                id="layoutList"
                value={settings.selectedLayout}
              >
                {
                  Object.values(LAYOUT_TYPE)
                    .map((layout) => <option key={layout} value={layout}>{intl.formatMessage(intlMessages[`${layout}Layout`])}</option>)
                }
              </select>
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    const {
      allLocales, intl, showToggleLabel, displaySettingsStatus,
    } = this.props;
    const {
      isLargestFontSize, isSmallestFontSize, settings,
    } = this.state;

    // conversions can be found at http://pxtoem.com
    const pixelPercentage = {
      '12px': '75%',
      // 14px is actually 87.5%, rounding up to show more friendly value
      '14px': '90%',
      '16px': '100%',
      // 18px is actually 112.5%, rounding down to show more friendly value
      '18px': '110%',
      '20px': '125%',
    };

    const ariaValueLabel = intl.formatMessage(intlMessages.currentValue, { 0: `${pixelPercentage[settings.fontSize]}` });

    const showSelect = allLocales && allLocales.length > 0;

    return (
      <div>
        <div>
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.applicationSectionTitle)}
          </h3>
        </div>
        <div className={styles.form}>

          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.animationsLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                {displaySettingsStatus(settings.animations)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.animations}
                  onChange={() => this.handleToggle('animations')}
                  ariaLabel={intl.formatMessage(intlMessages.animationsLabel)}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div>

          {this.renderAudioFilters()}
          {this.renderPaginationToggle()}

          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label
                  className={styles.label}
                  htmlFor="langSelector"
                  aria-label={intl.formatMessage(intlMessages.languageLabel)}
                >
                  {intl.formatMessage(intlMessages.languageLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <span className={cx(styles.formElement, styles.pullContentRight)}>
                {showSelect ? (
                  <LocalesDropdown
                    allLocales={allLocales}
                    handleChange={(e) => this.handleSelectChange('locale', e)}
                    value={settings.locale}
                    elementId="langSelector"
                    elementClass={styles.select}
                    selectMessage={intl.formatMessage(intlMessages.languageOptionLabel)}
                  />
                ) : (
                  <div className={styles.spinnerOverlay}>
                    <div className={styles.bounce1} />
                    <div className={styles.bounce2} />
                    <div />
                  </div>
                )}
              </span>
            </div>
          </div>

          <hr className={styles.separator} />
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.fontSizeControlLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div aria-hidden className={cx(styles.formElement, styles.pullContentCenter)}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={cx(styles.label, styles.bold)}>
                  {`${pixelPercentage[settings.fontSize]}`}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <div className={styles.pullContentRight}>
                  <div className={styles.col}>
                    <Button
                      onClick={() => this.handleDecreaseFontSize()}
                      color="primary"
                      icon="substract"
                      circle
                      hideLabel
                      label={intl.formatMessage(intlMessages.decreaseFontBtnLabel)}
                      aria-label={`${intl.formatMessage(intlMessages.decreaseFontBtnLabel)}, ${ariaValueLabel}`}
                      disabled={isSmallestFontSize}
                    />
                  </div>
                  <div className={styles.col}>
                    <Button
                      onClick={() => this.handleIncreaseFontSize()}
                      color="primary"
                      icon="add"
                      circle
                      hideLabel
                      label={intl.formatMessage(intlMessages.increaseFontBtnLabel)}
                      aria-label={`${intl.formatMessage(intlMessages.increaseFontBtnLabel)}, ${ariaValueLabel}`}
                      disabled={isLargestFontSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.renderChangeLayout()}
        </div>
      </div>
    );
  }
}

export default injectIntl(ApplicationMenu);
