import React from 'react';
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

const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
const SHORTCUT_COMBO = SHORTCUTS_CONFIG.next_slide.keys;

class NextSlide extends React.PureComponent {
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
        hideLabel
        className={styles.nextSlide}
      />
    );
  }
}

export default injectIntl(withShortcut(NextSlide, SHORTCUT_COMBO));

NextSlide.propTypes = propTypes;
