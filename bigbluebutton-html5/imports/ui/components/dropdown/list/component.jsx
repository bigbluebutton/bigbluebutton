import React, { Component, PropTypes, Children, cloneElement } from 'react';
import styles from './styles';
import cx from 'classnames';
import KEY_CODES from '/imports/utils/keyCodes';
import ListItem from './item/component';
import ListSeparator from './separator/component';
import ListTitle from './title/component';

const propTypes = {
  children: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {
    if (propValue[key].type !== ListItem &&
        propValue[key].type !== ListSeparator &&
        propValue[key].type !== ListTitle) {
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
    this.focusedItemIndex = 0;
  }

  componentWillMount() {
    this.setState({
      activeItemIndex: 0,
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    let { activeItemIndex } = this.state;

    if (activeItemIndex === null) {
      activeItemIndex = 0;
    }

    const activeRef = this.childrenRefs[activeItemIndex];

    if (activeRef) {
      activeRef.focus();
    }
  }

  handleItemKeyDown(event, callback) {
    const { dropdownHide } = this.props;
    const { activeItemIndex } = this.state;

    let selectableItems = [];
    for (let i = 0; i < (this._menu.children.length); i++) {
      if (this._menu.children[i].getAttribute("role") === 'menuitem'){
        selectableItems.push(this._menu.children[i]);
      }
    }

    const focusMenuItem = () => {
      event.preventDefault();
      event.stopPropagation();

      selectableItems[this.focusedItemIndex].focus();
    }

    if ([KEY_CODES.ENTER, KEY_CODES.SPACE].includes(event.keyCode)) {
      event.preventDefault();
      event.stopPropagation();

      document.activeElement.click();
    }

    if (KEY_CODES.ARROW_DOWN === event.which) {
      this.focusedItemIndex += 1;

      if (!selectableItems[this.focusedItemIndex]) {
        this.focusedItemIndex = 0;
      }

      focusMenuItem();
    }

    if (KEY_CODES.ARROW_UP === event.which) {
      this.focusedItemIndex -= 1;

      if (this.focusedItemIndex < 0) {
        this.focusedItemIndex = selectableItems.length - 1;
      }
      
      focusMenuItem();
    }

    if ([KEY_CODES.ESCAPE, KEY_CODES.TAB, KEY_CODES.ARROW_LEFT].includes(event.keyCode)){
      const { getDropdownMenuParent, isChild } = this.props;

      event.preventDefault();
      dropdownHide();
      
      if (isChild) {
        getDropdownMenuParent().focus();
      }
      
    }

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
      <ul style={style} className={cx(styles.list, className)} role="menu" ref={(r) => this._menu = r}>
        {boundChildren}
      </ul>
    );
  }
}

DropdownList.propTypes = propTypes;
