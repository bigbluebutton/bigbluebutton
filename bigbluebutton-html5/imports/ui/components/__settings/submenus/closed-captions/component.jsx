import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles';
import Storage from '/imports/ui/services/storage/session';
import { GithubPicker } from 'react-color';

//an array of font-families
const fonts = ["Arial", "Calibri", "Time New Roman", "Sans-serif"];
//an array of different font-sizes
const fontSizes = [12, 14, 18, 24, 32, 42];
//an array of colors for both background and text
const colors = ['#000000', '#7A7A7A' ,'#FF0000', '#FF8800', '#88FF00', '#FFFFFF', '#00FFFF', '#0000FF', '#8800FF', '#FF00FF'];

export default class ClosedCaptionsMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      closedCaptions: this.props.ccEnabled ? true : false,
      locales: this.props.locales,

      //default values for the input select fields (to display "Choose ..")
      ccLocale: -1,
      ccFontFamily: -1,
      ccFontSize: -1,

      //actual default values for the previewing the text in the box
      ccFontSizeValue: Storage.getItem('ccFontSize') ? Storage.getItem('ccFontSize') : 18,
      ccFontFamilyValue: Storage.getItem('ccFontFamily') ? Storage.getItem('ccFontFamily') : 'Arial',

      //background defaults to white (well, almost white, light grey looks better)
      ccBackgroundColor: Storage.getItem('ccBackgroundColor') ? Storage.getItem('ccBackgroundColor') : '#f3f6f9',

      //font color defaults to black
      ccFontColor: Storage.getItem('ccFontColor') ? Storage.getItem('ccFontColor') : '#000000',
      displayBackgroundColorPicker: false,
      displayFontColorPicker: false,
    }
  }

  checkBoxHandler(fieldname) {
    var obj = {};
    obj[fieldname] = !this.state[fieldname];
    Storage.setItem('closedCaptions', obj[fieldname]);
    this.setState(obj);
  }

  //select handler for the locale, font-size and font-family
  selectHandler(fieldname, collectionName, event) {
    Storage.setItem(fieldname, this.props[collectionName][event.target.value]);
    var obj ={};
    obj[fieldname] = event.target.value;
    obj[fieldname + "Value"] = this.props[collectionName][event.target.value];
    this.setState(obj);
  }

  //clickhandler, opens a selected color picker (supports both of them)
  handleColorPickerClick(fieldname) {
    let obj = {};
    obj[fieldname] = !this.state[fieldname];
    this.setState(obj);
  }

  //closes color pickers
  handleCloseColorPicker() {
    this.setState({ displayBackgroundColorPicker: false, displayFontColorPicker:false })
  }

  //change handler for both color pickers
  handleColorChange(fieldname, color) {
    var obj = {};
    obj[fieldname] = color.hex;
    Storage.setItem(fieldname, color.hex);
    this.setState(obj);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.row} role='presentation'>
          <label>
            <input
              className={styles.checkboxOffset}
              type='checkbox'
              tabIndex='7'
              aria-labelledby='closedCaptionsLabel'
              aria-describedby='closedCaptionsDesc'
              onChange={this.checkBoxHandler.bind(this, "closedCaptions")}
              checked={this.state.closedCaptions}
            />
            Closed captions
          </label>
        </div>
        <div id='closedCaptionsLabel' hidden>Closed-captions button</div>
        <div id='closedCaptionsDesc' hidden>Toggles closed-captioning module</div>

        <div className={styles.indentedRow} role='presentation'>
          <label>
            <input
              className={styles.checkboxOffset}
              type='checkbox'
              tabIndex='8'
              aria-labelledby='takeOwnershipLabel'
              aria-describedby='takeOwnershipDesc'
            />
            Take ownership
          </label>
        </div>
        <div id='takeOwnershipLabel' hidden>Closed-captions take ownership</div>
        <div id='takeOwnershipDesc' hidden>Take ownership of closed-captions</div>

        <div className={styles.indentedRow} role='presentation'>
          <div className={styles.containerLeftHalf}>Language</div>
          <div className={styles.containerRightHalfContent} role='presentation'>
              <select defaultValue={this.state.ccLocale} tabIndex='9'
                aria-labelledby='ccLanguageLabel' aria-describedby='ccLanguageDesc'
                onChange={this.selectHandler.bind(this, "ccLocale", "locales")}>
                <option value='-1' disabled>{this.props.locales && this.props.locales.length > 0 ? "Choose language" : "No active locales" }</option>
                {this.props.locales ? this.props.locales.map((locale, index) =>
                  <option key={index} value={index}>{locale}</option>
                )
                : null }
              </select>
            <div id='ccLanguageLabel' hidden>Language</div>
            <div id='ccLanguageDesc' hidden>Chooses the language from currently active locales.</div>
          </div>
        </div>

        <div className={styles.indentedRow} role='presentation'>
          <div className={styles.containerLeftHalf}>Font-Family</div>
          <div className={styles.containerRightHalfContent} role='presentation'>
              <select defaultValue={this.state.ccFontFamily} tabIndex='10'
                aria-labelledby='ccFontFamilyLabel' aria-describedby='ccFontfamilyDesc'
                onChange={this.selectHandler.bind(this, "ccFontFamily", "fonts")}>
                <option value='-1' disabled>Choose font-family</option>
                {this.props.fonts ? this.props.fonts.map((font, index) =>
                  <option key={index} value={index}>{font}</option>
                )
                : null }
              </select>
            <div id='ccFontFamilyLabel' hidden>Font-Family</div>
            <div id='ccFontfamilyDesc' hidden>Chooses the Font-Family from the dropdown menu.</div>
          </div>
        </div>

        <div className={styles.indentedRow} role='presentation'>
          <div className={styles.containerLeftHalf}>Font-Size</div>
          <div className={styles.containerRightHalfContent} role='presentation'>
              <select defaultValue={this.state.ccFontSize} tabIndex='11'
                aria-labelledby='ccFontSizeLabel' aria-describedby='ccFontSizeDesc'
                onChange={this.selectHandler.bind(this, "ccFontSize", "fontSizes")}>
                <option value='-1' disabled>Choose Font-size</option>
                {this.props.fontSizes ? this.props.fontSizes.map((size, index) =>
                  <option key={index} value={index}>{size + 'px'}</option>
                )
                : null }
              </select>
            <div id='ccFontSizeLabel' hidden>Font-Size</div>
            <div id='ccFontSizeDesc' hidden>Chooses the Font-Size from the dropdown menu.</div>
          </div>
        </div>

        <div className={styles.indentedRow} role='presentation'>
          <div className={styles.containerLeftHalf}>Background Color</div>
          <div className={styles.containerRightHalfContent} role='presentation'>
            <div
              tabIndex='12'
              className={ styles.swatch }
              onClick={ this.handleColorPickerClick.bind(this, "displayBackgroundColorPicker") }>
              <div
                className={styles.swatchInner}
                style={{'background': this.state.ccBackgroundColor}}/>
            </div>
            { this.state.displayBackgroundColorPicker ?
              <div className={styles.colorPickerPopover}>
              <div
                className={styles.colorPickerOverlay}
                onClick={ this.handleCloseColorPicker.bind(this) }
              />
                <GithubPicker
                  color={this.state.ccBackgroundColor}
                  onChange={this.handleColorChange.bind(this, "ccBackgroundColor")}
                  colors={this.props.colors}
                  width={'140px'}
                  triangle={'top-right'}
                />
              </div>
            : null }
          </div>
        </div>

        <div className={styles.indentedRow} role='presentation'>
          <div className={styles.containerLeftHalf}>Text Color</div>
          <div className={styles.containerRightHalfContent} role='presentation'>
            <div
              tabIndex='12'
              className={ styles.swatch }
              onClick={ this.handleColorPickerClick.bind(this, "displayFontColorPicker") }>
              <div
                className={styles.swatchInner}
                style={{'background': this.state.ccFontColor}}/>
            </div>
            { this.state.displayFontColorPicker ?
              <div className={styles.colorPickerPopover}>
              <div
                className={styles.colorPickerOverlay}
                onClick={ this.handleCloseColorPicker.bind(this) }
              />
                <GithubPicker
                  color={this.state.ccFontColor}
                  onChange={this.handleColorChange.bind(this, "ccFontColor")}
                  colors={this.props.colors}
                  width={'140px'}
                  triangle={'top-right'}
                />
              </div>
            : null }
          </div>
        </div>

        <div className={styles.ccPreviewBox} role='presentation' style={{background: this.state.ccBackgroundColor}}>
          <span style={{fontFamily: this.state.ccFontFamilyValue, fontSize: this.state.ccFontSizeValue+'px', color: this.state.ccFontColor}}>Etiam porta sem malesuada magna mollis euis-mod. Donec ullamcorper nulla non metus auctor fringilla.</span>
        </div>
      </div>
    );
  }
};

ClosedCaptionsMenu.defaultProps = {
  fonts: fonts,
  fontSizes: fontSizes,
  colors: colors
};
