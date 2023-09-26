import React from 'react';

export interface ParameterizedHookContainerProps {
  key: string;
  queryFromPlugin: string;
}

export interface ParameterizedHookContainerToRender{
  componentToRender: React.FunctionComponent<ParameterizedHookContainerProps>,
  query: string,
}
