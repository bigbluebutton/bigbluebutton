import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';

class EnterAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
        <Button
          label={intl.formatMessage(intlMessages.enterSessionLabel)}
          size={'md'}
          color={'primary'}
          onClick={this.props.handleJoin}
        />
    );
  }
}

const intlMessages = defineMessages({
  enterSessionLabel: {
    id: 'app.audio.enterSessionLabel',
    description: 'enter session button label',
  },
});

export default injectIntl(EnterAudio);
