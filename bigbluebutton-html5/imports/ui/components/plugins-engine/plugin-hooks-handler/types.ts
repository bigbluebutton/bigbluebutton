import React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

export interface ParameterizedHookContainerProps {
  key: string;
  parameter: PluginSdk.CustomEventParameter;
}

export interface ObjectToCustomHookContainerMap {
  count: number;
  parameter: PluginSdk.CustomEventParameter;
}

export interface ParameterizedHookContainerToRender{
  componentToRender: React.FunctionComponent<ParameterizedHookContainerProps>;
  parameter: PluginSdk.CustomEventParameter;
}
