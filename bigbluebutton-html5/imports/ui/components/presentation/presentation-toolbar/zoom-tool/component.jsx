import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from '../styles.scss';
import HoldButton from './holdButton/component';

const DELAY_MILLISECONDS = 200;
const STEP_TIME = 100;

const intlMessages = defineMessages({
  resetZoomLabel: {
    id: 'app.presentation.presentationToolbar.zoomReset',
    description: 'Reset zoom button label',
  },
  zoomInLabel: {
    id: 'app.presentation.presentationToolbar.zoomInLabel',
    description: 'Aria label for increment zoom level',
  },
  zoomInDesc: {
    id: 'app.presentation.presentationToolbar.zoomInDesc',
    description: 'Aria description for increment zoom level',
  },
  zoomOutLabel: {
    id: 'app.presentation.presentationToolbar.zoomOutLabel',
    description: 'Aria label for decrement zoom level',
  },
  zoomOutDesc: {
    id: 'app.presentation.presentationToolbar.zoomOutDesc',
    description: 'Aria description for decrement zoom level',
  },
  zoomIndicator: {
    id: 'app.presentation.presentationToolbar.zoomIndicator',
    description: 'Aria label for current zoom level',
  },
});

class ZoomTool extends Component {
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
        <div id="zoomReset">
          <FormattedMessage
            id="app.presentation.presentationToolbar.zoomReset"
            description="Aria label for reset zoom level"
            defaultMessage="Reset zoom level"
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
      stateZoomValue: props.zoomValue,
      initialstateZoomValue: props.zoomValue,
      mouseHolding: false,
    };
  }

  componentDidUpdate() {
    const { zoomValue } = this.props;
    const { stateZoomValue } = this.state;
    const isDifferent = zoomValue !== stateZoomValue;
    if (isDifferent) this.onChanger(zoomValue);
  }

  onChanger(value) {
    const {
      maxBound,
      minBound,
      change,
      zoomValue,
    } = this.props;
    const { stateZoomValue } = this.state;
    let newValue = value;
    const isDifferent = newValue !== stateZoomValue;

    if (newValue <= minBound) {
      newValue = minBound;
    } else if (newValue >= maxBound) {
      newValue = maxBound;
    }

    const propsIsDifferente = zoomValue !== newValue;
    if (isDifferent && propsIsDifferente) {
      this.setState({ stateZoomValue: newValue }, () => {
        change(newValue);
      });
    }
    if (isDifferent && !propsIsDifferente) this.setState({ stateZoomValue: newValue });
  }

  increment() {
    const {
      step,
    } = this.props;
    const { stateZoomValue } = this.state;
    const increaseZoom = stateZoomValue + step;
    this.onChanger(increaseZoom);
  }

  decrement() {
    const {
      step,
    } = this.props;
    const { stateZoomValue } = this.state;
    const decreaseZoom = stateZoomValue - step;
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
    const { stateZoomValue, initialstateZoomValue } = this.state;
    if (stateZoomValue !== initialstateZoomValue) this.onChanger(initialstateZoomValue);
  }

  render() {
    const {
      zoomValue,
      minBound,
      maxBound,
      intl,
    } = this.props;
    const { stateZoomValue } = this.state;
    return (
      [
        (
          <HoldButton
            key="zoom-tool-1"
            exec={this.decrement}
            value={zoomValue}
            minBound={minBound}
          >
            <Button
              key="zoom-tool-1"
              aria-labelledby="zoomOutLabel"
              aria-describedby="zoomOutDesc"
              aria-label={intl.formatMessage(intlMessages.zoomOutLabel)}
              label={intl.formatMessage(intlMessages.zoomOutLabel)}
              icon="minus"
              onClick={() => { }}
              disabled={(zoomValue <= minBound)}
              className={styles.prevSlide}
              hideLabel
            />
          </HoldButton>
        ),
        (
          <Button
            key="zoom-tool-2"
            aria-labelledby="zoomReset"
            aria-describedby={stateZoomValue}
            color="default"
            customIcon={`${stateZoomValue}%`}
            size="md"
            onClick={() => this.resetZoom()}
            label={intl.formatMessage(intlMessages.resetZoomLabel)}
            hideLabel
            className={styles.zoomPercentageDisplay}
          />
        ),
        (
          <HoldButton
            key="zoom-tool-3"
            exec={this.increment}
            value={zoomValue}
            maxBound={maxBound}
          >
            <Button
              key="zoom-tool-3"
              aria-labelledby="zoomInLabel"
              aria-describedby="zoomInDesc"
              aria-label={intl.formatMessage(intlMessages.zoomInLabel)}
              label={intl.formatMessage(intlMessages.zoomInLabel)}
              icon="plus"
              onClick={() => { }}
              disabled={(zoomValue >= maxBound)}
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
  zoomValue: PropTypes.number.isRequired,
  change: PropTypes.func.isRequired,
  minBound: PropTypes.number.isRequired,
  maxBound: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
};

ZoomTool.propTypes = propTypes;

export default injectIntl(ZoomTool);
