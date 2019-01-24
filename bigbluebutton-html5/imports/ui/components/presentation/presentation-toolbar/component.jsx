import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import browser from 'browser-detect';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import { HUNDRED_PERCENT, MAX_PERCENT, STEP } from '/imports/utils/slideCalcUtils';
import { styles } from './styles.scss';
import ZoomTool from './zoom-tool/component';


const intlMessages = defineMessages({
  previousSlideLabel: {
    id: 'app.presentation.presentationToolbar.prevSlideLabel',
    description: 'Previous slide button label',
  },
  nextSlideLabel: {
    id: 'app.presentation.presentationToolbar.nextSlideLabel',
    description: 'Next slide button label',
  },
  goToSlide: {
    id: 'app.presentation.presentationToolbar.goToSlide',
    description: 'button for slide select',
  },
  fitToWidth: {
    id: 'app.presentation.presentationToolbar.fitToWidth',
    description: 'button for fit to width',
  },
});

class PresentationToolbar extends Component {
  static renderAriaLabelsDescs() {
    return (
      <div hidden>
        {/* Previous Slide button aria */}
        <div id="prevSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.prevSlideLabel"
            description="Aria label for when switching to previous slide"
            defaultMessage="Previous slide"
          />
        </div>
        <div id="prevSlideDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.prevSlideDesc"
            description="Aria description for when switching to previous slide"
            defaultMessage="Change the presentation to the previous slide"
          />
        </div>
        {/* Next Slide button aria */}
        <div id="nextSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.nextSlideLabel"
            description="Aria label for when switching to next slide"
            defaultMessage="Next slide"
          />
        </div>
        <div id="nextSlideDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.nextSlideDesc"
            description="Aria description for when switching to next slide"
            defaultMessage="Change the presentation to the next slide"
          />
        </div>
        {/* Skip Slide drop down aria */}
        <div id="skipSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.skipSlideLabel"
            description="Aria label for when switching to a specific slide"
            defaultMessage="Skip slide"
          />
        </div>
        <div id="skipSlideDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.skipSlideDesc"
            description="Aria description for when switching to a specific slide"
            defaultMessage="Change the presentation to a specific slide"
          />
        </div>
        {/* Fit to width button aria */}
        <div id="fitWidthLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitWidthLabel"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Fit to width"
          />
        </div>
        <div id="fitWidthDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitWidthDesc"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Display the whole width of the slide"
          />
        </div>
        {/* Fit to screen button aria */}
        <div id="fitScreenLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitScreenLabel"
            description="Aria label to display the whole slide"
            defaultMessage="Fit to screen"
          />
        </div>
        <div id="fitScreenDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitScreenDesc"
            description="Aria label to display the whole slide"
            defaultMessage="Display the whole slide"
          />
        </div>
        {/* Zoom slider aria */}
        <div id="zoomLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomLabel"
            description="Aria label to zoom presentation"
            defaultMessage="Zoom"
          />
        </div>
        <div id="zoomDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomDesc"
            description="Aria label to zoom presentation"
            defaultMessage="Change the zoom level of the presentation"
          />
        </div>
      </div>
    );
  }


  constructor(props) {
    super(props);

    this.state = {
      sliderValue: 100,
    };
    this.handleValuesChange = this.handleValuesChange.bind(this);
    this.handleSkipToSlideChange = this.handleSkipToSlideChange.bind(this);
    this.change = this.change.bind(this);
    this.setInt = 0;
  }

  handleSkipToSlideChange(event) {
    const { actions } = this.props;
    const requestedSlideNum = Number.parseInt(event.target.value, 10);
    actions.skipToSlideHandler(requestedSlideNum);
  }

  handleValuesChange(event) {
    const { sliderValue } = this.state;
    this.setState(
      { sliderValue: event.target.value },
      () => this.handleZoom(sliderValue),
    );
  }

