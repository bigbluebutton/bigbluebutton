import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import Styled from './styles';
import { Position } from './types';
import useEnforceBoundariesOnWindowResize from './hooks';

interface FloatingWindowProps {
  left: number;
  top: number;
  id: string;
  backgroundColor: string;
  boxShadow: string;
  isDraggable: boolean;
  renderFunction: (element: HTMLElement) => ReactDOM.Root;
}

const renderComponent = (
  elementRef: React.RefObject<HTMLDivElement>,
  id: string,
  backgroundColor: string,
  boxShadow: string,
) => (
  <Styled.FloatingWindowContent
    ref={elementRef}
    id={id}
    className="floating-window-content"
    style={{
      backgroundColor,
      boxShadow,
    }}
  />
);

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  left,
  top,
  id,
  backgroundColor,
  boxShadow,
  isDraggable,
  renderFunction,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: left, y: top });

  useEffect(() => {
    let rootRef: ReactDOM.Root | null;
    if (contentRef.current && renderFunction) {
      rootRef = renderFunction(contentRef.current);
    }

    return () => {
      // extensible area injected by content functions have to
      // be explicitly unmounted, because plugins use a different
      // instance of ReactDOM
      if (rootRef) rootRef.unmount();
    };
  }, [contentRef]);

  useEnforceBoundariesOnWindowResize(
    contentRef,
    setPosition,
  );

  const componentToRender = renderComponent(
    contentRef,
    id,
    backgroundColor,
    boxShadow,
  );

  return (
    isDraggable ? (
      <Draggable
        bounds="parent"
        position={position}
        onDrag={(_, data) => setPosition({ x: data.x, y: data.y })}
      >
        {componentToRender}
      </Draggable>
    ) : (
      componentToRender
    )
  );
};

export default FloatingWindow;
