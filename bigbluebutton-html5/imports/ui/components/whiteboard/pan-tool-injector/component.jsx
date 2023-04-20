import * as React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { HUNDRED_PERCENT } from '/imports/utils/slideCalcUtils';
import Styled from '../styles';

const DEFAULT_TOOL_COUNT = 9;

class PanToolInjector extends React.Component {
  componentDidMount() {
    this.addPanTool();
  }

  componentDidUpdate(prevProps) {
    const {
      zoomValue,
      fitToWidth,
      isPanning,
      setIsPanning,
      tldrawAPI,
      panSelected,
      setPanSelected,
    } = this.props;
    if (prevProps.zoomValue !== zoomValue
      || prevProps.fitToWidth !== fitToWidth
      || prevProps.isPanning !== isPanning
      || prevProps.tldrawAPI !== tldrawAPI
      || prevProps.panSelected !== panSelected
    ) {
      this.addPanTool();
      if (panSelected) {
        setIsPanning(true);
        setPanSelected(true);
      } else {
        setIsPanning(false);
        setPanSelected(false);
      }
    }
  }

  addPanTool() {
    const {
      zoomValue,
      fitToWidth,
      setIsPanning,
      formatMessage,
      tldrawAPI,
      panSelected,
      setPanSelected,
    } = this.props;

    if (panSelected) {
      tldrawAPI?.selectTool('select');
    }

    const tools = document.querySelectorAll('[id*="TD-PrimaryTools-"]');
    tools.forEach((tool) => {
      const { classList } = tool.firstElementChild;
      if (panSelected) {
        classList.add('overrideSelect');
      } else {
        classList.remove('overrideSelect');
      }
    });

    const parentElement = document.getElementById('TD-PrimaryTools');
    if (!parentElement) return;

    if (parentElement.childElementCount === DEFAULT_TOOL_COUNT) {
      parentElement.removeChild(parentElement.children[1]);
    }

    if (parentElement.childElementCount < DEFAULT_TOOL_COUNT) {
      const label = formatMessage({
        id: 'app.whiteboard.toolbar.tools.hand',
        description: 'presentation toolbar pan label',
      });
      const container = document.createElement('span');
      parentElement.appendChild(container);
      ReactDOM.render(
        <Styled.PanTool
          key="bbb-panBtn"
          role="button"
          data-test="panButton"
          data-zoom={zoomValue}
          className={panSelected ? 'select' : 'overrideSelect'}
          color="light"
          icon="hand"
          size="md"
          label={label}
          aria-label={label}
          tooltipdelay={700}
          tooltipplacement="top"
          onClick={() => {
            setPanSelected(true);
            setIsPanning(true);
            if (!(zoomValue <= HUNDRED_PERCENT && !fitToWidth)) {
              const panButton = document.querySelector('[data-test="panButton"]');
              if (panButton) {
                panButton.classList.remove('selectOverride');
                panButton.classList.add('select');
              }
            }
          }}
          hideLabel
          {...{
            panSelected,
          }}
        />,
        container,
      );
      const { lastChild } = parentElement;
      const secondChild = parentElement.children[1];
      parentElement.insertBefore(lastChild, secondChild);
    }
  }

  render() {
    return null;
  }
}

PanToolInjector.propTypes = {
  fitToWidth: PropTypes.bool.isRequired,
  zoomValue: PropTypes.number.isRequired,
  formatMessage: PropTypes.func.isRequired,
  isPanning: PropTypes.bool.isRequired,
  setIsPanning: PropTypes.func.isRequired,
  tldrawAPI: PropTypes.shape({
    selectTool: PropTypes.func.isRequired,
  }),
  panSelected: PropTypes.bool.isRequired,
  setPanSelected: PropTypes.func.isRequired,
};

PanToolInjector.defaultProps = {
  tldrawAPI: null,
};

export default PanToolInjector;
