import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import TetherComponent from 'react-tether';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import screenreaderTrap from 'makeup-screenreader-trap';
import { Session } from 'meteor/session';
import Styled from './styles';

import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
});

const noop = () => { };

const propTypes = {
  /**
   * The dropdown needs a trigger and a content component as children
   */
  children: (props, propName, componentName) => {
    const children = props[propName];

    if (!children || children.length < 2) {
      return new Error(`Invalid prop \`${propName}\` supplied to`
        + ` \`${componentName}\`. Validation failed.`);
    }

    const trigger = children.find((x) => x.type === DropdownTrigger);
    const content = children.find((x) => x.type === DropdownContent);

    if (!trigger) {
      return new Error(`Invalid prop \`${propName}\` supplied to`
        + ` \`${componentName}\`. Missing \`DropdownTrigger\`. Validation failed.`);
    }

    if (!content) {
      return new Error(`Invalid prop \`${propName}\` supplied to`
        + ` \`${componentName}\`. Missing \`DropdownContent\`. Validation failed.`);
    }

    return null;
  },
  isOpen: PropTypes.bool,
  keepOpen: PropTypes.bool,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
  autoFocus: PropTypes.bool,
  tethered: PropTypes.bool,
  getContent: PropTypes.func,
};

const defaultProps = {
  tethered: false,
  children: null,
  onShow: noop,
  onHide: noop,
  autoFocus: false,
  isOpen: false,
  keepOpen: null,
  getContent: () => {},
};

const attachments = {
  'right-bottom': 'bottom left',
  'right-top': 'bottom left',
};
const targetAttachments = {
  'right-bottom': 'bottom right',
  'right-top': 'top right',
};

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isPortrait: deviceInfo.isPortrait(),
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.updateOrientation = this.updateOrientation.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateOrientation);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      onShow,
      onHide,
      keepOpen,
      tethered,
    } = this.props;

    const { isOpen } = this.state;

    const enableSRTrap = isOpen && !tethered;

    if (enableSRTrap) {
      screenreaderTrap.trap(this.dropdown);
    } else {
      screenreaderTrap.untrap();
    }

    if (isOpen && !prevState.isOpen) { onShow(); }

    if (!isOpen && prevState.isOpen) { onHide(); }

    if (prevProps.keepOpen && !keepOpen) onHide();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateOrientation);
  }

  handleHide() {
    Session.set('dropdownOpen', false);
    const { onHide } = this.props;
    this.setState({ isOpen: false }, () => {
      const { removeEventListener } = window;
      onHide();
      removeEventListener('click', this.handleWindowClick, true);
    });
  }

  handleShow() {
    Session.set('dropdownOpen', true);
    const {
      onShow,
    } = this.props;
    this.setState({ isOpen: true }, () => {
      const { addEventListener } = window;
      onShow();
      addEventListener('click', this.handleWindowClick, true);
    });
  }

  handleWindowClick(event) {
    const { keepOpen, onHide } = this.props;
    const { isOpen } = this.state;
    const triggerElement = findDOMNode(this.trigger);
    const contentElement = findDOMNode(this.content);
    if (!(triggerElement && contentElement)) return;
    if (triggerElement && triggerElement.contains(event.target)) {
      if (keepOpen) {
        onHide();
        return;
      }
      if (isOpen) {
        this.handleHide();
        return;
      }
    }

    if (keepOpen && isOpen && !contentElement.contains(event.target)) {
      if (triggerElement) {
        const { parentElement } = triggerElement;
        if (parentElement) parentElement.focus();
      }
      onHide();
      this.handleHide();
      return;
    }

    if (keepOpen && triggerElement) {
      const { parentElement } = triggerElement;
      if (parentElement) parentElement.focus();
    }

    if (keepOpen === true) return;
    this.handleHide();
  }

  handleToggle() {
    const { isOpen } = this.state;
    return isOpen ? this.handleHide() : this.handleShow();
  }

  updateOrientation() {
    this.setState({ isPortrait: deviceInfo.isPortrait() });
  }

  render() {
    const {
      children,
      intl,
      keepOpen,
      tethered,
      placement,
      getContent,
      ...otherProps
    } = this.props;
    const { isOpen, isPortrait } = this.state;
    const { isPhone } = deviceInfo;
    const placements = placement && placement.replace(' ', '-');
    const test = isPhone && isPortrait ? {
      width: '100%',
      height: '100%',
      transform: 'translateY(0)',
    } : {
      width: '',
      height: '',
      transform: '',
    };

    let trigger = children.find((x) => x.type === DropdownTrigger);
    let content = children.find((x) => x.type === DropdownContent);

    trigger = React.cloneElement(trigger, {
      ref: (ref) => { this.trigger = ref; },
      dropdownIsOpen: isOpen,
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
      keepopen: `${keepOpen}`,
    });

    content = React.cloneElement(content, {
      ref: (ref) => {
        getContent(ref);
        this.content = ref;
      },
      'aria-expanded': isOpen,
      dropdownIsOpen: isOpen,
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
      keepopen: `${keepOpen}`,
    });

    const showCloseBtn = (isOpen && keepOpen) || (isOpen && keepOpen === null);
    return (
      <Styled.Dropdown
        aria-live={otherProps['aria-live']}
        aria-relevant={otherProps['aria-relevant']}
        aria-haspopup={otherProps['aria-haspopup']}
        aria-label={otherProps['aria-label']}
        ref={(node) => { this.dropdown = node; }}
        tabIndex={-1}
      >
        {
          tethered
            ? (
              <TetherComponent
                style={{
                  zIndex: isOpen ? 15 : -1,
                  ...test,
                }}
                attachment={
                  isPhone && isPortrait ? 'middle center'
                    : attachments[placements]
                }
                targetAttachment={
                  isPhone && isPortrait ? 'auto auto'
                    : targetAttachments[placements]
                }
                constraints={[
                  {
                    to: 'scrollParent',
                  },
                ]}
                renderTarget={(ref) => (
                  <span ref={ref}>
                    {trigger}
                  </span>
                )}
                renderElement={(ref) => (
                  <div
                    ref={ref}
                  >
                    {content}
                    {showCloseBtn
                      ? (
                        <Styled.CloseButton
                          label={intl.formatMessage(intlMessages.close)}
                          size="lg"
                          color="default"
                          onClick={this.handleHide}
                        />
                      ) : null}
                  </div>
                )}
              />
            )
            : (
              // Fix eslint rule https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-fragments.md
              <>
                {trigger}
                {content}
                {showCloseBtn
                  ? (
                    <Styled.CloseButton
                      label={intl.formatMessage(intlMessages.close)}
                      size="lg"
                      color="default"
                      onClick={this.handleHide}
                    />
                  ) : null}
              </>
            )
        }
      </Styled.Dropdown>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

Dropdown.DropdownTrigger = DropdownTrigger;
Dropdown.DropdownContent = DropdownContent;
Dropdown.DropdownList = DropdownList;
Dropdown.DropdownListSeparator = DropdownListSeparator;
Dropdown.DropdownListItem = DropdownListItem;
Dropdown.DropdownListTitle = DropdownListTitle;
export default injectIntl(Dropdown, { forwardRef: true });
