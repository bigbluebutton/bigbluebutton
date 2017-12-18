import React, { Component } from 'react';

export default class Shortcut extends Component {
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
    const { keyCombo } = this.props;

    const combo = keyCombo.toUpperCase();
    const keys = combo.split('+');

    if (event.key.toUpperCase() !== keys[keys.length - 1]) return;
    if (!event.ctrlKey && (combo.includes('CONTROL') || combo.includes('CTRL'))) return;
    if (!event.altKey && (combo.includes('ALT') || combo.includes('OPTION'))) return;
    if (!event.shiftKey && keys.includes('SHIFT')) return;

    this.element.firstChild.click();
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: ((node) => { this.element = node; }),
    });
  }
}

export const withShortcut = (ComponentToWrap, shortcut) =>
  class ShortcutWrapper extends React.PureComponent {
    render() {
      return (
        <Shortcut keyCombo={shortcut}><ComponentToWrap {...this.props} /></Shortcut>
      );
    }
  };

