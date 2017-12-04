import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from 'tippy.js';
import _ from 'lodash';
import cx from 'classnames';

const propTypes = {

};

const defaultProps = {
  position: 'bottom'
};

class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tippySelector: _.uniqueId('tippy-'),
    };

    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.handleEscapeHide = this.handleEscapeHide.bind(this);
  }

  componentDidMount() {
    const {
      tippySelector,
    } = this.state;

    const {
      position
    } = this.props;

    const options = {
      position,
      onShow: this.onShow,
      onHide: this.onHide,
    };

    this.setState({
      tooltip: Tippy(`#${tippySelector}`, options),
    });
  }

  onShow() {
    document.addEventListener('keyup', this.handleEscapeHide);
  }

  onHide() {
    document.removeEventListener('keyup', this.handleEscapeHide);
  }

  handleEscapeHide(e) {
    const {
      tooltip,
    } = this.state;

    const popper = tooltip.tooltips[0];

    return e.keyCode === 27 ? popper.hide() : null;
  }

  render() {
    const {
      tippySelector,
    } = this.state;

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
      id: tippySelector,
      className: cx(children.props.className, className),
    });

    return WrappedComponentBound;
  }
}

export default Tooltip;

Tooltip.defaultProps = defaultProps;
Tooltip.propTypes = propTypes;
