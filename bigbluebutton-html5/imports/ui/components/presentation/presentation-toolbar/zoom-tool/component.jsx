import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from '../styles.scss';
import HoldButton from './holdButton/component';

const DELAY_MILLISECONDS = 200;
const STEP_TIME = 100;

export default class ZoomTool extends Component {
  static renderAriaLabelsDescs() {
    return (
      <div hidden key="hidden-div">
        <div id="zoomInLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomInLabel"
            description="Aria label for increment zoom level"
            defaultMessage="Increment zoom"
          />
        </div>
        <div id="zoomInDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomInDesc"
            description="Aria description for increment zoom level"
            defaultMessage="Increment zoom"
          />
        </div>
        <div id="zoomOutLabel">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomOutLabel"
            description="Aria label for decrement zoom level"
            defaultMessage="Decrement zoom"
          />
        </div>
        <div id="zoomOutDesc">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomOutDesc"
            description="Aria description for decrement zoom level"
            defaultMessage="Decrement zoom"
          />
        </div>
        <div id="zoomIndicator">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomIndicator"
            description="Aria label for current zoom level"
            defaultMessage="Current zoom level"
          />
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.execInterval = this.execInterval.bind(this);
    this.onChanger = this.onChanger.bind(this);
    this.setInt = 0;
    this.state = {
      stateValue: props.value,
      initialStateValue: props.value,
      mouseHolding: false,
    };
  }

  componentDidUpdate() {
    const { value } = this.props;
    const { stateValue } = this.state;
    const isDifferent = value !== stateValue;
    if (isDifferent) this.onChanger(value);
  }

  onChanger(val) {
    const {
      maxBound,
      minBound,
      change,
      value,
    } = this.props;
    const { stateValue } = this.state;
    let newValue = val;
    const isDifferent = newValue !== stateValue;

    if (newValue <= minBound) {
      newValue = minBound;
    } else if (newValue >= maxBound) {
      newValue = maxBound;
    }

    const propsIsDifferente = value !== newValue;
    if (isDifferent && propsIsDifferente) {
      this.setState({ stateValue: newValue }, () => {
        change(newValue);
      });
    }
    if (isDifferent && !propsIsDifferente) this.setState({ stateValue: newValue });
  }

  increment() {
    const {
      step,
    } = this.props;
    const { stateValue } = this.state;
    const increaseZoom = stateValue + step;
    this.onChanger(increaseZoom);
  }

  decrement() {
    const {
      step,
    } = this.props;
    const { stateValue } = this.state;
    const decreaseZoom = stateValue - step;
    this.onChanger(decreaseZoom);
  }

  execInterval(inc) {
    const { mouseHolding } = this.state;
    const exec = inc ? this.increment : this.decrement;

    const interval = () => {
      clearInterval(this.setInt);
      this.setInt = setInterval(exec, STEP_TIME);
    };

    setTimeout(() => {
      if (mouseHolding) {
        interval();
      }
    }, DELAY_MILLISECONDS);
  }

  mouseDownHandler(bool) {
    this.setState({
      mouseHolding: true,
    }, () => {
      this.execInterval(bool);
    });
  }

  mouseUpHandler() {
    this.setState({
      mouseHolding: false,
    }, () => clearInterval(this.setInt));
  }

  resetZoom() {
    const { stateValue, initialStateValue } = this.state;
    if (stateValue !== initialStateValue) this.onChanger(initialStateValue);
  }

  render() {
    const {
      value,
      minBound,
      maxBound,
    } = this.props;
    const { stateValue } = this.state;
    return (
      [
        ZoomTool.renderAriaLabelsDescs(),
        (
          <HoldButton
            key="zoom-tool-1"
            exec={this.decrement}
            value={value}
            minBound={minBound}
          >
            <Button
              key="zoom-tool-1"
              aria-labelledby="zoomOutLabel"
              aria-describedby="zoomOutDesc"
              role="button"
              label="-"
              icon="minus"
              onClick={() => { }}
              disabled={(value <= minBound)}
              className={styles.prevSlide}
              hideLabel
            />
          </HoldButton>
        ),
        (
          <Button
            key="zoom-tool-2"
            role="button"
            aria-labelledby="zoomIndicator"
            aria-describedby={stateValue}
            color="default"
            customIcon={`${stateValue}%`}
            size="md"
            onClick={() => this.resetZoom()}
            label="Reset Zoom"
            hideLabel
            className={styles.prevSlide}
          />
        ),
        (
          <HoldButton
            key="zoom-tool-3"
            exec={this.increment}
            value={value}
            maxBound={maxBound}
          >
            <Button
              key="zoom-tool-3"
              aria-labelledby="zoomInLabel"
              aria-describedby="zoomInDesc"
              role="button"
              label="+"
              icon="plus"
              onClick={() => { }}
              disabled={(value >= maxBound)}
              className={styles.skipSlide}
              hideLabel
            />
          </HoldButton>
        ),
      ]
    );
  }
}

const propTypes = {
  value: PropTypes.number.isRequired,
  change: PropTypes.func.isRequired,
  minBound: PropTypes.number.isRequired,
  maxBound: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
};

ZoomTool.propTypes = propTypes;
