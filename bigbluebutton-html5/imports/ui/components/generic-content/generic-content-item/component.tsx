import React, { useEffect, useRef } from 'react';
import { GenericContentItemProps } from './types';

const GenericContentItem: React.FC<GenericContentItemProps> = (props) => {
  const {
    renderFunction,
    width,
  } = props;
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && renderFunction) {
      renderFunction(elementRef.current);
    }
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
