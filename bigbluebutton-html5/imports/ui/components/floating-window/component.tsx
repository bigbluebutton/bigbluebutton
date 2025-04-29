import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Styled from './styles';

interface FloatingWindowProps {
  left: number;
  top: number;
  key: string;
  backgroundColor: string;
  boxShadow: string;
  isDraggable: boolean;
  renderFunction: (element: HTMLElement) => ReactDOM.Root;
}

const renderComponent = (
  elementRef: React.MutableRefObject<null>,
  key: string,
  top: number,
  left: number,
  backgroundColor: string,
  boxShadow: string,
) => (
  <Styled.FloatingWindowContent
    ref={elementRef}
    id={key}
    className="floating-window-content"
    style={{
      top,
      left,
      backgroundColor,
      boxShadow,
    }}
  />
);

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  left,
  top,
  key,
  backgroundColor,
  boxShadow,
  isDraggable,
  renderFunction,
}: FloatingWindowProps) => {
  const elementRef = useRef(null);

  useEffect(() => {
    let rootRef: ReactDOM.Root | null;
    if (elementRef.current && renderFunction) {
      rootRef = renderFunction(elementRef.current);
    }

    return () => {
      // extensible area injected by content functions have to
      // be explicitly unmounted, because plugins use a different
      // instance of ReactDOM
      if (rootRef) rootRef.unmount();
    };
  }, [elementRef]);

  const componentToRender = renderComponent(
    elementRef,
    key,
    top,
    left,
    backgroundColor,
    boxShadow,
  );

  return (
    isDraggable
      ? (
        <Draggable>
          {componentToRender}
        </Draggable>
      ) : componentToRender
  );
};

export default FloatingWindow;
