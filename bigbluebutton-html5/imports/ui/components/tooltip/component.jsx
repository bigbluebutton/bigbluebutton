import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from 'tippy.js';
import _ from 'lodash';
import cx from 'classnames';

const propTypes = {
  title: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['bottom']),
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  position: 'bottom',
  className: null,
};

class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.tippySelectorId = _.uniqueId('tippy-');
    this.onShow = this.onShow.bind(this);
    this.delay = [150, 50];
    this.dynamicTitle = true;
  }

  componentDidMount() {
    const {
      position,
    } = this.props;

    const options = {
      position,
      dynamicTitle: this.dynamicTitle,
      delay: this.delay,
      onShow: this.onShow,
      touchHold: true,
    };

    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  onShow() {
    window.setTimeout(() => {
      this.tooltip.tooltips[0].hide();
    }, 5000);
  }

  render() {
    const {
      children,
      className,
      title,
      ...restProps
    } = this.props;

    const WrappedComponent = React.Children.only(children);

    const WrappedComponentBound = React.cloneElement(WrappedComponent, {
      ...restProps,
      title,
      id: this.tippySelectorId,
      className: cx(children.props.className, className),
    });

    return WrappedComponentBound;
  }
}

export default Tooltip;

Tooltip.defaultProps = defaultProps;
Tooltip.propTypes = propTypes;
