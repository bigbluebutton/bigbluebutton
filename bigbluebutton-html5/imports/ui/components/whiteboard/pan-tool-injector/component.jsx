import * as React from "react";
import ReactDOM from 'react-dom';
import { HUNDRED_PERCENT } from '/imports/utils/slideCalcUtils';
import Styled from '../styles';

const DEFAULT_TOOL_COUNT = 9;

export const PanToolInjector = (props) => {
  const {
    zoomValue,
    fitToWidth,
    isPanning,
    setIsPanning,
    formatMessage,
    tldrawAPI,
    panSelected,
    setPanSelected
  } = props;

  React.useEffect(() => {
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
  }, [panSelected]);

  React.useEffect(() => {
    if (zoomValue === HUNDRED_PERCENT) {
      setPanSelected(false);
      setIsPanning(false);
      tldrawAPI?.selectTool('select');
    }
  }, [zoomValue]);

  const parentElement = document.getElementById('TD-PrimaryTools');
  if (!parentElement) return null;

  if (parentElement?.childElementCount === DEFAULT_TOOL_COUNT) {
    parentElement?.removeChild(parentElement.children[1]);
  }

  if (parentElement?.childElementCount < DEFAULT_TOOL_COUNT) {
    const label = formatMessage({
      id: 'app.whiteboard.toolbar.tools.hand',
      description: 'presentation toolbar pan label',
    });
    const container = document.createElement('span');
    parentElement?.appendChild(container);
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
    const lastChild = parentElement?.lastChild;
    const secondChild = parentElement?.children[1];
    parentElement.insertBefore(lastChild, secondChild);
  }

  return null;
};

export default {
  PanToolInjector
};
