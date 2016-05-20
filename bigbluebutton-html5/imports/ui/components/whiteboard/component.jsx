import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';

export default class Whiteboard extends Component {
  render() {
    return (
      <div className={styles.whiteboard}>
        <FormattedMessage
          id="app.home.greeting"
          description="Message to greet the user."
          defaultMessage="Welcome {name}! Your presentation will begin shortly..."
          values={{ name: 'James Bond' }}
        />
        <br/>
        Today is {' '}<FormattedDate value={Date.now()} />
      </div>
    );
  }
}
