import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  yes: {
    id: 'app.audioModal.yes',
    description: 'Hear yourself yes',
  },
  no: {
    id: 'app.audioModal.no',
    description: 'Hear yourself no',
  },
});

const propTypes = {
  handleYes: PropTypes.func.isRequired,
  handleNo: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

class EchoTest extends Component {
  constructor(props) {
    super(props);

    this.handleYes = props.handleYes.bind(this);
    this.handleNo = props.handleNo.bind(this);
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <span className={styles.echoTest}>
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.yes)}
          icon={'thumbs_up'}
          circle
          color={'success'}
          size={'jumbo'}
          onClick={this.handleYes}
        />
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.no)}
          icon={'thumbs_down'}
          circle
          color={'danger'}
          size={'jumbo'}
          onClick={this.handleNo}
        />
      </span>
    );
  }
}

export default injectIntl(EchoTest);

EchoTest.propTypes = propTypes;
