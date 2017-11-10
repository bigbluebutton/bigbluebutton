import React, { Component } from 'react';

export const withShortcut = (ComponentToWrap, shotcut) =>
class ShortcutWrapper extends Component {

  componentDidMount() {
    let ctrlFlag = false; let altFlag = false; let shiftFlag = false;
    const keyCombo = shotcut.split('+');

    keyCombo.forEach((element) => {
      switch (element) {
        case 'Control':
          ctrlFlag = true;
          break;
        case 'Alt':
          altFlag = true;
          break;
        case 'Shift':
          shiftFlag = true;
          break;
        default:
          break;
      }
    });

    document.addEventListener('keydown', (event) => {
      if (ctrlFlag && altFlag) {
        if (event.ctrlKey && event.altKey && event.key === keyCombo[keyCombo.length - 1]) {
          this.el.handleShortcut();
        }
      }
      if (ctrlFlag && shiftFlag) {
        if (event.ctrlKey && event.shiftKey && event.key === keyCombo[keyCombo.length - 1]) {
          this.el.handleShortcut();
        }
      }
    });
  }

  render() {
    return (<ComponentToWrap
      {...this.props}
      ref={(el) => { this.el = el; }}
    />);
  }
};
