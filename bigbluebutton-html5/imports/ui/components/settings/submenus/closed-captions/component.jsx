import React from 'react';
import Modal from 'react-modal';
import styles from '../styles';
import cx from 'classnames';
import BaseMenu from '../base/component';
import Toggle from '/imports/ui/components/switch/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import { GithubPicker } from 'react-color';

//an array of font-families
const FONT_FAMILIES = ['Arial', 'Calibri', 'Time New Roman', 'Sans-serif'];

//an array of different font-sizes
const FONT_SIZES = ['12px', '14px', '18px', '24px', '32px', '42px'];

//an array of colors for both background and text
const COLORS =  [
                  '#000000', '#7A7A7A', '#FF0000', '#FF8800',
                  '#88FF00', '#FFFFFF', '#00FFFF', '#0000FF',
                  '#8800FF', '#FF00FF',
                ];

export default class ClosedCaptionsMenu extends BaseMenu {
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

  //clickhandler, opens a selected color picker (supports both of them)
  handleColorPickerClick(fieldname) {
    let obj = {};
    obj[fieldname] = !this.state[fieldname];
    this.setState(obj);
  }

  //closes color pickers
  handleCloseColorPicker() {
    this.setState({
      displayBackgroundColorPicker: false,
      displayFontColorPicker:false,
    });
  }

  handleSelectChange(fieldname, options, e) {
    let obj = this.state;
    obj.settings[fieldname] = options[e.target.value];
    this.setState(obj);
    this.handleUpdateSettings('cc', obj.settings);
  }

  handleColorChange(fieldname, color) {
    let obj = this.state;
    obj.settings[fieldname] = color.hex;

    this.setState(obj);
    this.handleUpdateSettings('cc', obj.settings);
    this.handleCloseColorPicker();
  }

  render() {
    const {
      locales,
    } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Closed Captions</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Closed captions
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={this.state.settings.enabled}
                onChange={() => this.handleToggle('enabled')} />
              </div>
            </div>
          </div>
          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Take ownership
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Checkbox
                  onChange={() => this.handleToggle('takeOwnership')}
                  checked={this.state.settings.takeOwnership}/>
              </div>
            </div>
          </div>
          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Language
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <select
                  defaultValue={locales ? locales.indexOf(this.state.settings.locale) : -1}
                  className={styles.select}
                  onChange={this.handleSelectChange.bind(this, 'locale', this.props.locales)}>
                <option>
                  { this.props.locales &&
                    this.props.locales.length ?
                    'Choose language' :
                    'No active locales' }
                </option>
                {this.props.locales ? this.props.locales.map((locale, index) =>
                  <option key={index} value={index}>
                    {locale}
                  </option>
                ) : null }
                </select>
              </div>
            </div>
          </div>

          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Font family
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <select
                  defaultValue={FONT_FAMILIES.indexOf(this.state.settings.fontFamily)}
                  onChange={this.handleSelectChange.bind(this, 'fontFamily', FONT_FAMILIES)}
                  className={styles.select}>
                  <option value='-1' disabled>Choose Font-family</option>
                  {
                    FONT_FAMILIES.map((family, index) =>
                      <option key={index} value={index}>
                        {family}
                      </option>
                    )
                  }
                </select>
              </div>
            </div>
          </div>

          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Font size
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <select
                  defaultValue={FONT_SIZES.indexOf(this.state.settings.fontSize)}
                  onChange={this.handleSelectChange.bind(this, 'fontSize', FONT_SIZES)}
                  className={styles.select}>
                  <option value='-1' disabled>Choose Font-size</option>
                  {
                    FONT_SIZES.map((size, index) =>
                      <option key={index} value={index}>
                        {size}
                      </option>
                    )
                  }
                </select>
              </div>
            </div>
          </div>

          <div className={cx(styles.row, styles.spacedLeft)}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Background color
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <div
                tabIndex='12'
                className={ styles.swatch }
                onClick={ this.handleColorPickerClick.bind(this, 'displayBackgroundColorPicker') }>
                <div
                  className={styles.swatchInner}
                  style={ { background: this.state.settings.backgroundColor } }>
                </div>

              </div>
                { this.state.displayBackgroundColorPicker ?
                  <div className={styles.colorPickerPopover}>
                    <div
                      className={styles.colorPickerOverlay}
                      onClick={ this.handleCloseColorPicker.bind(this) }
                    >
                    </div>
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
                  Font color
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <div
                tabIndex='12'
                className={ styles.swatch }
                onClick={ this.handleColorPickerClick.bind(this, 'displayFontColorPicker') }>
                <div
                  className={styles.swatchInner}
                  style={ { background: this.state.settings.fontColor } }>
                </div>

              </div>
                { this.state.displayFontColorPicker ?
                  <div className={styles.colorPickerPopover}>
                    <div
                      className={styles.colorPickerOverlay}
                      onClick={ this.handleCloseColorPicker.bind(this) }
                    >
                    </div>
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
            role='presentation'
            style={ { background: this.state.settings.backgroundColor } }>
            <span style={this.getPreviewStyle()}>
              Etiam porta sem malesuada magna mollis euis-mod.
              Donec ullamcorper nulla non metus auctor fringilla.
            </span>
          </div>
        </div>
      </div>
    );
  }
};
