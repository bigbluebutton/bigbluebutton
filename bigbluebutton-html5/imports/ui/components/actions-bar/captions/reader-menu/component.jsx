import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { GithubPicker } from 'react-color';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { styles } from './styles.scss';

const DEFAULT_VALUE = 'select';
const DEFAULT_KEY = -1;
const DEFAULT_INDEX = 0;
const FONT_FAMILIES = ['Arial', 'Calibri', 'Times New Roman', 'Sans-serif'];
const FONT_SIZES = ['12px', '14px', '18px', '24px', '32px', '42px'];

// Not using hex values to force the githubPicker UI to display color names on hover
const COLORS = [
  'black', 'grey',
  'red', 'orange',
  'lime', 'white',
  'cyan', 'blue',
  'darkviolet', 'magenta',
];

// Used to convert hex values to color names for screen reader aria labels
const HEX_COLOR_NAMES = {
  '#000000': 'Black',
  '#7a7a7a': 'Grey',
  '#ff0000': 'Red',
  '#ff8800': 'Orange',
  '#88ff00': 'Green',
  '#ffffff': 'White',
  '#00ffff': 'Cyan',
  '#0000ff': 'Blue',
  '#8800ff': 'Dark violet',
  '#ff00ff': 'Magenta',
};

const intlMessages = defineMessages({
  closeLabel: {
    id: 'app.captions.menu.closeLabel',
    description: 'Label for closing captions menu',
  },
  title: {
    id: 'app.captions.menu.title',
    description: 'Title for the closed captions menu',
  },
  start: {
    id: 'app.captions.menu.start',
    description: 'Write closed captions',
  },
  select: {
    id: 'app.captions.menu.select',
    description: 'Select closed captions available language',
  },
  backgroundColor: {
    id: 'app.captions.menu.backgroundColor',
    description: 'Select closed captions background color',
  },
  fontColor: {
    id: 'app.captions.menu.fontColor',
    description: 'Select closed captions font color',
  },
  fontFamily: {
    id: 'app.captions.menu.fontFamily',
    description: 'Select closed captions font family',
  },
  fontSize: {
    id: 'app.captions.menu.fontSize',
    description: 'Select closed captions font size',
  },
  cancelLabel: {
    id: 'app.captions.menu.cancelLabel',
    description: 'Cancel button label',
  },
  preview: {
    id: 'app.captions.menu.previewLabel',
    description: 'Preview area label',
  },
  ariaSelectLang: {
    id: 'app.captions.menu.ariaSelect',
    description: 'Captions language select aria label',
  },
  captionsLabel: {
    id: 'app.captions.label',
    description: 'Used in font / size aria labels',
  },
  current: {
    id: 'app.submenu.application.currentSize',
    description: 'Used in text / background color aria labels',
  },
});

