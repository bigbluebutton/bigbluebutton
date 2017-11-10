import React, { Component } from 'react';

export const withShortcut = (ComponentToWrap, shotcut) =>
class ShortcutWrapper extends Component {

  componentDidMount() {
    const keyCombo = shotcut.split('+');
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.altKey && event.key === keyCombo[keyCombo.length - 1]) {
        this.el.handleShortcut();
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
