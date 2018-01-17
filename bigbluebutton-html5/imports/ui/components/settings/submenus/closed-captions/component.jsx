import React from 'react';
import { styles } from '../styles';
import cx from 'classnames';
import BaseMenu from '../base/component';
import Toggle from '/imports/ui/components/switch/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import { GithubPicker } from 'react-color';
import { defineMessages, injectIntl } from 'react-intl';

// an array of font-families
const FONT_FAMILIES = ['Arial', 'Calibri', 'Time New Roman', 'Sans-serif'];

// an array of different font-sizes
const FONT_SIZES = ['12px', '14px', '18px', '24px', '32px', '42px'];

// an array of colors for both background and text
const COLORS = [
  '#000000', '#7A7A7A', '#FF0000', '#FF8800',
  '#88FF00', '#FFFFFF', '#00FFFF', '#0000FF',
  '#8800FF', '#FF00FF',
];

const intlMessages = defineMessages({
  closedCaptionsLabel: {
    id: 'app.submenu.closedCaptions.closedCaptionsLabel',
    description: 'Closed Captions label',
  },
  takeOwnershipLabel: {
    id: 'app.submenu.closedCaptions.takeOwnershipLabel',
    description: 'Take ownership label',
  },
  languageLabel: {
    id: 'app.submenu.closedCaptions.languageLabel',
    description: 'Language label',
  },
  localeOptionLabel: {
    id: 'app.submenu.closedCaptions.localeOptionLabel',
    description: 'Label for active locales',
  },
  noLocaleOptionLabel: {
    id: 'app.submenu.closedCaptions.noLocaleOptionLabel',
    description: 'Label for no active locales',
  },
  fontFamilyLabel: {
    id: 'app.submenu.closedCaptions.fontFamilyLabel',
    description: 'Label for type of Font family',
  },
  fontFamilyOptionLabel: {
    id: 'app.submenu.closedCaptions.fontFamilyOptionLabel',
    description: 'Font-family default choice option',
  },
  fontSizeLabel: {
    id: 'app.submenu.closedCaptions.fontSizeLabel',
    description: 'Font size label',
  },
  fontSizeOptionLabel: {
    id: 'app.submenu.closedCaptions.fontSizeOptionLabel',
    description: 'Choose Font size default option label',
  },
  backgroundColorLabel: {
    id: 'app.submenu.closedCaptions.backgroundColorLabel',
    description: 'Background color label',
  },
  fontColorLabel: {
    id: 'app.submenu.closedCaptions.fontColorLabel',
    description: 'Font color label',
  },
});

class ClosedCaptionsMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      settingsName: 'cc',
      settings: {
        backgroundColor: props.settings ? props.settings.backgroundColor : '#f3f6f9',
        fontColor: props.settings ? props.settings.fontColor : '#000000',
        enabled: props.settings ? props.settings.enabled : false,
        fontFamily: props.settings ? props.settings.fontFamily : 'Calibri',
        fontSize: props.settings ? props.settings.fontSize : -1,
        locale: props.settings ? props.settings.locale : -1,
        takeOwnership: props.settings ? props.settings.takeOwnership : false,
      },
    };
  }

  getPreviewStyle() {
    return {
      fontFamily: this.state.settings.fontFamily,
      fontSize: this.state.settings.fontSize,
      color: this.state.settings.fontColor,
    };
  }

  // clickhandler, opens a selected color picker (supports both of them)
  handleColorPickerClick(fieldname) {
    const obj = {};
    obj[fieldname] = !this.state[fieldname];
    this.setState(obj);
  }

  // closes color pickers
  handleCloseColorPicker() {
    this.setState({
      displayBackgroundColorPicker: false,
      displayFontColorPicker: false,
    });
  }

  handleSelectChange(fieldname, options, e) {
    const obj = this.state;
    obj.settings[fieldname] = options[e.target.value];
    this.setState(obj);
    this.handleUpdateSettings('cc', obj.settings);
  }

  handleColorChange(fieldname, color) {
    const obj = this.state;
    obj.settings[fieldname] = color.hex;

    this.setState(obj);
    this.handleUpdateSettings('cc', obj.settings);
    this.handleCloseColorPicker();
  }

  render() {
    const {
      locales,
      intl,
      isModerator,
    } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.closedCaptionsLabel)}</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.closedCaptionsLabel)}
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)} >
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.enabled}
                  onChange={() => this.handleToggle('enabled')}
                  ariaLabelledBy={'closedCaptions'}
                  ariaLabel={intl.formatMessage(intlMessages.closedCaptionsLabel)}
                />
              </div>
            </div>
          </div>
          { this.state.settings.enabled ?
            <div>
              { isModerator ?
                <div className={cx(styles.row, styles.spacedLeft)}>
                  <div className={styles.col}>
                    <div className={styles.formElement}>
                      <label className={styles.label}>
                        {intl.formatMessage(intlMessages.takeOwnershipLabel)}
                      </label>
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={cx(styles.formElement, styles.pullContentRight)}>
                      <Checkbox
                        onChange={() => this.handleToggle('takeOwnership')}
                        checked={this.state.settings.takeOwnership}
                        ariaLabelledBy={'takeOwnership'}
                        ariaLabel={intl.formatMessage(intlMessages.takeOwnershipLabel)}
                      />
                    </div>
                  </div>
                </div>
              : null }
              <div className={cx(styles.row, styles.spacedLeft)}>
                <div className={styles.col}>
                  <div className={styles.formElement}>
                    <label className={styles.label}>
                      {intl.formatMessage(intlMessages.languageLabel)}
                    </label>
                  </div>
                </div>
                <div className={styles.col}>
                  <label
                    className={cx(styles.formElement, styles.pullContentRight)}
                    aria-label={intl.formatMessage(intlMessages.languageLabel)}
                  >
                    <select
                      defaultValue={locales ? locales.indexOf(this.state.settings.locale) : -1}
                      className={styles.select}
                      onChange={this.handleSelectChange.bind(this, 'locale', this.props.locales)}
                    >
                      <option>
                        { this.props.locales &&
                          this.props.locales.length ?
                          intl.formatMessage(intlMessages.localeOptionLabel) :
                          intl.formatMessage(intlMessages.noLocaleOptionLabel) }
                      </option>
                      {this.props.locales ? this.props.locales.map((locale, index) =>
                        (<option key={index} value={index}>
                          {locale}
                        </option>),
                      ) : null }
                    </select>
                  </label>
                </div>
              </div>

              <div className={cx(styles.row, styles.spacedLeft)}>
                <div className={styles.col}>
                  <div className={styles.formElement}>
                    <label className={styles.label}>
                      {intl.formatMessage(intlMessages.fontFamilyLabel)}
                    </label>
                  </div>
                </div>
                <div className={styles.col}>
                  <label
                    className={cx(styles.formElement, styles.pullContentRight)}
                    aria-label={intl.formatMessage(intlMessages.fontFamilyLabel)}
                  >
                    <select
                      defaultValue={FONT_FAMILIES.indexOf(this.state.settings.fontFamily)}
                      onChange={this.handleSelectChange.bind(this, 'fontFamily', FONT_FAMILIES)}
                      className={styles.select}
                    >
                      <option value="-1" disabled>
                        {intl.formatMessage(intlMessages.fontFamilyOptionLabel)}
                      </option>
                      {
                        FONT_FAMILIES.map((family, index) =>
                          (<option key={index} value={index}>
                            {family}
                          </option>),
                        )
                      }
                    </select>
                  </label>
                </div>
              </div>

              <div className={cx(styles.row, styles.spacedLeft)}>
                <div className={styles.col}>
                  <div className={styles.formElement}>
                    <label className={styles.label}>
                      {intl.formatMessage(intlMessages.fontSizeLabel)}
                    </label>
                  </div>
                </div>
                <div className={styles.col}>
                  <label
                    className={cx(styles.formElement, styles.pullContentRight)}
                    aria-label={intl.formatMessage(intlMessages.fontSizeLabel)}
                  >
                    <select
                      defaultValue={FONT_SIZES.indexOf(this.state.settings.fontSize)}
                      onChange={this.handleSelectChange.bind(this, 'fontSize', FONT_SIZES)}
                      className={styles.select}
                    >
                      <option value="-1" disabled>
                        {intl.formatMessage(intlMessages.fontSizeOptionLabel)}
                      </option>
                      {
                          FONT_SIZES.map((size, index) =>
                            (<option key={index} value={index}>
                              {size}
                            </option>),
                          )
                        }
                    </select>
                  </label>
                </div>
              </div>

              <div className={cx(styles.row, styles.spacedLeft)}>
                <div className={styles.col}>
                  <div className={styles.formElement}>
                    <label className={styles.label}>
                      {intl.formatMessage(intlMessages.backgroundColorLabel)}
                    </label>
                  </div>
                </div>
                <div className={styles.col}>
                  <div
                    className={cx(styles.formElement, styles.pullContentRight)}
                    aria-label={intl.formatMessage(intlMessages.backgroundColorLabel)}
                  >
                    <div
                      tabIndex="0"
                      className={styles.swatch}
                      onClick={
                        this.handleColorPickerClick.bind(this, 'displayBackgroundColorPicker')
                      }
                    >
                      <div
                        className={styles.swatchInner}
                        style={{ background: this.state.settings.backgroundColor }}
                      />
                    </div>
                    { this.state.displayBackgroundColorPicker ?
                      <div className={styles.colorPickerPopover}>
                        <div
                          className={styles.colorPickerOverlay}
                          onClick={this.handleCloseColorPicker.bind(this)}
                        />
                        <GithubPicker
                          onChange={this.handleColorChange.bind(this, 'backgroundColor')}
                          color={this.state.settings.backgroundColor}
                          colors={COLORS}
                          width={'140px'}
                          triangle={'top-right'}
                        />
                      </div>
                    : null }
                  </div>
                </div>
              </div>

              <div className={cx(styles.row, styles.spacedLeft)}>
                <div className={styles.col}>
                  <div className={styles.formElement}>
                    <label className={styles.label}>
                      {intl.formatMessage(intlMessages.fontColorLabel)}
                    </label>
                  </div>
                </div>
                <div className={styles.col}>
                  <div
                    className={cx(styles.formElement, styles.pullContentRight)}
                    aria-label={intl.formatMessage(intlMessages.fontColorLabel)}
                  >
                    <div
                      tabIndex="0"
                      className={styles.swatch}
                      onClick={this.handleColorPickerClick.bind(this, 'displayFontColorPicker')}
                    >
                      <div
                        className={styles.swatchInner}
                        style={{ background: this.state.settings.fontColor }}
                      />
                    </div>
                    { this.state.displayFontColorPicker ?
                      <div className={styles.colorPickerPopover}>
                        <div
                          className={styles.colorPickerOverlay}
                          onClick={this.handleCloseColorPicker.bind(this)}
                        />
                        <GithubPicker
                          onChange={this.handleColorChange.bind(this, 'fontColor')}
                          color={this.state.settings.fontColor}
                          colors={COLORS}
                          width={'140px'}
                          triangle={'top-right'}
                        />
                      </div>
                    : null }
                  </div>
                </div>
              </div>
              <div
                className={cx(styles.ccPreviewBox, styles.spacedLeft)}
                role="presentation"
                style={{ background: this.state.settings.backgroundColor }}
              >
                <span style={this.getPreviewStyle()}>
                  Etiam porta sem malesuada magna mollis euis-mod.
                  Donec ullamcorper nulla non metus auctor fringilla.
                </span>
              </div>
            </div>
          : null }
        </div>
      </div>
    );
  }
}

export default injectIntl(ClosedCaptionsMenu);
