import React, { useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom/client';
import { GenericContentItemProps } from './types';

const GenericContentItem: React.FC<GenericContentItemProps> = (props) => {
  const {
    renderFunction,
    width,
  } = props;
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
  }, [elementRef, renderFunction]);

  const style: React.CSSProperties = {
    height: '100%',
    overflow: 'hidden',
  };
  if (width) {
    style.width = width;
  }
  return (
    <div
      style={style}
      ref={elementRef}
    />
  );
};

export default GenericContentItem;
