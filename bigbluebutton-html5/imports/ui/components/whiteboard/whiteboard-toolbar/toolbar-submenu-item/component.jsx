import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import _ from 'lodash';
import styles from '../styles';

export default class ToolbarSubmenuItem extends Component {
  constructor() {
    super();

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  // generating a unique ref string for the toolbar-item
  componentWillMount() {
    this.uniqueRef = _.uniqueId('toolbar-submenu-item');
  }

  componentDidMount() {
    // adding and removing touchstart events can be done via standard React way
    // by passing onTouchStart={this.funcName} once they stop triggering mousedown events
    // see https://github.com/facebook/react/issues/9809
    this[this.uniqueRef].addEventListener('touchstart', this.handleTouchStart);
  }

  componentWillUnmount() {
    this[this.uniqueRef].removeEventListener('touchstart', this.handleTouchStart);
  }

  setRef(ref) {
    this[this.uniqueRef] = ref;
  }

  // we have to use touchStart and on mouseUp in order to be able to use the toolbar
  // with the text shape on mobile devices
  // (using the toolbar while typing text shouldn't move focus out of the textarea)
  handleTouchStart(event) {
    event.preventDefault();
    const { objectToReturn, onItemClick } = this.props;
    // returning the selected object
    onItemClick(objectToReturn);
  }

  handleOnMouseUp() {
    const { objectToReturn, onItemClick } = this.props;
    // returning the selected object
    onItemClick(objectToReturn);
  }

  render() {
    return (
      <div className={styles.buttonWrapper}>
        <Button
          hideLabel
          role="button"
          color="default"
          size="md"
          label={this.props.label}
          icon={this.props.icon}
          customIcon={this.props.customIcon}
          onMouseUp={this.handleOnMouseUp}
          className={this.props.className}
          setRef={this.setRef}
        />
      </div>
    );
  }
}


ToolbarSubmenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  customIcon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
  objectToReturn: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]).isRequired,
  className: PropTypes.string.isRequired,
};

ToolbarSubmenuItem.defaultProps = {
  icon: null,
  customIcon: null,
};
