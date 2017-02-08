import React, { Component, PropTypes } from 'react';
import styles from '../styles';
import _ from 'underscore';
import cx from 'classnames';
import Icon from '/imports/ui/components/icon/component';
import { defineMessages, injectIntl } from 'react-intl';

const intlMessages = defineMessages({
  exitfullscreenLabel: {
    id: 'app.navBar.settingsDropdown.exitfullscreenLabel',
    defaultMessage: 'Exit fullscreen',
  },
});

const propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
};

class DropdownListItem extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('dropdown-item-label-');
    this.descID = _.uniqueId('dropdown-item-desc-');

    this.setMenuItem = this.setMenuItem.bind(this);
  }

  renderDefault() {
    let children = [];
    const { icon, label, intl } = this.props;

    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if ( icon === 'fullscreen') {
        return this.setMenuItem(icon, intl.formatMessage(intlMessages.exitfullscreenLabel));
      }
    }
    return this.setMenuItem(icon, label);
  }

  setMenuItem(icon, label) {
    return [
      (icon ? <Icon iconName={icon} key="icon" className={styles.itemIcon}/> : null),
      (<span className={styles.itemLabel} key="label">{label}</span>),
    ];
  }

  render() {
    const { label, description, children,
      injectRef, tabIndex, onClick, onKeyDown,
      className, style, } = this.props;

    return (
      <li
        ref={injectRef}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        aria-labelledby={this.labelID}
        aria-describedby={this.descID}
        className={cx(styles.item, className)}
        style={style}
        role="menuitem">
        {
          children ? children
          : this.renderDefault()
        }
        {
          label ?
          (<span id={this.labelID} key="labelledby" hidden>{label}</span>)
          : null
        }
        {
          description ?
          (<span id={this.descID} key="describedby" hidden>{description}</span>)
          : null
        }
      </li>
      );
  }
}

DropdownListItem.propTypes = propTypes;
export default injectIntl(DropdownListItem);
