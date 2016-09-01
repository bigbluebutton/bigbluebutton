import React, { Component, PropTypes } from 'react';

const propTypes = {
  children: React.PropTypes.element.isRequired,
};

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children, handleToggle } = this.props;
    const TriggerComponent = React.Children.only(children);

    const TriggerComponentBounded = React.cloneElement(TriggerComponent, {
      onClick: handleToggle,
      'aria-haspopup': true,
    });

    return TriggerComponentBounded;
  }
}

DropdownTrigger.propTypes = propTypes;
