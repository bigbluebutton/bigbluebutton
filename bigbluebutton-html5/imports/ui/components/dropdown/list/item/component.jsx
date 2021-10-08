import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import cx from 'classnames';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '../styles';

const propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  accessKey: PropTypes.string,
  tabIndex: PropTypes.number,
};

const defaultProps = {
  icon: '',
  label: '',
  description: '',
  tabIndex: 0,
  accessKey: null,
};

const messages = defineMessages({
  activeAriaLabel: {
    id: 'app.dropdown.list.item.activeLabel',
  },
});

class DropdownListItem extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('dropdown-item-label-');
    this.descID = _.uniqueId('dropdown-item-desc-');
  }

  renderDefault() {
    const {
      icon, label, iconRight, accessKey,
    } = this.props;

    return [
      (icon ? <Icon iconName={icon} key="icon" className={styles.itemIcon} /> : null),
      (
        <span className={styles.itemLabel} key="label" accessKey={accessKey}>
          {label}
        </span>
      ),
      (iconRight ? <Icon iconName={iconRight} key="iconRight" className={styles.iconRight} /> : null),
    ];
  }

  render() {
    const {
      id,
      label,
      description,
      children,
      injectRef,
      tabIndex,
      onClick,
      onKeyDown,
      className,
      style,
      intl,
      'data-test': dataTest,
    } = this.props;

    const isSelected = className && className.includes('emojiSelected');
    const _label = isSelected ? `${label} (${intl.formatMessage(messages.activeAriaLabel)})` : label;
    return (
      <li
        id={id}
        ref={injectRef}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        aria-labelledby={this.labelID}
        aria-describedby={this.descID}
        className={cx(styles.item, className)}
        style={style}
        role="menuitem"
        data-test={dataTest}
      >
        {
          children || this.renderDefault()
        }
        {
          label
            ? (<span id={this.labelID} key="labelledby" hidden>{_label}</span>)
            : null
        }
        <span id={this.descID} key="describedby" hidden>{description}</span>
      </li>
    );
  }
}

export default injectIntl(DropdownListItem);

DropdownListItem.propTypes = propTypes;
DropdownListItem.defaultProps = defaultProps;
