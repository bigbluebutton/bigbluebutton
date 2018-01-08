import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { styles } from './styles';

const propTypes = {
  intl: intlShape.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.audio.permissionsOverlay.title',
    description: 'Title for the overlay',
  },
  hint: {
    id: 'app.audio.permissionsOverlay.hint',
    description: 'Hint for the overlay',
  },
});

class PermissionsOverlay extends Component {
  constructor(props) {
    super(props);

    const broswerStyles = {
      Chrome: {
        top: '145px',
        left: '380px',
      },
      Firefox: {
        top: '210px',
        left: '605px',
      },
      Safari: {
        top: '100px',
        left: '100px',
      },
    };

    const browser = window.bowser.name;

    this.state = {
      styles: {
        top: broswerStyles[browser].top,
        left: broswerStyles[browser].left,
      },
    };
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <div className={styles.overlay}>
        <div style={this.state.styles} className={styles.hint}>
          { intl.formatMessage(intlMessages.title) }
          <small>
            { intl.formatMessage(intlMessages.hint) }
          </small>
        </div>
      </div>
    );
  }
}

PermissionsOverlay.propTypes = propTypes;

export default injectIntl(PermissionsOverlay);
