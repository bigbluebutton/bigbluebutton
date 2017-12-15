import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import KEY_CODES from '/imports/utils/keyCodes';

import styles from './styles';
import ListItem from './item/component';
import ListSeparator from './separator/component';
import ListTitle from './title/component';
import UserActions from '../../user-list/user-list-content/user-participants/user-list-item/user-action/component';

const propTypes = {
 /*  We should recheck this proptype, sometimes we need to create an container and send to dropdown,
   but with this */
  // proptype, is not possible.
  children: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {
    if (propValue[key].type !== ListItem &&
      propValue[key].type !== ListSeparator &&
      propValue[key].type !== ListTitle &&
      propValue[key].type !== UserActions) {
      return new Error(`Invalid prop \`${propFullName}\` supplied to` +
        ` \`${componentName}\`. Validation failed.`);
    }
    return true;
  }).isRequired,
};

export default class DropdownList extends Component {
  constructor(props) {
    super(props);
    this.childrenRefs = [];
    this.menuRefs = [];
    this.handleItemKeyDown = this.handleItemKeyDown.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  componentWillMount() {
    this.setState({
      focusedIndex: 0,
    });
  }

  componentDidMount() {
    this._menu.addEventListener('keydown', event => this.handleItemKeyDown(event));
  }

  componentDidUpdate() {
    const { focusedIndex } = this.state;

    const children = [].slice.call(this._menu.children);
    this.menuRefs = children.filter(child => child.getAttribute('role') === 'menuitem');

    const activeRef = this.menuRefs[focusedIndex];

    if (activeRef) {
      activeRef.focus();
    }
  }

  handleItemKeyDown(event, callback) {
    const { getDropdownMenuParent } = this.props;
    let nextFocusedIndex = this.state.focusedIndex;

    if (KEY_CODES.ARROW_UP === event.which) {
      event.stopPropagation();

      nextFocusedIndex -= 1;

      if (nextFocusedIndex < 0) {
        nextFocusedIndex = this.menuRefs.length - 1;
      } else if (nextFocusedIndex > this.menuRefs.length - 1) {
        nextFocusedIndex = 0;
      }
    }

    if ([KEY_CODES.ARROW_DOWN].includes(event.keyCode)) {
      event.stopPropagation();

      nextFocusedIndex += 1;

      if (nextFocusedIndex > this.menuRefs.length - 1) {
        nextFocusedIndex = 0;
      }
    }

    if ([KEY_CODES.ENTER, KEY_CODES.ARROW_RIGHT].includes(event.keyCode)) {
      event.stopPropagation();
      document.activeElement.firstChild.click();
    }

    if ([KEY_CODES.ESCAPE, KEY_CODES.TAB, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
      const { dropdownHide } = this.props;

      event.stopPropagation();
      event.preventDefault();

      dropdownHide();
      if (getDropdownMenuParent) {
        getDropdownMenuParent().focus();
      }
    }

    this.setState({ focusedIndex: nextFocusedIndex });

    if (typeof callback === 'function') {
      callback(event);
    }
  }

  handleItemClick(event, callback) {
    const { getDropdownMenuParent, onActionsHide, dropdownHide } = this.props;

    if (getDropdownMenuParent) {
      onActionsHide();
    } else {
      this.setState({ focusedIndex: null });
      dropdownHide();
    }

    if (typeof callback === 'function') {
      callback(event);
    }
  }

  render() {
    const { children, style, className } = this.props;

    const boundChildren = Children.map(children,
      (item) => {
        if (item.type === ListSeparator) {
          return item;
        }

        return cloneElement(item, {
          tabIndex: 0,
          injectRef: (ref) => {
            if (ref && !this.childrenRefs.includes(ref)) { this.childrenRefs.push(ref); }
          },

          onClick: (event) => {
            let { onClick } = item.props;
            onClick = onClick ? onClick.bind(item) : null;
            this.handleItemClick(event, onClick);
          },

          onKeyDown: (event) => {
            let { onKeyDown } = item.props;
            onKeyDown = onKeyDown ? onKeyDown.bind(item) : null;

            this.handleItemKeyDown(event, onKeyDown);
          },
        });
      });

    return (
      <ul
        style={style}
        className={cx(styles.list, className)}
        role="menu"
        ref={(menu) => {
          this._menu = menu;
          return menu;
        }}
      >
        {boundChildren}
      </ul>
    );
  }
}

DropdownList.propTypes = propTypes;