const propTypes = {
  activateCaptions: PropTypes.func.isRequired,
  getCaptionsSettings: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  ownedLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class ReaderMenu extends PureComponent {
  constructor(props) {
    super(props);

    const {
      backgroundColor,
      fontColor,
      fontFamily,
      fontSize,
    } = props.getCaptionsSettings();

    const { ownedLocales } = this.props;

    this.state = {
      locale: (ownedLocales && ownedLocales[0]) ? ownedLocales[0].locale : null,
      backgroundColor,
      fontColor,
      fontFamily,
      fontSize,
      displayBackgroundColorPicker: false,
      displayFontColorPicker: false,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleColorPickerClick = this.handleColorPickerClick.bind(this);
    this.handleCloseColorPicker = this.handleCloseColorPicker.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.getPreviewStyle = this.getPreviewStyle.bind(this);
  }

  getPreviewStyle() {
    const {
      backgroundColor,
      fontColor,
      fontFamily,
      fontSize,
    } = this.state;

    return {
      fontFamily,
      fontSize,
      color: fontColor,
      background: backgroundColor,
    };
  }

  handleColorPickerClick(fieldname) {
    const obj = {};
    // eslint-disable-next-line react/destructuring-assignment
    obj[fieldname] = !this.state[fieldname];
    this.setState(obj);
  }

  handleCloseColorPicker() {
    this.setState({
      displayBackgroundColorPicker: false,
      displayFontColorPicker: false,
    });
  }

  handleColorChange(fieldname, color) {
    const obj = this.state;
    obj[fieldname] = color.hex;
    this.setState(obj);
    this.handleCloseColorPicker();
  }

  handleLocaleChange(event) {
    this.setState({ locale: event.target.value });
  }

  handleSelectChange(fieldname, options, event) {
    const obj = {};
    obj[fieldname] = options[event.target.value];
    this.setState(obj);
  }

  handleStart() {
    const { closeModal, activateCaptions } = this.props;
    const {
      locale,
      backgroundColor,
      fontColor,
      fontFamily,
      fontSize,
    } = this.state;
    const settings = {
      backgroundColor,
      fontColor,
      fontFamily,
      fontSize,
    };
    activateCaptions(locale, settings);
    closeModal();
  }

  render() {
    const {
      intl,
      ownedLocales,
      closeModal,
    } = this.props;

    const {
      backgroundColor,
      displayBackgroundColorPicker,
      displayFontColorPicker,
      fontColor,
      fontFamily,
      fontSize,
      locale,
    } = this.state;

    const defaultLocale = locale || DEFAULT_VALUE;

    const ariaTextColor = `${intl.formatMessage(intlMessages.fontColor)} ${intl.formatMessage(intlMessages.current, { 0: HEX_COLOR_NAMES[fontColor.toLowerCase()] })}`;
    const ariaBackgroundColor = `${intl.formatMessage(intlMessages.backgroundColor)} ${intl.formatMessage(intlMessages.current, { 0: HEX_COLOR_NAMES[backgroundColor.toLowerCase()] })}`;
    const ariaFont = `${intl.formatMessage(intlMessages.captionsLabel)} ${intl.formatMessage(intlMessages.fontFamily)}`;
    const ariaSize = `${intl.formatMessage(intlMessages.captionsLabel)} ${intl.formatMessage(intlMessages.fontSize)}`;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <header className={styles.title}>
          {intl.formatMessage(intlMessages.title)}
        </header>
        {!locale ? null : (
          <div>
            <div className={styles.col}>
              <div className={styles.row}>
                <div aria-hidden className={styles.label}>
                  {intl.formatMessage(intlMessages.ariaSelectLang)}
                </div>
                <select
                  aria-label={intl.formatMessage(intlMessages.ariaSelectLang)}
                  className={styles.select}
                  onChange={this.handleLocaleChange}
                  defaultValue={defaultLocale}
                  lang={locale}
                >
                  <option
                    disabled
                    key={DEFAULT_KEY}
                    value={DEFAULT_VALUE}
                  >
                    {intl.formatMessage(intlMessages.select)}
                  </option>
                  {ownedLocales.map(loc => (
                    <option
                      key={loc.locale}
                      value={loc.locale}
                      lang={loc.locale}
                    >
                      {loc.name}
                    </option>))}
                </select>
              </div>

              <div className={styles.row}>
                <div aria-hidden className={styles.label}>
                  {intl.formatMessage(intlMessages.fontColor)}
                </div>
                <div
                  aria-label={ariaTextColor}
                  tabIndex={DEFAULT_INDEX}
                  className={styles.swatch}
                  onClick={this.handleColorPickerClick.bind(this, 'displayFontColorPicker')}
                >
                  <div className={styles.swatchInner} style={{ background: fontColor }} />
                </div>
                {displayFontColorPicker
                  ? (
                    <div className={styles.colorPickerPopover}>
                      <div
                        className={styles.colorPickerOverlay}
                        onClick={this.handleCloseColorPicker.bind(this)}
                      />
                      <GithubPicker
                        onChange={this.handleColorChange.bind(this, 'fontColor')}
                        colors={COLORS}
                        width="140px"
                        triangle="hide"
                      />
                    </div>
                  ) : null
              }
              </div>

              <div className={styles.row}>
                <div aria-hidden className={styles.label}>
                  {intl.formatMessage(intlMessages.backgroundColor)}
                </div>
                <div
                  aria-label={ariaBackgroundColor}
                  tabIndex={DEFAULT_INDEX}
                  className={styles.swatch}
                  onClick={this.handleColorPickerClick.bind(this, 'displayBackgroundColorPicker')}
                >
                  <div className={styles.swatchInner} style={{ background: backgroundColor }} />
                </div>
                {displayBackgroundColorPicker
                  ? (
                    <div className={styles.colorPickerPopover}>
                      <div
                        className={styles.colorPickerOverlay}
                        onClick={this.handleCloseColorPicker.bind(this)}
                      />
                      <GithubPicker
                        onChange={this.handleColorChange.bind(this, 'backgroundColor')}
                        colors={COLORS}
                        width="140px"
                        triangle="hide"
                      />
                    </div>
                  ) : null
              }
              </div>

              <div className={styles.row}>
                <div aria-hidden className={styles.label}>
                  {intl.formatMessage(intlMessages.fontFamily)}
                </div>
                <select
                  aria-label={ariaFont}
                  className={styles.select}
                  defaultValue={FONT_FAMILIES.indexOf(fontFamily)}
                  onChange={this.handleSelectChange.bind(this, 'fontFamily', FONT_FAMILIES)}
                >
                  {FONT_FAMILIES.map((family, index) => (
                    <option
                      key={family}
                      value={index}
                    >
                      {family}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div aria-hidden className={styles.label}>
                  {intl.formatMessage(intlMessages.fontSize)}
                </div>
                <select
                  aria-label={ariaSize}
                  className={styles.select}
                  defaultValue={FONT_SIZES.indexOf(fontSize)}
                  onChange={this.handleSelectChange.bind(this, 'fontSize', FONT_SIZES)}
                >
                  {FONT_SIZES.map((size, index) => (
                    <option
                      key={size}
                      value={index}
                    >
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.label}>{intl.formatMessage(intlMessages.preview)}</div>
                <span aria-hidden style={this.getPreviewStyle()}>AaBbCc</span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.footer}>
          <div className={styles.actions}>
            <Button
              label={intl.formatMessage(intlMessages.cancelLabel)}
              onClick={closeModal}
            />
            <Button
              color="primary"
              label={intl.formatMessage(intlMessages.start)}
              onClick={() => this.handleStart()}
              disabled={locale == null}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

ReaderMenu.propTypes = propTypes;

export default injectIntl(withModalMounter(ReaderMenu));
