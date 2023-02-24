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
        setIsPanning(true);
        setPanSelected(true);
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
          color="light"
          icon="hand"
          size="md"
          aria-label={label}
          disabled={(zoomValue <= HUNDRED_PERCENT && !fitToWidth)}
          onClick={() => {
            if (!panSelected) {
              setPanSelected(true);
              setIsPanning(true);
            }
          }}
          label={label}
          hideLabel
          selected={panSelected || isPanning}
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
