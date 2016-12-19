import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Settings from './component';
import Service from './service';
import FontControl from '/imports/api/FontControl';

const DEFAULT_FONTSIZE = 3;
const MAX_FONTSIZE = 5;
const MIN_FONTSIZE = 1;

class SettingsMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFontSize: localStorage.bbbSavedFontSize || DEFAULT_FONTSIZE,
    }
    this.applyFontSize = this.applyFontSize.bind(this);
  }

  applyFontSize() {
    const size = FontControl.fontSizeEnum.properties[this.state.currentFontSize].size;
    document.getElementsByTagName('html')[0].style.fontSize = size;
  };

  increaseFontSize() {
    let fs = ( this.state.currentFontSize < MAX_FONTSIZE) ? ++this.state.currentFontSize : MAX_FONTSIZE;
    localStorage.setItem('bbbFontSize', fs);
    this.setState({ currentFontSize: fs }, function () {
      this.applyFontSize();
    });
  };

  decreaseFontSize() {
    let fs = ( this.state.currentFontSize > MIN_FONTSIZE) ? --this.state.currentFontSize : MIN_FONTSIZE;
    localStorage.setItem('bbbFontSize', fs);
    this.setState({ currentFontSize: fs }, function () {
      this.applyFontSize();
    });
  };

  getFontSizeName() {
    return FontControl.fontSizeEnum.properties[this.state.currentFontSize].name;
  };

  saveFontState() {
    localStorage.bbbSavedFontSize = localStorage.bbbFontSize || DEFAULT_FONTSIZE;
    this.setState({ currentFontSize: localStorage.bbbSavedFontSize }, function () {
      this.applyFontSize();
    });
  };

  revertFontState(){
    let revertFontSize = localStorage.bbbSavedFontSize || DEFAULT_FONTSIZE;
    this.setState({ currentFontSize: revertFontSize }, function () {
      this.applyFontSize();
    });
  };

  render() {

    const handleGetFontSizeName = () => this.getFontSizeName();
    const handleIncreaseFontSize = () => this.increaseFontSize();
    const handleDecreaseFontSize = () => this.decreaseFontSize();
    const handleSaveFontState = () => this.saveFontState();
    const handleRevertFontState = () => this.revertFontState();

    return (
      <Settings
        handleIncreaseFontSize={handleIncreaseFontSize}
        handleDecreaseFontSize={handleDecreaseFontSize}
        handleGetFontSizeName={handleGetFontSizeName}
        handleSaveFontState={handleSaveFontState}
        handleRevertFontState={handleRevertFontState}
        {...this.props}>
        {this.props.children}
      </Settings>
    );
  }
}

export default createContainer(() => {
  let data = Service.checkUserRoles();
  return data;
}, SettingsMenuContainer);
