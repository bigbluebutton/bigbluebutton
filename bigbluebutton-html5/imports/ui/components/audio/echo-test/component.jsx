import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  confirmLabel: {
    id: 'app.audioModal.yes',
    description: 'Hear yourself yes',
  },
  disconfirmLabel: {
    id: 'app.audioModal.no',
    description: 'Hear yourself no',
  },
  confirmAriaLabel: {
    id: 'app.audioModal.yes.arialabel',
    description: 'provides better context for yes btn label',
  },
  disconfirmAriaLabel: {
    id: 'app.audioModal.no.arialabel',
    description: 'provides better context for no btn label',
  },
});

const propTypes = {
  handleYes: PropTypes.func.isRequired,
  handleNo: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class EchoTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
    this.handleYes = props.handleYes.bind(this);
    this.handleNo = props.handleNo.bind(this);
  }

  componentDidMount() {
    Session.set('inEchoTest', true);
  }

  componentWillUnmount() {
    Session.set('inEchoTest', false);
  }

  render() {
    const {
      intl,
    } = this.props;
    const { disabled } = this.state;
    const disableYesButtonClicked = (callback) => () => {
      this.setState({ disabled: true }, callback);
    };
    return (
      <Styled.EchoTest>
        <Styled.EchoTestButton
          label={intl.formatMessage(intlMessages.confirmLabel)}
          aria-label={intl.formatMessage(intlMessages.confirmAriaLabel)}
          data-test="echoYesBtn"
          icon="thumbs_up"
          disabled={disabled}
          circle
          color="success"
          size="jumbo"
          onClick={disableYesButtonClicked(this.handleYes)}
        />
        <Styled.EchoTestButton
          label={intl.formatMessage(intlMessages.disconfirmLabel)}
          aria-label={intl.formatMessage(intlMessages.disconfirmAriaLabel)}
          icon="thumbs_down"
          circle
          color="danger"
          size="jumbo"
          onClick={this.handleNo}
        />
      </Styled.EchoTest>
    );
  }
}

export default injectIntl(EchoTest);

EchoTest.propTypes = propTypes;
