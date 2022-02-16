import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
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
  currentValue: {
    id: 'app.submenu.application.currentSize',
    description: 'current presentation zoom percentage aria description',
  },
});

class ZoomTool extends PureComponent {
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
      isMeteorConnected,
      step,
    } = this.props;
    const { stateZoomValue } = this.state;

    let zoomOutAriaLabel = intl.formatMessage(intlMessages.zoomOutLabel);
    if (zoomValue > minBound) {
      zoomOutAriaLabel += ` ${intl.formatNumber(((zoomValue - step) / 100), { style: 'percent' })}`;
    }

    let zoomInAriaLabel = intl.formatMessage(intlMessages.zoomInLabel);
    if (zoomValue < maxBound) {
      zoomInAriaLabel += ` ${intl.formatNumber(((zoomValue + step) / 100), { style: 'percent' })}`;
    }

    const stateZoomPct = intl.formatNumber((stateZoomValue / 100), { style: 'percent' });

    return (
      [
        (
          <HoldButton
            key="zoom-tool-1"
            exec={this.decrement}
            value={zoomValue}
            minBound={minBound}
          >
            <Styled.DecreaseZoomButton
              key="zoom-tool-1"
              aria-describedby="zoomOutDescription"
              aria-label={zoomOutAriaLabel}
              label={intl.formatMessage(intlMessages.zoomOutLabel)}
              icon="substract"
              onClick={() => { }}
              disabled={(zoomValue <= minBound) || !isMeteorConnected}
              hideLabel
            />
            <div id="zoomOutDescription" hidden>{intl.formatMessage(intlMessages.zoomOutDesc)}</div>
          </HoldButton>
        ),
        (
          <span key="zoom-tool-2">
            <Styled.ResetZoomButton
              aria-label={intl.formatMessage(intlMessages.resetZoomLabel)}
              aria-describedby="resetZoomDescription"
              disabled={(stateZoomValue === minBound) || !isMeteorConnected}
              color="default"
              customIcon={stateZoomPct}
              size="md"
              onClick={() => this.resetZoom()}
              label={intl.formatMessage(intlMessages.resetZoomLabel)}
              hideLabel
            />
            <div id="resetZoomDescription" hidden>
              {intl.formatMessage(intlMessages.currentValue, ({ 0: stateZoomPct }))}
            </div>
          </span>
        ),
        (
          <HoldButton
            key="zoom-tool-3"
            exec={this.increment}
            value={zoomValue}
            maxBound={maxBound}
          >
            <Styled.IncreaseZoomButton
              key="zoom-tool-3"
              aria-describedby="zoomInDescription"
              aria-label={zoomInAriaLabel}
              label={intl.formatMessage(intlMessages.zoomInLabel)}
              data-test="zoomInBtn"
              icon="add"
              onClick={() => { }}
              disabled={(zoomValue >= maxBound) || !isMeteorConnected}
              hideLabel
            />
            <div id="zoomInDescription" hidden>{intl.formatMessage(intlMessages.zoomInDesc)}</div>
          </HoldButton>
        ),
      ]
    );
  }
}

const propTypes = {
  intl: PropTypes.object.isRequired,
  zoomValue: PropTypes.number.isRequired,
  change: PropTypes.func.isRequired,
  minBound: PropTypes.number.isRequired,
  maxBound: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
};

ZoomTool.propTypes = propTypes;

export default injectIntl(ZoomTool);
