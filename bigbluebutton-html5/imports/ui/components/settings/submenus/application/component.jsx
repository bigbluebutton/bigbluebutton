import React from 'react';
import Button from '/imports/ui/components/common/button/component';
import SubMenusStyle from '../styles';
import LocalesDropdown from '/imports/ui/components/common/locales-dropdown/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';
import WakeLockService from '/imports/ui/components/wake-lock/service';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const MIN_FONTSIZE = 0;

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
  darkThemeLabel: {
    id: 'app.submenu.application.darkThemeLabel',
    description: 'dark mode label',
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
  exampleTextLabel: {
    id: 'app.submenu.application.exampleTextLabel',
    description: 'an example sentence to see the font size',
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
  wbToolbarsAutoHideLabel: {
    id: 'app.submenu.application.wbToolbarsAutoHideLabel',
    description: 'enable/disable auto hiding of whitebord toolbars',
  },
  wakeLockEnabledLabel: {
    id: 'app.submenu.application.wakeLockEnabledLabel',
    description: 'enable/disable wake lock',
  },
  layoutOptionLabel: {
    id: 'app.submenu.application.layoutOptionLabel',
    description: 'layout options',
  },
  pushLayoutLabel: {
    id: 'app.submenu.application.pushLayoutLabel',
    description: 'push layout togle',
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
  disableLabel: {
    id: 'app.videoDock.webcamDisableLabelAllCams',
  },
  autoCloseReactionsBarLabel: {
    id: 'app.actionsBar.reactions.autoCloseReactionsBarLabel',
  },
  pushToTalkLabel: {
    id: 'app.submenu.application.pushToTalkLabel',
    description: 'enable/disable audio push-to-talk',
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
    this.setState = () => { };
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

    const SHOW_AUDIO_FILTERS = (window.meetingClientSettings.public.app
      .showAudioFilters === undefined)
      ? true
      : window.meetingClientSettings.public.app.showAudioFilters;

    if (SHOW_AUDIO_FILTERS) {
      const { intl, displaySettingsStatus } = this.props;
      const { settings } = this.state;
      const audioFilterStatus = ApplicationMenu
        .isAudioFilterEnabled(settings.microphoneConstraints);

      audioFilterOption = (
        <Styled.Row>
          <Styled.Col>
            <Styled.FormElementRight>
              <SubMenusStyle.MaterialSwitch
                icons="false"
                checked={this.state.audioFilterEnabled}
                onChange={() => this.handleAudioFilterChange()}
                aria-label={`${intl.formatMessage(intlMessages.audioFilterLabel)} - ${displaySettingsStatus(audioFilterStatus, true)}`}
                data-test="audioFilterToggleBtn"
              />
              <Styled.Label style={{ marginLeft: '0.5rem' }}>
                {intl.formatMessage(intlMessages.audioFilterLabel)}
              </Styled.Label>
            </Styled.FormElementRight>
          </Styled.Col>
        </Styled.Row>
      );
    }

    return audioFilterOption;
  }

  renderPaginationToggle() {
    const { paginationToggleEnabled } = this.props;

    if (!paginationToggleEnabled) return false;

    const { intl, displaySettingsStatus } = this.props;
    const { settings } = this.state;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElementRight>
            <SubMenusStyle.MaterialSwitch
              icons="false"
              checked={settings.paginationEnabled}
              onChange={() => this.handleToggle('paginationEnabled')}
              aria-label={`${intl.formatMessage(intlMessages.paginationEnabledLabel)} - ${displaySettingsStatus(settings.paginationEnabled, true)}`}
              data-test="paginationToggleBtn"
            />
            <Styled.Label style={{ marginLeft: '0.5rem' }}>
              {intl.formatMessage(intlMessages.paginationEnabledLabel)}
            </Styled.Label>
          </Styled.FormElementRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  renderDarkThemeToggle() {
    const { intl, displaySettingsStatus } = this.props;
    const { settings } = this.state;

    const isDarkThemeEnabled = window.meetingClientSettings.public.app.darkTheme.enabled;
    if (!isDarkThemeEnabled) return null;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElementRight>
            <SubMenusStyle.MaterialSwitch
              icons="false"
              checked={settings.darkTheme}
              onChange={() => this.handleToggle('darkTheme')}
              aria-label={`${intl.formatMessage(intlMessages.darkThemeLabel)} - ${displaySettingsStatus(settings.darkTheme, true)}`}
              data-test="darkModeToggleBtn"
            />
            <Styled.Label style={{ marginLeft: '0.5rem' }}>
              {intl.formatMessage(intlMessages.darkThemeLabel)}
            </Styled.Label>
          </Styled.FormElementRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  renderWakeLockToggle() {
    if (!WakeLockService.isSupported()) return null;

    const { intl } = this.props;
    const { settings } = this.state;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElementRight>
            <SubMenusStyle.MaterialSwitch
              icons="false"
              checked={settings.wakeLock}
              onChange={() => this.handleToggle('wakeLock')}
              aria-label={intl.formatMessage(intlMessages.wakeLockEnabledLabel)}
              data-test="wakeLockToggleBtn"
            />
            <Styled.Label style={{ marginLeft: '0.5rem' }}>
              {intl.formatMessage(intlMessages.wakeLockEnabledLabel)}
            </Styled.Label>
          </Styled.FormElementRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  renderLanguageSelector() {
    const { allLocales, intl } = this.props;
    const { settings } = this.state;

    const showSelect = allLocales && allLocales.length > 0;
    const Settings = getSettingsSingletonInstance();
    const animations = Settings?.application?.animations;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElementRight>
            {showSelect ? (
              <Styled.LocalesDropdownSelect>
                <LocalesDropdown
                  allLocales={allLocales}
                  handleChange={(e) => this.handleSelectChange('locale', e)}
                  value={settings.locale}
                  elementId="langSelector"
                  ariaLabel={intl.formatMessage(intlMessages.languageLabel)}
                  selectMessage={intl.formatMessage(intlMessages.languageOptionLabel)}
                />
              </Styled.LocalesDropdownSelect>
            ) : (
              <Styled.SpinnerOverlay animations={animations}>
                <Styled.Bounce1 animations={animations} />
                <Styled.Bounce2 animations={animations} />
                <div />
              </Styled.SpinnerOverlay>
            )}
          </Styled.FormElementRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  renderFontSizeControl() {
    const { intl } = this.props;
    const { isLargestFontSize, isSmallestFontSize, settings } = this.state;

    const pixelPercentage = {
      '12px': '75%',
      // 14px is actually 87.5%, rounding up to show more friendly value
      '14px': '90%',
      '16px': '100%',
      // 18px is actually 112.5%, rounding down to show more friendly value
      '18px': '110%',
      '20px': '125%',
    };

    const ariaValueLabel = intl.formatMessage(intlMessages.currentValue, {
      0: `${pixelPercentage[settings.fontSize]}`,
    });

    return (
      <Styled.Row style={{ alignItems: 'center' }}>
        <Styled.Col style={{ justifyContent: 'flex-start' }}>
          <Styled.ExampleText style={{ fontSize: settings.fontSize }}>
            {intl.formatMessage(intlMessages.exampleTextLabel)}
          </Styled.ExampleText>
        </Styled.Col>

        <Styled.Col style={{ justifyContent: 'flex-end' }}>
          <Styled.PullContentRight>
            <Styled.Col>
              <Button
                onClick={(e) => {
                  e.currentTarget.blur();
                  this.handleDecreaseFontSize();
                }}
                size="lg"
                icon="text_decrease"
                hideLabel
                label={intl.formatMessage(intlMessages.decreaseFontBtnLabel)}
                aria-label={`${intl.formatMessage(intlMessages.decreaseFontBtnLabel)}, ${ariaValueLabel}`}
                disabled={isSmallestFontSize}
                data-test="decreaseFontSize"
              />
            </Styled.Col>
            <Styled.Col>
              <Styled.BoldLabel>
                {`${pixelPercentage[settings.fontSize]}`}
              </Styled.BoldLabel>
            </Styled.Col>
            <Styled.Col>
              <Button
                onClick={(e) => {
                  e.currentTarget.blur();
                  this.handleIncreaseFontSize();
                }}
                size="lg"
                icon="text_increase"
                hideLabel
                label={intl.formatMessage(intlMessages.increaseFontBtnLabel)}
                aria-label={`${intl.formatMessage(intlMessages.increaseFontBtnLabel)}, ${ariaValueLabel}`}
                disabled={isLargestFontSize}
                data-test="increaseFontSize"
              />
            </Styled.Col>
          </Styled.PullContentRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  renderPushToTalkToggle() {
    const { intl, displaySettingsStatus } = this.props;
    const { settings } = this.state;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElementRight>
            <SubMenusStyle.MaterialSwitch
              icons="false"
              checked={settings.pushToTalkEnabled}
              onChange={() => this.handleToggle('pushToTalkEnabled')}
              aria-label={`${intl.formatMessage(intlMessages.pushToTalkLabel)} - ${displaySettingsStatus(settings.pushToTalkEnabled, true)}`}
              data-test="pushToTalkToggleBtn"
            />
            <Styled.Label style={{ marginLeft: '0.5rem' }}>
              {intl.formatMessage(intlMessages.pushToTalkLabel)}
            </Styled.Label>
          </Styled.FormElementRight>
        </Styled.Col>
      </Styled.Row>
    );
  }

  render() {
    const {
      intl,
      displaySettingsStatus,
      isReactionsEnabled,
    } = this.props;

    const { settings } = this.state;

    return (
      <div>
        <Styled.AplicationContainer>
          <Styled.ApplicationTitle>
            {intl.formatMessage(intlMessages.applicationSectionTitle)}
          </Styled.ApplicationTitle>
          <Styled.Form>
            <Styled.Row>
              <Styled.Col>
                <Styled.FormElementRight>
                  <SubMenusStyle.MaterialSwitch
                    icons="false"
                    checked={settings.animations}
                    onChange={() => this.handleToggle('animations')}
                    aria-label={`${intl.formatMessage(intlMessages.animationsLabel)} - ${displaySettingsStatus(settings.animations, true)}`}
                    data-test="animationsToggleBtn"
                  />
                  <Styled.Label style={{ marginLeft: '0.5rem' }}>
                    {intl.formatMessage(intlMessages.animationsLabel)}
                  </Styled.Label>
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>

            {this.renderAudioFilters()}
            {this.renderPushToTalkToggle()}
            {this.renderPaginationToggle()}
            {this.renderDarkThemeToggle()}
            {this.renderWakeLockToggle()}

            <Styled.Row>
              <Styled.Col>
                <Styled.FormElementRight>
                  <SubMenusStyle.MaterialSwitch
                    icons="false"
                    checked={settings.whiteboardToolbarAutoHide}
                    onChange={() => this.handleToggle('whiteboardToolbarAutoHide')}
                    aria-label={`${intl.formatMessage(intlMessages.wbToolbarsAutoHideLabel)} - ${displaySettingsStatus(settings.whiteboardToolbarAutoHide, true)}`}
                    data-test="whiteboardToolbarAutoHideToggleBtn"
                  />
                  <Styled.Label style={{ marginLeft: '0.5rem' }}>
                    {intl.formatMessage(intlMessages.wbToolbarsAutoHideLabel)}
                  </Styled.Label>
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>

            <Styled.Row>
              <Styled.Col>
                <Styled.FormElementRight>
                  <SubMenusStyle.MaterialSwitch
                    icons="false"
                    checked={settings.selfViewDisable}
                    onChange={() => this.handleToggle('selfViewDisable')}
                    aria-label={`${intl.formatMessage(intlMessages.disableLabel)} - ${displaySettingsStatus(settings.selfViewDisable, false)}`}
                    data-test="selfViewDisableToggleBtn"
                  />
                  <Styled.Label style={{ marginLeft: '0.5rem' }}>
                    {intl.formatMessage(intlMessages.disableLabel)}
                  </Styled.Label>
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>

            {isReactionsEnabled && (
              <Styled.Row>
                <Styled.Col>
                  <Styled.FormElementRight>
                    <SubMenusStyle.MaterialSwitch
                      icons="false"
                      checked={settings.autoCloseReactionsBar}
                      onChange={() => this.handleToggle('autoCloseReactionsBar')}
                      aria-label={`${intl.formatMessage(intlMessages.autoCloseReactionsBarLabel)} - ${displaySettingsStatus(settings.autoCloseReactionsBar, false)}`}
                      data-test="autoCloseReactionsBarToggleBtn"
                    />
                    <Styled.Label style={{ marginLeft: '0.5rem' }}>
                      {intl.formatMessage(intlMessages.autoCloseReactionsBarLabel)}
                    </Styled.Label>
                  </Styled.FormElementRight>
                </Styled.Col>
              </Styled.Row>
            )}
          </Styled.Form>
        </Styled.AplicationContainer>

        <Styled.LanguageContainer>
          <Styled.Title>
            {intl.formatMessage(intlMessages.languageLabel)}
          </Styled.Title>
          {this.renderLanguageSelector()}
        </Styled.LanguageContainer>

        <Styled.FontContainer>
          <Styled.Title>
            {intl.formatMessage(intlMessages.fontSizeControlLabel)}
          </Styled.Title>
          {this.renderFontSizeControl()}
        </Styled.FontContainer>
      </div>
    );
  }
}

export default injectIntl(ApplicationMenu);
