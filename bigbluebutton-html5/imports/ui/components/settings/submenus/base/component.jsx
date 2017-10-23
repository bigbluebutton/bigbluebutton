import React from 'react';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  handleToggle(key) {
    const obj = this.state;
    obj.settings[key] = !this.state.settings[key];

    this.setState(obj, () => {
      this.handleUpdateSettings(this.state.settingsName, this.state.settings);
    });
  }
}