  change(value) {
    const { zoomChanger } = this.props;
    zoomChanger(value);
  }

  renderSkipSlideOpts(numberOfSlides) {
    // Fill drop down menu with all the slides in presentation
    const { intl } = this.props;
    const optionList = [];
    for (let i = 1; i <= numberOfSlides; i += 1) {
      optionList.push((
        <option
          value={i}
          key={i}
        >
          {
            intl.formatMessage(intlMessages.goToSlide, { 0: i })
          }
        </option>));
    }

    return optionList;
  }

  render() {
    const {
      currentSlideNum,
      numberOfSlides,
      fitToWidthHandler,
      actions,
      intl,
      zoom,
    } = this.props;

    const BROWSER_RESULTS = browser();
    const isMobileBrowser = BROWSER_RESULTS.mobile
      || BROWSER_RESULTS.os.includes('Android');
    return (
      <div id="presentationToolbarWrapper" className={styles.presentationToolbarWrapper}>
        {PresentationToolbar.renderAriaLabelsDescs()}
        {
          <span className={styles.presentationControls}>
            <Button
              role="button"
              aria-labelledby="prevSlideLabel"
              aria-describedby="prevSlideDesc"
              disabled={!(currentSlideNum > 1)}
              color="default"
              icon="left_arrow"
              size="md"
              onClick={actions.previousSlideHandler}
              label={intl.formatMessage(intlMessages.previousSlideLabel)}
              hideLabel
              className={styles.prevSlide}
            />
            <select
              /*
              <select> has an implicit role of listbox, no need to define
              role="listbox" explicitly
              */
              id="skipSlide"
              aria-labelledby="skipSlideLabel"
              aria-describedby="skipSlideDesc"
              aria-live="polite"
              aria-relevant="all"
              value={currentSlideNum}
              onChange={this.handleSkipToSlideChange}
              className={styles.skipSlideSelect}
            >
              {this.renderSkipSlideOpts(numberOfSlides)}
            </select>
            <Button
              role="button"
              aria-labelledby="nextSlideLabel"
              aria-describedby="nextSlideDesc"
              disabled={!(currentSlideNum < numberOfSlides)}
              color="default"
              icon="right_arrow"
              size="md"
              onClick={actions.nextSlideHandler}
              label={intl.formatMessage(intlMessages.nextSlideLabel)}
              hideLabel
              className={styles.skipSlide}
            />
          </span>
        }
        {
          !isMobileBrowser
            ? (
              <span className={styles.zoomWrapper}>
                <ZoomTool
                  value={zoom}
                  change={this.change}
                  minBound={HUNDRED_PERCENT}
                  maxBound={MAX_PERCENT}
                  step={STEP}
                />
              </span>
            )
            : null
        }
        <span className={styles.presentationControls}>
          <Button
            role="button"
            aria-labelledby="fitWidthLabel"
            aria-describedby="fitWidthDesc"
            color="default"
            icon="fit_to_width"
            size="md"
            circle={false}
            onClick={fitToWidthHandler}
            label={intl.formatMessage(intlMessages.fitToWidth)}
            hideLabel
            className={styles.skipSlide}
          />
        </span>
        {/* Fit to screen button
        <Button
          role="button"
          aria-labelledby="fitScreenLabel"
          aria-describedby="fitScreenDesc"
          color={'default'}
          icon={'fit_to_screen'}
          size={'md'}
          circle={false}
          onClick={this.fitToScreenClickHandler}
          label={'Fit to Screen'}
          hideLabel={true}
        /> */}
      </div>
    );
  }
}

PresentationToolbar.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,
  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,
  // Actions required for the presenter toolbar
  actions: PropTypes.shape({
    nextSlideHandler: PropTypes.func.isRequired,
    previousSlideHandler: PropTypes.func.isRequired,
    skipToSlideHandler: PropTypes.func.isRequired,
  }).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectWbResizeEvent(injectIntl(PresentationToolbar));
