import React, { Component, PropTypes } from 'react';
import styles from '../styles';
import _ from 'lodash';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';

const propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
};

const intlMessages = defineMessages({
  separatorLabel: {
    id: 'app.dropdownListItem.separatorLabel',
  },
  separatorDesc: {
    id: 'app.dropdownListItem.separatorDesc',
  },
});

class DropdownListItem extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('dropdown-item-label-');
    this.descID = _.uniqueId('dropdown-item-desc-');
  }

  renderDefault() {
    let children = [];
    const { icon, label } = this.props;

    return [
      (icon ? <Icon iconName={icon} key="icon" className={styles.itemIcon}/> : null),
      (<span className={styles.itemLabel} key="label">{label}</span>),
    ];
  }

  render() {
    const { children, injectRef, tabIndex, onClick, onKeyDown,
      className, style, separator, intl} = this.props;

    let { label, description} = this.props;

      if (separator) {
        label = intl.formatMessage(intlMessages.separatorLabel);
        description = intl.formatMessage(intlMessages.separatorDesc)
      }

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
