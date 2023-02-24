import * as React from "react";
import ReactDOM from 'react-dom';
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
      formatMessage,
      tldrawAPI,
      panSelected,
      setPanSelected
    } = this.props;
    if (prevProps.zoomValue !== zoomValue
      || prevProps.fitToWidth !== fitToWidth
      || prevProps.isPanning !== isPanning
      || prevProps.tldrawAPI !== tldrawAPI
      || prevProps.panSelected !== panSelected
    ) {
      this.addPanTool();
      if (panSelected) {
        // tldrawAPI?.selectTool('draw');
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
      isPanning,
      setIsPanning,
      formatMessage,
      tldrawAPI,
      panSelected,
      setPanSelected
    } = this.props;

    const tools = document.querySelectorAll('[id*="TD-PrimaryTools-"]');
    tools.forEach(tool => {
      const classList = tool.firstElementChild.classList;
      if (panSelected) {
        classList.add('overrideSelect');
        tldrawAPI?.selectTool('draw');
      } else {
        classList.remove('overrideSelect');
      }
    });

    if (zoomValue === HUNDRED_PERCENT) {
      setPanSelected(false);
      setIsPanning(false);
      tldrawAPI?.selectTool('select');
    }

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
          key={'bbb-panBtn'}
          role="button"
          data-test="panButton"
          data-zoom={zoomValue}
          className={"overrideSelect"}
          color="light"
          icon="hand"
          size="md"
          aria-label={label}
          disabled={(zoomValue <= HUNDRED_PERCENT && !fitToWidth)}
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
          label={label}
          hideLabel
        />,
        container
      );
      const lastChild = parentElement.lastChild;
      const secondChild = parentElement.children[1];
      parentElement.insertBefore(lastChild, secondChild);
    }
  }

  render() {
    return null;
  }
}

export default PanToolInjector;
