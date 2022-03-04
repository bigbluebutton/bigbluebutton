import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Styled from './styles';

export default class ToolbarSubmenuItem extends Component {
  constructor() {
    super();

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
    this.setRef = this.setRef.bind(this);

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
    const {
      customIcon,
      icon,
      label,
      toolbarActive,
      'data-test': dataTest,
    } = this.props;

    return (
      <Styled.ButtonWrapper>
        <Styled.SubmenuButton
          state={toolbarActive ? 'selected' : 'unselected'}
          hideLabel
          role="button"
          color="default"
          size="md"
          label={label}
          aria-label={label}
          icon={icon}
          customIcon={customIcon}
          onMouseUp={this.handleOnMouseUp}
          onKeyPress={this.handleOnMouseUp}
          setRef={this.setRef}
          data-test={dataTest}
        />
      </Styled.ButtonWrapper>
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
  selected: PropTypes.bool,
};

ToolbarSubmenuItem.defaultProps = {
  icon: null,
  customIcon: null,
  selected: false,
};
