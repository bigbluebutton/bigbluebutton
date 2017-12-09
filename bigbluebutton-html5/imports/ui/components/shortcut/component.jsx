import React, { Component } from 'react';
import ReactDOM from 'react-dom';

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
    const { shortcut } = this.props;

    const combo = shortcut.toUpperCase();
    const keys = combo.split('+');

    if (event.key.toUpperCase() !== keys[keys.length - 1]) return;
    if (!event.ctrlKey && (combo.includes('CONTROL') || combo.includes('CTRL'))) return;
    if (!event.altKey && (combo.includes('ALT') || combo.includes('OPTION'))) return;
    if (!event.shiftKey && keys.includes('SHIFT')) return;

    this.element.firstChild.click();
  }

  render() {
    return (
      <span ref={(node) => { this.element = node; }}>
        {this.props.children}
      </span>
    );
  }
}

export const withShortcut = (ComponentToWrap, shortcut) =>
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
      const combo = shortcut.toUpperCase();
      const keys = combo.split('+');

      if (event.key.toUpperCase() !== keys[keys.length - 1]) return;
      if (!event.ctrlKey && (combo.includes('CONTROL') || combo.includes('CTRL'))) return;
      if (!event.altKey && (combo.includes('ALT') || combo.includes('OPTION'))) return;
      if (!event.shiftKey && keys.includes('SHIFT')) return;

      ReactDOM.findDOMNode(this.element).click();
    }

    render() {
      return (<ComponentToWrap
        {...this.props}
        ref={(ref) => { this.element = ref; }}
      />);
    }
  };

