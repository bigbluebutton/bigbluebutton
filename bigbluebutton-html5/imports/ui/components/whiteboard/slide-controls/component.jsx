import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

export default class SlideControls extends Component {
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
      actions,
    } = this.props;

    return (
      <div id="slideControlsWrapper" className={styles.slideControlsWrapper}>
        {this.renderAriaLabelsDescs()}

        {/*Previous Slide button*/}
        <Button
          role="button"
          aria-labelledby="prevSlideLabel"
          aria-describedby="prevSlideDescrip"
          aria-controls="skipSlide slideComponent"
          disabled={currentSlideNum > 1 ? false : true}
          color={'default'}
          icon={'left-arrow'}
          size={'md'}
          onClick={actions.previousSlideHandler}
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
          disabled={currentSlideNum < numberOfSlides ? false : true}
          color={'default'}
          icon={'right-arrow'}
          size={'md'}
          onClick={actions.nextSlideHandler}
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
          onChange={actions.skipToSlideHandler}
          className={styles.skipSlide}
        >
          {this.renderSkipSlideOpts(numberOfSlides)}
        </select>
        {/*Fit to width button
        <Button
          role="button"
          aria-labelledby="fitWidthLabel"
          aria-describedby="fitWidthDescrip"
          color={'default'}
          icon={'fit-to-width'}
          size={'md'}
          circle={false}
          onClick={this.fitToWidthClickHandler}
          label={'Fit to Width'}
          hideLabel={true}
        />*/}
        {/*Fit to screen button
        <Button
          role="button"
          aria-labelledby="fitScreenLabel"
          aria-describedby="fitScreenDescrip"
          color={'default'}
          icon={'fit-to-screen'}
          size={'md'}
          circle={false}
          onClick={this.fitToScreenClickHandler}
          label={'Fit to Screen'}
          hideLabel={true}
        />*/}
        {/*Zoom slider
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
        {/*Previous Slide button aria*/}
        <div id="prevSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.prevSlideLabel"
            description="Aria label for when switching to previous slide"
            defaultMessage="Previous slide"
          />
        </div>
        <div id="prevSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.prevSlideDescrip"
            description="Aria description for when switching to previous slide"
            defaultMessage="Change the presentation to the previous slide"
          />
        </div>
        {/*Next Slide button aria*/}
        <div id="nextSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.nextSlideLabel"
            description="Aria label for when switching to next slide"
            defaultMessage="Next slide"
          />
        </div>
        <div id="nextSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.nextSlideDescrip"
            description="Aria description for when switching to next slide"
            defaultMessage="Change the presentation to the next slide"
          />
        </div>
        {/*Skip Slide drop down aria*/}
        <div id="skipSlideLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.skipSlideLabel"
            description="Aria label for when switching to a specific slide"
            defaultMessage="Skip slide"
          />
        </div>
        <div id="skipSlideDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.skipSlideDescrip"
            description="Aria description for when switching to a specific slide"
            defaultMessage="Change the presentation to a specific slide"
          />
        </div>
        {/*Fit to width button aria*/}
        <div id="fitWidthLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitWidthLabel"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Fit to width"
          />
        </div>
        <div id="fitWidthDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitWidthDescrip"
            description="Aria description to display the whole width of the slide"
            defaultMessage="Display the whole width of the slide"
          />
        </div>
        {/*Fit to screen button aria*/}
        <div id="fitScreenLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitScreenLabel"
            description="Aria label to display the whole slide"
            defaultMessage="Fit to screen"
          />
        </div>
        <div id="fitScreenDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.fitScreenDescrip"
            description="Aria label to display the whole slide"
            defaultMessage="Display the whole slide"
          />
        </div>
        {/*Zoom slider aria*/}
        <div id="zoomLabel">
          <FormattedMessage
            id="app.whiteboard.slideControls.zoomLabel"
            description="Aria label to zoom presentation"
            defaultMessage="Zoom"
          />
        </div>
        <div id="zoomDescrip">
          <FormattedMessage
            id="app.whiteboard.slideControls.zoomDescrip"
            description="Aria label to zoom presentation"
            defaultMessage="Change the zoom level of the presentation"
          />
        </div>
      </div>
    );
  }
}
