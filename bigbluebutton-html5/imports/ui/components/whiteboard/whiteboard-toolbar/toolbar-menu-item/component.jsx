import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import _ from 'lodash';
import { styles } from '../styles';

export default class ToolbarMenuItem extends Component {
  constructor() {
    super();

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  // generating a unique ref string for the toolbar-item
  componentWillMount() {
    this.uniqueRef = _.uniqueId('toolbar-menu-item');
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
    // if there is a submenu name, then pass it to onClick
    // if not - it's probably "Undo", "Clear All", "Multi-user", etc.
    // in the second case we'll pass undefined and it will work fine anyway
    onItemClick(objectToReturn);
  }

  handleOnMouseUp() {
    const { objectToReturn, onItemClick } = this.props;
    // if there is a submenu name, then pass it to onClick
    // if not - it's probably "Undo", "Clear All", "Multi-user", etc.
    // in the second case we'll pass undefined and it will work fine anyway
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
          icon={this.props.icon ? this.props.icon : null}
          customIcon={this.props.customIcon ? this.props.customIcon : null}
          onMouseUp={this.handleOnMouseUp}
          onBlur={this.props.onBlur}
          className={this.props.className}
          setRef={this.setRef}
          disabled={this.props.disabled}
        />
        {this.props.children}
      </div>
    );
  }
}

ToolbarMenuItem.propTypes = {
  // objectToReturn, children and onBlur are passed only with menu items that have submenus
  // thus they are optional
  onBlur: PropTypes.func,
  children: PropTypes.node,
  objectToReturn: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]),
  onItemClick: PropTypes.func.isRequired,
  // we can have either icon from the bigbluebutton-font or our custom svg/html
  // thus they are optional
  icon: PropTypes.string,
  customIcon: PropTypes.node,
  label: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

ToolbarMenuItem.defaultProps = {
  objectToReturn: null,
  icon: '',
  customIcon: null,
  onBlur: null,
  children: null,
};
