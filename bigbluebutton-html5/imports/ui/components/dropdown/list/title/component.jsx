import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import styles from '../styles';

const intlMessages = defineMessages({
  titleContextLabel: {
    id: 'app.dropdown.list.titleContextLabel',
    description: 'adds context to dropdown list title',
  },
});

class DropdownListTitle extends Component {

  render() {
    const { label, intl } = this.props;

    return (
      <div>
        <li className={styles.actionsHeader} aria-labelledby="labelContext">{label}</li>
        <div id="labelContext" aria-label={intl.formatMessage(intlMessages.titleContextLabel)}></div>
      </div>
    );
  }
}

export default injectIntl(DropdownListTitle);
