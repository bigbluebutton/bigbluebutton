import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import { callServer } from '/imports/ui/services/api/index.js';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

export default class SlideControls extends Component {
  constructor(props) {
    super(props);

    this.state = { sliderValue: 100 };

    this.nextSlide = this.nextSlide.bind(this);
    this.previousSlide = this.previousSlide.bind(this);
    this.skipToSlide = this.skipToSlide.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
    this.handleValuesChange = this.handleValuesChange.bind(this);
  }

  handleValuesChange(event) {
    this.setState({ sliderValue: event.target.value });
  }

  // Change to the next slide
  nextSlide() {
    const currentSlideNum = this.props.currentSlideNum;
    if (this.nextSlideAvailable()) {
      callServer('publishSwitchToXSlideMessage', currentSlideNum + 1);
    }
  }

  nextSlideAvailable() {
    const currentSlideNum = this.props.currentSlideNum;
    let nextSlideAvailable = true;

    if (currentSlideNum == this.props.numberOfSlides) {
      nextSlideAvailable = false;
    }

    return nextSlideAvailable;
  }

  // Change to the previous slide
  previousSlide() {
    const currentSlideNum = this.props.currentSlideNum;

    if (this.prevSlideAvailable()) {
      callServer('publishSwitchToXSlideMessage', currentSlideNum - 1);
    }
  }

  prevSlideAvailable() {
    const currentSlideNum = this.props.currentSlideNum;
    let prevSlideAvailable = true;

    if (currentSlideNum == 1) {
      prevSlideAvailable = false;
    }

    return prevSlideAvailable;
  }

  // Change to a specific slide (using dropdown menu)
  skipToSlide(event) {
    const requestedSlideNum = event.target.value;
    callServer('publishSwitchToXSlideMessage', requestedSlideNum);
  }

  clickHandler(buttonComponent) {
    console.log('SlideControls::clickHandler()');
  }

  renderSkipSlideOpts(numberOfSlides) {
    // Fill drop down menu with all the slides in presentation
    let optionList = [];
    for (i = 1; i <= numberOfSlides; i++) {
      optionList.push(
        <option
          value={i}
          key={i}
          role="option"
          aria-controls="slideComponent"
        >
        Slide {i}
        </option>
      );
    }

    return optionList;
  }

  render() {
    const {
      currentSlideNum,
      numberOfSlides,
    } = this.props;

    return (
      <div id="slideControls" className={styles.slideControlsDiv}>
        {this.renderAriaLabelsDescs()}

        {/*Previous Slide button*/}
        <Button
          role="button"
          aria-labelledby="prevSlideLabel"
          aria-describedby="prevSlideDescrip"
          aria-controls="skipSlide slideComponent"
          disabled={this.prevSlideAvailable() ? false : true}
          color={'default'}
          icon={'left-arrow'}
          size={'md'}
          onClick={this.previousSlide}
          label={'Previous Slide'}
          hideLabel={true}
          className={styles.prevSlide}
        />
        {/*Next Slide button*/}
        <Button
          role="button"
          aria-labelledby="nextSlideLabel"
          aria-describedby="nextSlideDescrip"
          aria-controls="skipSlide slideComponent"
          disabled={this.nextSlideAvailable() ? false : true}
          color={'default'}
          icon={'right-arrow'}
          size={'md'}
          onClick={this.nextSlide}
          label={'Next Slide'}
          hideLabel={true}
        />
        {/*Skip Slide drop down*/}
        <select
          id="skipSlide"
          role="listbox"
          aria-labelledby="skipSlideLabel"
          aria-describedby="skipSlideDescrip"
          aria-controls="slideComponent"
          aria-live="polite"
          aria-relevant="all"
          value={currentSlideNum}
          onChange={this.skipToSlide}
          className={styles.skipSlide}
        >
          {this.renderSkipSlideOpts(numberOfSlides)}
        </select>
        {/*Fit to width button*/}
        <Button
          role="button"
          aria-labelledby="fitWidthLabel"
          aria-describedby="fitWidthDescrip"
          color={'default'}
          icon={'fit-to-width'}
          size={'md'}
          circle={false}
          onClick={this.clickHandler}
          label={'Fit to Width'}
          hideLabel={true}
        />
        {/*Fit to screen button*/}
        <Button
          role="button"
          aria-labelledby="fitScreenLabel"
          aria-describedby="fitScreenDescrip"
          color={'default'}
          icon={'fit-to-screen'}
          size={'md'}
          circle={false}
          onClick={this.clickHandler}
          label={'Fit to Screen'}
          hideLabel={true}
        />
        {/*Zoom slider*/}
        <form
          className={classNames(styles.zoomForm, { [styles.zoomFormNoBorder]: true })}
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
        </form>
      </div>
     );
  }

  renderAriaLabelsDescs() {
    return (
      <div className={styles.ariaLabelsDescs}>
        {/*Previous Slide button aria*/}
        <p id="prevSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.prevSlideLabel"
            description="Aria label for when switching to previous slide"
            defaultMessage="Previous slide"
          />
        </p>
        <p id="prevSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.prevSlideDescrip"
            description="Aria description for when switching to previous slide"
            defaultMessage="Change the presentation to the previous slide"
          />
        </p>
        {/*Next Slide button aria*/}
        <p id="nextSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.nextSlideLabel"
            description="Aria label for when switching to next slide"
            defaultMessage="Next slide"
          />
        </p>
        <p id="nextSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.nextSlideDescrip"
            description="Aria description for when switching to next slide"
            defaultMessage="Change the presentation to the next slide"
          />
        </p>
        {/*Skip Slide drop down aria*/}
        <p id="skipSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.skipSlideLabel"
            description="Aria label for when switching to a specific slide"
            defaultMessage="Skip slide"
          />
        </p>
        <p id="skipSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.skipSlideDescrip"
            description="Aria description for when switching to a specific slide"
            defaultMessage="Change the presentation to a specific slide"
          />
        </p>
        {/*Fit to width button aria*/}
        <p id="fitWidthLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitWidthLabel"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Fit to width"
          />
        </p>
        <p id="fitWidthDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitWidthDescrip"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Display the whole width of the slide"
          />
        </p>
        {/*Fit to screen button aria*/}
        <p id="fitScreenLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitScreenLabel"
            description="Aria label to display the whole slide"
            defaultMessage="Fit to screen"
          />
        </p>
        <p id="fitScreenDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitScreenDescrip"
            description="Aria label to display the whole slide"
            defaultMessage="Display the whole slide"
          />
        </p>
        {/*Zoom slider aria*/}
        <p id="zoomLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.zoomLabel"
            description="Aria label to zoom presentation"
            defaultMessage="Zoom"
          />
        </p>
        <p id="zoomDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.zoomDescrip"
            description="Aria label to zoom presentation"
            defaultMessage="Change the zoom level of the presentation"
          />
        </p>
      </div>
    );
  }
}
