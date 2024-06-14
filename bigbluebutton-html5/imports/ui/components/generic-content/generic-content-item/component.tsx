import React, { useEffect, useRef } from 'react';
import { GenericContentItemProps } from './types';

const GenericContentItem: React.FC<GenericContentItemProps> = (props) => {
  const {
    renderFunction,
  } = props;
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && renderFunction) {
      renderFunction(elementRef.current);
    }
  }, [elementRef]);

  return (
    <div
      style={{
        overflow: 'hidden',
      }}
      ref={elementRef}
    />
  );
};

export default GenericContentItem;
