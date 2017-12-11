import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import styles from '../styles';

const propTypes = {
  intl: intlShape.isRequired,
  previousSlideHandler: PropTypes.func.isRequired,
  currentSlideNum: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  previousSlideLabel: {
    id: 'app.presentation.presentationToolbar.prevSlideLabel',
    description: 'Previous slide button label',
  },
});

class PreviousSlide extends Component {
  render() {
    const {
      currentSlideNum,
      previousSlideHandler,
      intl,
    } = this.props;

    return (
      <Button
        role="button"
        aria-labelledby="prevSlideLabel"
        aria-describedby="prevSlideDesc"
        disabled={!(currentSlideNum > 1)}
        color="default"
        icon="left_arrow"
        size="md"
        onClick={previousSlideHandler}
        label={intl.formatMessage(intlMessages.previousSlideLabel)}
        hideLabel
        className={styles.prevSlide}
      />
    );
  }
}

export default injectIntl(withShortcut(PreviousSlide, 'Control+Alt+A'));

PreviousSlide.propTypes = propTypes;
