import React, { Component, PropTypes, Children, cloneElement } from 'react';
import styles from './styles';
import cx from 'classnames';

import KEY_CODES from '/imports/utils/keyCodes';

import ListItem from './item/component';
import ListSeparator from './separator/component';

const propTypes = {
  children: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {
    if (propValue[key].type !== ListItem && propValue[key].type !== ListSeparator) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  }),
};

export default class DropdownList extends Component {
  constructor(props) {
    super(props);
    this.childrenRefs = [];
    this.handleItemKeyDown = this.handleItemKeyDown.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  componentWillMount() {
    this.setState({
      activeItemIndex: 0,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeItemIndex } = this.state;
    const activeRef = this.childrenRefs[activeItemIndex];

    if (activeRef) {
      activeRef.focus();
    }
  }

  handleItemKeyDown(event, callback) {
    const { dropdownHide } = this.props;
    const { activeItemIndex } = this.state;

    if ([KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.which)) {
      event.preventDefault();
      event.stopPropagation();

      return event.currentTarget.click();
    }

    let nextActiveItemIndex = null;

    if (KEY_CODES.ARROW_UP === event.which) {
      nextActiveItemIndex = activeItemIndex - 1;
    }

    if (KEY_CODES.ARROW_DOWN === event.which) {
      nextActiveItemIndex = activeItemIndex + 1;
    }

    if (nextActiveItemIndex > (this.childrenRefs.length - 1)) {
      nextActiveItemIndex = 0;
    }

    if (nextActiveItemIndex < 0) {
      nextActiveItemIndex = this.childrenRefs.length - 1;
    }

    if ([KEY_CODES.TAB, KEY_CODES.ESCAPE].includes(event.which)) {
      nextActiveItemIndex = 0;
      dropdownHide();
    }

    this.setState({ activeItemIndex: nextActiveItemIndex });

    if (typeof callback === 'function') {
      callback(event);
    }
  }

  handleItemClick(event, callback) {
    const { dropdownHide } = this.props;

    this.setState({ activeItemIndex: null });

    dropdownHide();

    if (typeof callback === 'function') {
      callback(event);
    }
  }

  render() {
    const { children, style, className } = this.props;

    const boundChildren = Children.map(children,
      (item, i) => {
        if (item.type === ListSeparator) {
          return item;
        }

        return cloneElement(item, {
          tabIndex: 0,
          injectRef: ref => {
            if (ref && !this.childrenRefs.includes(ref))
              this.childrenRefs.push(ref);
          },

          onClick: event => {
            let { onClick } = item.props;
            onClick = onClick ? onClick.bind(item) : null;

            this.handleItemClick(event, onClick);
          },

          onKeyDown: event => {
            let { onKeyDown } = item.props;
            onKeyDown = onKeyDown ? onKeyDown.bind(item) : null;

            this.handleItemKeyDown(event, onKeyDown);
          },
        });
      });

    return (
      <ul style={style} className={cx(styles.list, className)} role="menu">
        {boundChildren}
      </ul>
    );
  }
}

DropdownList.propTypes = propTypes;
