import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

const intlMessages = defineMessages({
  previousSlideLabel: {
    id: 'app.presentation.presentationToolbar.prevSlideLabel',
    description: 'Previous slide button label',
  },
  nextSlideLabel: {
    id: 'app.presentation.presentationToolbar.nextSlideLabel',
    description: 'Next slide button label',
  },
});

class PresentationToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = { sliderValue: 100 };
    this.handleValuesChange = this.handleValuesChange.bind(this);
  }

  handleValuesChange(event) {
    this.setState({ sliderValue: event.target.value });
  }

  fitToWidthClickHandler() {
    console.log('Not implemented yet');
  }

  fitToScreenClickHandler() {
    console.log('Not implemented yet');
  }

  renderSkipSlideOpts(numberOfSlides) {
    // Fill drop down menu with all the slides in presentation
    const optionList = [];
    for (i = 1; i <= numberOfSlides; i++) {
      optionList.push(
        <option
          value={i}
          key={i}
        >
        Slide {i}
        </option>,
      );
    }

    return optionList;
  }

  render() {
    const {
      currentSlideNum,
      numberOfSlides,
      actions,
      intl,
    } = this.props;

    return (
      <div id="presentationToolbarWrapper" className={styles.presentationToolbarWrapper}>
        {this.renderAriaLabelsDescs()}

        {/* Previous Slide button*/}
        <Button
          role="button"
          aria-labelledby="prevSlideLabel"
          aria-describedby="prevSlideDescrip"
          disabled={!(currentSlideNum > 1)}
          color={'default'}
          icon={'left_arrow'}
          size={'md'}
          onClick={actions.previousSlideHandler}
          label={intl.formatMessage(intlMessages.previousSlideLabel)}
          hideLabel
          className={styles.prevSlide}
        />
        {/* Skip Slide drop down*/}
        <select
          id="skipSlide"
          role="listbox"
          aria-labelledby="skipSlideLabel"
          aria-describedby="skipSlideDescrip"
          aria-live="polite"
          aria-relevant="all"
          value={currentSlideNum}
          onChange={actions.skipToSlideHandler}
          className={styles.skipSlide}
        >
          {this.renderSkipSlideOpts(numberOfSlides)}
        </select>
        {/* Next Slide button*/}
        <Button
          role="button"
          aria-labelledby="nextSlideLabel"
          aria-describedby="nextSlideDescrip"
          disabled={!(currentSlideNum < numberOfSlides)}
          color={'default'}
          icon={'right_arrow'}
          size={'md'}
          onClick={actions.nextSlideHandler}
          label={intl.formatMessage(intlMessages.nextSlideLabel)}
          hideLabel
        />

        {/* Fit to width button
        <Button
          role="button"
          aria-labelledby="fitWidthLabel"
          aria-describedby="fitWidthDescrip"
          color={'default'}
          icon={'fit_to_width'}
          size={'md'}
          circle={false}
          onClick={this.fitToWidthClickHandler}
          label={'Fit to Width'}
          hideLabel={true}
        />*/}
        {/* Fit to screen button
        <Button
          role="button"
          aria-labelledby="fitScreenLabel"
          aria-describedby="fitScreenDescrip"
          color={'default'}
          icon={'fit_to_screen'}
          size={'md'}
          circle={false}
          onClick={this.fitToScreenClickHandler}
          label={'Fit to Screen'}
          hideLabel={true}
        />*/}
        {/* Zoom slider
        <div
          className={classNames(styles.zoomWrapper, { [styles.zoomWrapperNoBorder]: true })}
        >
          <div className={styles.zoomMinMax}> 100% </div>
          <input
            role="slider"
            aria-labelledby="zoomLabel"
            aria-describedby="zoomDescrip"
            aria-valuemax="400"
            aria-valuemin="100"
            aria-valuenow={this.state.sliderValue}
            value={this.state.sliderValue}
            step="5"
            type="range"
            min="100"
            max="400"
            onChange={this.handleValuesChange}
            onInput={this.handleValuesChange}
            className={styles.zoomSlider}
          />
          <div className={styles.zoomMinMax}> 400% </div>
        </div>*/}
      </div>
    );
  }

  renderAriaLabelsDescs() {
    return (
      <div hidden >
        {/* Previous Slide button aria*/}
        <div id="prevSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.prevSlideLabel"
            description="Aria label for when switching to previous slide"
            defaultMessage="Previous slide"
          />
        </div>
        <div id="prevSlideDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.prevSlideDescrip"
            description="Aria description for when switching to previous slide"
            defaultMessage="Change the presentation to the previous slide"
          />
        </div>
        {/* Next Slide button aria*/}
        <div id="nextSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.nextSlideLabel"
            description="Aria label for when switching to next slide"
            defaultMessage="Next slide"
          />
        </div>
        <div id="nextSlideDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.nextSlideDescrip"
            description="Aria description for when switching to next slide"
            defaultMessage="Change the presentation to the next slide"
          />
        </div>
        {/* Skip Slide drop down aria*/}
        <div id="skipSlideLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.skipSlideLabel"
            description="Aria label for when switching to a specific slide"
            defaultMessage="Skip slide"
          />
        </div>
        <div id="skipSlideDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.skipSlideDescrip"
            description="Aria description for when switching to a specific slide"
            defaultMessage="Change the presentation to a specific slide"
          />
        </div>
        {/* Fit to width button aria*/}
        <div id="fitWidthLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitWidthLabel"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Fit to width"
          />
        </div>
        <div id="fitWidthDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitWidthDescrip"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Display the whole width of the slide"
          />
        </div>
        {/* Fit to screen button aria*/}
        <div id="fitScreenLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitScreenLabel"
            description="Aria label to display the whole slide"
            defaultMessage="Fit to screen"
          />
        </div>
        <div id="fitScreenDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.fitScreenDescrip"
            description="Aria label to display the whole slide"
            defaultMessage="Display the whole slide"
          />
        </div>
        {/* Zoom slider aria*/}
        <div id="zoomLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomLabel"
            description="Aria label to zoom presentation"
            defaultMessage="Zoom"
          />
        </div>
        <div id="zoomDescrip">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomDescrip"
            description="Aria label to zoom presentation"
            defaultMessage="Change the zoom level of the presentation"
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(PresentationToolbar);
