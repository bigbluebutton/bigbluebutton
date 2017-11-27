import React, { Component } from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { withShortcut } from '/imports/ui/components/shortcut/component';
import styles from '../styles';

const propTypes = {
  intl: intlShape.isRequired,
  nextSlideHandler: PropTypes.func.isRequired,
  currentSlideNum: PropTypes.number.isRequired,
  numberOfSlides: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  nextSlideLabel: {
    id: 'app.presentation.presentationToolbar.nextSlideLabel',
    description: 'Next slide button label',
  },
});

class NextSlide extends Component {
  render() {
    const {
      numberOfSlides,
      currentSlideNum,
      nextSlideHandler,
      intl,
    } = this.props;

    return (
      <Button
        role="button"
        aria-labelledby="nextSlideLabel"
        aria-describedby="nextSlideDesc"
        disabled={!(currentSlideNum < numberOfSlides)}
        color="default"
        icon="right_arrow"
        size="md"
        onClick={nextSlideHandler}
        label={intl.formatMessage(intlMessages.nextSlideLabel)}
        ref={(ref) => { this.ref = ref; }}
        hideLabel
        className={styles.nextSlide}
      />
    );
  }
}

export default injectIntl(withShortcut(NextSlide, 'Control+Shift+E'));

NextSlide.propTypes = propTypes;
