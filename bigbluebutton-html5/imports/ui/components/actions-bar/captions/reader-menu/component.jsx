import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { GithubPicker } from 'react-color';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { styles } from './styles';

const DEFAULT_VALUE = "select";
const DEFAULT_KEY = -1;
const DEFAULT_INDEX = 0;
const FONT_FAMILIES = ['Arial', 'Calibri', 'Time New Roman', 'Sans-serif'];
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
});

const propTypes = {
  activateCaptions: PropTypes.func.isRequired,
  getCaptionsSettings: PropTypes.func.isRequired,
  ownedLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class ReaderMenu extends PureComponent {
  constructor(props) {
    super(props);

    const { backgroundColor, fontColor, fontFamily, fontSize } = props.getCaptionsSettings();

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

  handleSelectChange(fieldname, options, event) {
    const obj = {};
    obj[fieldname] = options[event.target.value];
    this.setState(obj);
  }

  handleColorPickerClick(fieldname) {
    const obj = {};
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

  handleLocaleChange(e) {
    this.setState({ locale: event.target.value });
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
    const settings = { backgroundColor, fontColor, fontFamily, fontSize };
    activateCaptions(locale, settings);
    closeModal();
  }

  getPreviewStyle() {
    return {
      position: 'fixed',
      bottom: '75px',
      left: '75px',
      fontFamily: this.state.fontFamily,
      fontSize: this.state.fontSize,
      color: this.state.fontColor,
      background: this.state.backgroundColor,
    };
  }

  render() {
    const {
      intl,
      ownedLocales,
      closeModal,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.title)}</h3>
        </header>
        <div className={styles.content}>
          <div className={styles.left}>
            <select
              className={styles.select}
              onChange={this.handleLocaleChange}
              defaultValue={DEFAULT_VALUE}
            >
              <option disabled key={DEFAULT_KEY} value={DEFAULT_VALUE}>{intl.formatMessage(intlMessages.select)}</option>
              {ownedLocales.map((locale, index) => (<option key={index} value={locale.locale}>{locale.name}</option>))}
            </select>
            <span style={this.getPreviewStyle()}>AaBbCc</span>
          </div>
          <div className={styles.right}>
            <div className={styles.row}>
              <div>{intl.formatMessage(intlMessages.fontColor)}</div>
              <div
                tabIndex={DEFAULT_INDEX}
                className={styles.swatch}
                onClick={this.handleColorPickerClick.bind(this, 'displayFontColorPicker')}
              >
                <div className={styles.swatchInner} style={{ background: this.state.fontColor }}/>
              </div>
              {this.state.displayFontColorPicker
                ? (
                  <div className={styles.colorPickerPopover}>
                    <div className={styles.colorPickerOverlay} onClick={this.handleCloseColorPicker.bind(this)}/>
                    <GithubPicker
                      onChange={this.handleColorChange.bind(this, 'fontColor')}
                      color={this.state.fontColor}
                      colors={COLORS}
                      width="140px"
                      triangle="hide"
                    />
                  </div>
                ) : null
              }
            </div>
            <div className={styles.row}>
              <div>{intl.formatMessage(intlMessages.backgroundColor)}</div>
              <div
                tabIndex={DEFAULT_INDEX}
                className={styles.swatch}
                onClick={this.handleColorPickerClick.bind(this, 'displayBackgroundColorPicker')}
              >
                <div className={styles.swatchInner} style={{ background: this.state.backgroundColor }}/>
              </div>
              {this.state.displayBackgroundColorPicker
                ? (
                  <div className={styles.colorPickerPopover}>
                    <div className={styles.colorPickerOverlay} onClick={this.handleCloseColorPicker.bind(this)}/>
                    <GithubPicker
                      onChange={this.handleColorChange.bind(this, 'backgroundColor')}
                      color={this.state.backgroundColor}
                      colors={COLORS}
                      width="140px"
                      triangle="hide"
                    />
                  </div>
                ) : null
              }
            </div>
            <div className={styles.row}>
              <div>{intl.formatMessage(intlMessages.fontFamily)}</div>
              <select
                className={styles.select}
                defaultValue={FONT_FAMILIES.indexOf(this.state.fontFamily)}
                onChange={this.handleSelectChange.bind(this, 'fontFamily', FONT_FAMILIES)}
              >
                {FONT_FAMILIES.map((family, index) => (<option key={index} value={index}>{family}</option>))}
              </select>
            </div>
            <div className={styles.row}>
              <div>{intl.formatMessage(intlMessages.fontSize)}</div>
              <select
                className={styles.select}
                defaultValue={FONT_SIZES.indexOf(this.state.fontSize)}
                onChange={this.handleSelectChange.bind(this, 'fontSize', FONT_SIZES)}
              >
                {FONT_SIZES.map((size, index) => (<option key={index} value={index}>{size}</option>))}
              </select>
            </div>
          </div>
          <Button
            className={styles.startBtn}
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.handleStart}
            disabled={this.state.locale == null}
          />
        </div>
      </Modal>
    );
  }
}

ReaderMenu.propTypes = propTypes;

export default injectIntl(withModalMounter(ReaderMenu));
