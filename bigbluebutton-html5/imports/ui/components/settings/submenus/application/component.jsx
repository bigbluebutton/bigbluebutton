import React from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';

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
  audioAlertLabel: {
    id: 'app.submenu.application.audioAlertLabel',
    description: 'audio notification label',
  },
  pushAlertLabel: {
    id: 'app.submenu.application.pushAlertLabel',
    description: 'push notifiation label',
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
  ariaLanguageLabel: {
    id: 'app.submenu.application.ariaLanguageLabel',
    description: 'aria label for locale change section',
  },
  languageOptionLabel: {
    id: 'app.submenu.application.languageOptionLabel',
    description: 'default change language option when locales are available',
  },
  noLocaleOptionLabel: {
    id: 'app.submenu.application.noLocaleOptionLabel',
    description: 'default change language option when no locales available',
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
      fontSizes: [
        '12px',
        '14px',
        '16px',
        '18px',
        '20px',
      ],
    };
  }

  componentDidMount() {
    this.setInitialFontSize();
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

  handleUpdateFontSize(size) {
    const obj = this.state;
    obj.settings.fontSize = size;
    this.handleUpdateSettings(this.state.settingsName, obj.settings);
  }

  changeFontSize(size) {
    const obj = this.state;
    obj.settings.fontSize = size;
    this.setState(obj, () => {
      ApplicationMenu.setHtmlFontSize(this.state.settings.fontSize);
      this.handleUpdateFontSize(this.state.settings.fontSize);
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

  handleSelectChange(fieldname, options, e) {
    const obj = this.state;
    obj.settings[fieldname] = e.target.value.toLowerCase().replace('_', '-');
    this.handleUpdateSettings('application', obj.settings);
  }

  render() {
    const { availableLocales, intl } = this.props;
    const { isLargestFontSize, isSmallestFontSize } = this.state;

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
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.animationsLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.animations}
                  onChange={() => this.handleToggle('animations')}
                  ariaLabel={intl.formatMessage(intlMessages.animationsLabel)}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.audioAlertLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.chatAudioAlerts}
                  onChange={() => this.handleToggle('chatAudioAlerts')}
                  ariaLabel={intl.formatMessage(intlMessages.audioAlertLabel)}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.pushAlertLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.chatPushAlerts}
                  onChange={() => this.handleToggle('chatPushAlerts')}
                  ariaLabel={intl.formatMessage(intlMessages.pushAlertLabel)}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col} aria-hidden="true">
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.languageLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div
                id="changeLangLabel"
                aria-label={intl.formatMessage(intlMessages.ariaLanguageLabel)}
              />
              <label
                aria-labelledby="changeLangLabel"
                className={cx(styles.formElement, styles.pullContentRight)}
              >
                {availableLocales && availableLocales.length > 0 ? (
                  <select
                    defaultValue={this.state.settings.locale}
                    className={styles.select}
                    onChange={this.handleSelectChange.bind(this, 'locale', availableLocales)}
                  >
                    <option disabled>{intl.formatMessage(intlMessages.languageOptionLabel)}</option>
                    {availableLocales.map((locale, index) => (
                      <option key={index} value={locale.locale}>
                        {locale.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </label>
            </div>
          </div>
          <hr className={styles.separator} />
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.fontSizeControlLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <label className={cx(styles.label, styles.bold)}>
                  {this.state.settings.fontSize}
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
                      disabled={isLargestFontSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(ApplicationMenu);
