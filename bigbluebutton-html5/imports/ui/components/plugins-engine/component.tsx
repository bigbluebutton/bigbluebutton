import * as React from 'react';
import { PluginsEngineComponentProps } from './types';
import * as Styled from './styles';

const PluginsEngineComponent = (
  props: PluginsEngineComponentProps,
) => {
  const {
    containerRef,
  } = props;
  return (
    <Styled.PluginsEngine
      ref={containerRef}
    />
  );
};

export default PluginsEngineComponent;
