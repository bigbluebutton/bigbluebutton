import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Settings from './component';
import Service from './service';
import LocalStorage from '/imports/ui/services/storage/local.js';

const DEFAULT_FONTSIZE = 3;
const MAX_FONTSIZE = 5;
const MIN_FONTSIZE = 1;

class SettingsMenuContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentFontSize: LocalStorage.getItem('bbbSavedFontSize') || DEFAULT_FONTSIZE,
    }

    this.fontControl = {
      properties: {
        1: { size: '12px', name: 'Extra Small' },
        2: { size: '14px', name: 'Small' },
        3: { size: '16px', name: 'Medium' },
        4: { size: '18px', name: 'Large' },
        5: { size: '20px', name: 'Extra Large' },
      },
    };

    this.handleGetFontSizeName = this.handleGetFontSizeName.bind(this);
    this.handleApplyFontSize = this.handleApplyFontSize.bind(this);
    this.handleIncreaseFontSize = this.handleIncreaseFontSize.bind(this);
    this.handleDecreaseFontSize = this.handleDecreaseFontSize.bind(this);
    this.handleSaveFontState = this.handleSaveFontState.bind(this);
    this.handleRevertFontState = this.handleRevertFontState.bind(this);
  }

  handleGetFontSizeName() {
    return this.fontControl.properties[this.state.currentFontSize].name;
  };

  handleApplyFontSize() {
    const size = this.fontControl.properties[this.state.currentFontSize].size;
    document.getElementsByTagName('html')[0].style.fontSize = size;
  };

  handleIncreaseFontSize() {
    let fs = ( this.state.currentFontSize < MAX_FONTSIZE) ? ++this.state.currentFontSize : MAX_FONTSIZE;
    LocalStorage.setItem('bbbFontSize', fs);
    this.setState({ currentFontSize: fs }, function () {
      this.handleApplyFontSize();
    });
  };

  handleDecreaseFontSize() {
    let fs = ( this.state.currentFontSize > MIN_FONTSIZE) ? --this.state.currentFontSize : MIN_FONTSIZE;
    LocalStorage.setItem('bbbFontSize', fs);
    this.setState({ currentFontSize: fs }, function () {
      this.handleApplyFontSize();
    });
  };

  handleSaveFontState() {
    let fs = LocalStorage.getItem('bbbFontSize') || DEFAULT_FONTSIZE;
    LocalStorage.setItem('bbbSavedFontSize', fs);
    LocalStorage.setItem('bbbSavedFontSizePixels', this.fontControl.properties[fs].size);
    this.setState({ currentFontSize: fs }, function () {
      this.handleApplyFontSize();
    });
  };

  handleRevertFontState(){
    let fs = LocalStorage.getItem('bbbSavedFontSize') || DEFAULT_FONTSIZE;
    this.setState({ currentFontSize: fs }, function () {
      this.handleApplyFontSize();
    });
  };

  render() {

    const handleGetFontSizeName = () => this.handleGetFontSizeName();
    const handleIncreaseFontSize = () => this.handleIncreaseFontSize();
    const handleDecreaseFontSize = () => this.handleDecreaseFontSize();
    const handleSaveFontState = () => this.handleSaveFontState();
    const handleRevertFontState = () => this.handleRevertFontState();

    return (
      <Settings
        handleGetFontSizeName={handleGetFontSizeName}
        handleIncreaseFontSize={handleIncreaseFontSize}
        handleDecreaseFontSize={handleDecreaseFontSize}
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
