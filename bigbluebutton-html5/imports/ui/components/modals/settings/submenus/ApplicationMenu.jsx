import React from 'react';
import Modal from 'react-modal';
import {Icon} from '/imports/ui/components/shared/Icon.jsx';
import {Button} from '/imports/ui/components/shared/Button.jsx';
import BaseMenu from './BaseMenu.jsx';
import ReactDOM from 'react-dom';
import FontControl from '/imports/api/FontControl';

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);
    this.state = {
      currentFontSize: FontControl.fontSizeEnum.MEDIUM,
    };
  }

  getContent() {
    return (
      <div className="mediumFont">
        <p style={{ float: 'left' }}>Audio notifications for chat</p>
        <p style={{ float: 'right' }}>audio not</p>
        <p style={{ clear: 'both' }}>fsdfds</p>
        <p style={{ float: 'left' }}>Push notifications for chat</p>
        <p style={{ float: 'right' }}>push not</p>
        <br />
        <div style={{ clear: 'both' }}>
          <div style={{ float: 'left', width: '25%', textAlign: 'left' }}>Font size</div>
          <div style={{ float: 'left', width: '50%', textAlign: 'center' }}>
            {FontControl.getFontSizeName.call(this)}
          </div>
          <div style={{ float: 'left', width: '25%', textAlign: 'right' }}>
            <button className="fontSizeButton"
              onClick={FontControl.increaseFontSize.bind(this)}
            >+</button>
            <button className="fontSizeButton"
              onClick={FontControl.decreaseFontSize.bind(this)}
            >-</button>
          </div>
        </div>
      </div>
    );
  }
};
