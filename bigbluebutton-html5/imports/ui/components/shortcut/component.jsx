import React, { Component } from 'react';

export const withShortcut = (ComponentToWrap, shotcut) =>
class ShortcutWrapper extends Component {
  constructor() {
    super();

    this.handleShortcut = this.handleShortcut.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleShortcut, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleShortcut, false);
  }

  handleShortcut(event) {
    let ctrlFlag = false; let altFlag = false; let shiftFlag = false;
    const keys = shotcut.split('+');

    keys.forEach((element) => {
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

    const CONTROL_ALT = ctrlFlag && altFlag;
    const CONTROL_SHIFT = ctrlFlag && shiftFlag;

    if (CONTROL_ALT) {
      if (event.ctrlKey && event.altKey && event.key === keys[keys.length - 1]) {
        this.element.ref.props.onClick();
      }
    }
    if (CONTROL_SHIFT) {
      if (event.ctrlKey && event.shiftKey && event.key === keys[keys.length - 1].toUpperCase()) {
        this.element.ref.props.onClick();
      }
    }
  }

  render() {
    return (<ComponentToWrap
      {...this.props}
      ref={(ref) => { this.element = ref; }}
    />);
  }
};
