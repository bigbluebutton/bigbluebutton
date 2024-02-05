import React, { useEffect, useRef } from "react";
import { GenericComponentItemProps } from "./types";


export const GenericComponentItem: React.FC<GenericComponentItemProps> = (props) => {
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
        overflow: 'hidden'
      }}
      ref={elementRef}
    >
    </div>
  );
}