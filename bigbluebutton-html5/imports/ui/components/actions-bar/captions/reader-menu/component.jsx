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
const COLORS = [
  '#000000', '#7A7A7A',
  '#FF0000', '#FF8800',
  '#88FF00', '#FFFFFF',
  '#00FFFF', '#0000FF',
  '#8800FF', '#FF00FF',
];

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

    this.state = {
      locale: null,
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
        <div className={styles.selectLanguage}>
          <select
            className={styles.select}
            onChange={this.handleLocaleChange}
            defaultValue={DEFAULT_VALUE}
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
              >
                {loc.name}
              </option>))}
          </select>
        </div>
        {!locale ? null : (
          <div className={styles.content}>
            <div className={styles.col}>
              <div className={styles.row}>
                <div className={styles.label}>{intl.formatMessage(intlMessages.fontColor)}</div>
                <div
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
                        color={fontColor}
                        colors={COLORS}
                        width="140px"
                        triangle="hide"
                      />
                    </div>
                  ) : null
              }
              </div>

              <div className={styles.row}>
                <div className={styles.label}>
                  {intl.formatMessage(intlMessages.backgroundColor)}
                </div>
                <div
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
                        color={backgroundColor}
                        colors={COLORS}
                        width="140px"
                        triangle="hide"
                      />
                    </div>
                  ) : null
              }
              </div>

              <div className={styles.row}>
                <div className={styles.label}>{intl.formatMessage(intlMessages.fontFamily)}</div>
                <select
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
                <div className={styles.label}>{intl.formatMessage(intlMessages.fontSize)}</div>
                <select
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
                <span style={this.getPreviewStyle()}>AaBbCc</span>
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
