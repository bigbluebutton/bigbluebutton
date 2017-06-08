import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
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
        `Invalid prop \`${propFullName}\` supplied to` +
        ` \`${componentName}\`. Validation failed.`,
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
    this.handleItemKeyDownWithparent = this.handleItemKeyDownWithparent.bind(this);
    this.focusedItemIndex = 0;
  }

  componentDidMount() {
    this._menu.addEventListener('keydown', event=>this.handleItemKeyDownWithparent(event));
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

  handleItemKeyDownWithparent(event) {
    const { onActionsHide, getDropdownMenuParent, } = this.props;

      if (!getDropdownMenuParent) {

        let selectableItems = [];
        for (let i = 0; i < (this._menu.children.length); i++) {
          if (this._menu.children[i].getAttribute("role") === 'menuitem'){
            selectableItems.push(this._menu.children[i]);
          }
        }

        const focusMenuItem = () => {
          selectableItems[this.focusedItemIndex].focus();
        }

        if (KEY_CODES.ARROW_UP === event.which) {
          event.stopPropagation();

          this.focusedItemIndex -= 1;

          if (this.focusedItemIndex < 0) {
            this.focusedItemIndex = selectableItems.length - 1;
          }else if (this.focusedItemIndex > selectableItems.length - 1) {
            this.focusedItemIndex = 0;
          }
          
          focusMenuItem();
          return;
        }

        if ([KEY_CODES.ARROW_DOWN].includes(event.keyCode)) {
          event.stopPropagation();

          this.focusedItemIndex += 1;

          if(this.focusedItemIndex > selectableItems.length - 1){
            this.focusedItemIndex = 0;
          }

          focusMenuItem();
          return;
        }

        if ([KEY_CODES.ENTER, KEY_CODES.ARROW_RIGHT].includes(event.keyCode)) {
          event.stopPropagation();
          document.activeElement.firstChild.click();
          return;
        }

        if ([KEY_CODES.ESCAPE, KEY_CODES.TAB, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
          const { dropdownHide } = this.props;
          event.stopPropagation();
          dropdownHide();
          return;
        }

    }else{

        if ([KEY_CODES.ESCAPE, KEY_CODES.TAB, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
          const { getDropdownMenuParent, dropdownHide, } = this.props;

          event.stopPropagation();
        
          if (getDropdownMenuParent) {
            getDropdownMenuParent().focus();
          }

          dropdownHide();
          return;
        }

       if ([KEY_CODES.ENTER, KEY_CODES.ARROW_RIGHT].includes(event.keyCode)) {
          event.stopPropagation();
          document.activeElement.firstChild.click();
          onActionsHide();
          return;
        }

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
      selectableItems[this.focusedItemIndex].focus();
    }

    if ([KEY_CODES.ENTER, KEY_CODES.SPACE].includes(event.keyCode)) {
      event.stopPropagation();
      
      document.activeElement.firstChild.click();
    }

    if ([KEY_CODES.ARROW_DOWN].includes(event.keyCode)) {
      event.stopPropagation();

      this.focusedItemIndex += 1;

      if (this.focusedItemIndex > selectableItems.length - 1) {
        this.focusedItemIndex = 0;
      }

      focusMenuItem();
    }

    if (KEY_CODES.ARROW_UP === event.which) {
      event.stopPropagation();

      this.focusedItemIndex -= 1;

      if (this.focusedItemIndex < 0) {
        this.focusedItemIndex = selectableItems.length - 1;
      }else if (this.focusedItemIndex > selectableItems.length - 1) {
        this.focusedItemIndex = 0;
      }
      
      focusMenuItem();
    }

    if ([KEY_CODES.ESCAPE, KEY_CODES.TAB, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
      const { getDropdownMenuParent } = this.props;

      event.stopPropagation();
      
      if (getDropdownMenuParent) {
        getDropdownMenuParent().focus();
      }

      dropdownHide();
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
        role="menu" ref={(r) => this._menu = r}>
          {boundChildren}
      </ul>
    );
  }
}

DropdownList.propTypes = propTypes;
