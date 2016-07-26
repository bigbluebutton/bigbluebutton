import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import { callServer } from '/imports/ui/services/api/index.js'

export default class SlideControls extends Component {
  constructor(props) {
    super(props);
    this.state = {sliderValue: 100};
  }

  handleValuesChange(event) {
    console.log("handleValuesChange()");
    console.log(event.target.value);
    this.setState({
      sliderValue: event.target.value,
    });
  }

  //Change to the next slide
  nextSlide(){
    const currentSlideNum = this.props.currentSlideNum;
    callServer('publishSwitchToXSlideMessage', currentSlideNum + 1);
  }

  //Change to the previous slide
  previousSlide(){
    const currentSlideNum = this.props.currentSlideNum;
    callServer('publishSwitchToXSlideMessage', currentSlideNum - 1);
  }

  //Change to a specific slide (using dropdown menu)
  skipToSlide(event){
    const requestedSlideNum = event.target.value;
    callServer('publishSwitchToXSlideMessage', requestedSlideNum);

  }
  clickHandler(){
    console.log("test click handler");
  }
  renderSkipSlideOpts(numberOfSlides){
    // Fill drop down menu with all the slides in presentation
    let optionList = [];
    for(i = 1; i <= numberOfSlides; i++){
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

        <div className={styles.ariaLabelsDescs}>
          <p id="nextSlideLabel"> Next slide </p>
          <p id="nextSlideDescrip"> Change the presentation to the next slide </p>

          <p id="prevSlideLabel"> Previous slide </p>
          <p id="prevSlideDescrip"> Change the presentation to the previous slide </p>

          <p id="skipSlideLabel"> Skip slide</p>
          <p id="skipSlideDescrip"> Change the presentation to a specific slide </p>

          <p id="fitWidthLabel"> Fit to width </p>
          <p id="fitWidthDescrip"> Display the whole width of the slide </p>

          <p id="fitScreenLabel"> Fit to screen </p>
          <p id="fitScreenDescrip"> Display the whole slide </p>

          <p id="zoomLabel"> Zoom </p>
          <p id="zoomDescrip"> Change the zoom level of the presentation </p>
        </div>

        {/*Previous Slide button*/}
        <Button
          role="button"
          aria-labelledby="prevSlideLabel"
          aria-describedby="prevSlideDescrip"
          aria-controls="slideComponent"
          color={'default'}
          icon={'left-arrow'}
          size={'md'}
          onClick={this.previousSlide.bind(this)}
          label={'Previous Slide'}
          hideLabel={true}
        />
        {/*Next Slide button*/}
        <Button
          role="button"
          aria-labelledby="nextSlideLabel"
          aria-describedby="nextSlideDescrip"
          aria-controls="slideComponent"
          color={'default'}
          icon={'right-arrow'}
          size={'md'}
          onClick={this.nextSlide.bind(this)}
          label={'Next Slide'}
          hideLabel={true}
        />
        {/*Skip Slide drop down*/}
        <select
          role="listbox"
          aria-labelledby="skipSlideLabel"
          aria-describedby="skipSlideDescrip"
          aria-controls="slideComponent"
          aria-live="polite"
          aria-relevant="all"
          value={currentSlideNum} //indicates which option is selected
          onChange={this.skipToSlide.bind(this)}
          className={styles.scaleLikeButtons}
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
          onClick={this.clickHandler.bind(this)}
          label={'Fit to Width'}
          hideLabel={true}
        />
        {/*Fit to page button*/}
        <Button
          role="button"
          aria-labelledby="fitScreenLabel"
          aria-describedby="fitScreenDescrip"
          color={'default'}
          icon={'fit-to-screen'}
          size={'md'}
          circle={false}
          onClick={this.clickHandler.bind(this)}
          label={'Fit to Screen'}
          hideLabel={true}
        />
        {/*Zoom slider*/}
        <form
          className={styles.scaleLikeButtons}
          style={{borderRight : 0}}
        >
          <span className={styles.zoomMinMax}> 100% </span>
          <input
            role="slider"
            aria-labelledby="zoomLabel"
            aria-describedby="zoomDescrip"
            aria-valuemax="400"
            aria-valuemin="100"
            aria-valuenow={this.state.sliderValue}
            step="5"
            type="range"
            min="100"
            max="400"
            onChange={this.handleValuesChange.bind(this)}
            onInput={this.handleValuesChange.bind(this)}
            className={styles.zoomSlider}
          />
          <span className={styles.zoomMinMax}> 400% </span>
        </form>
      </div>
     );
  }
}
