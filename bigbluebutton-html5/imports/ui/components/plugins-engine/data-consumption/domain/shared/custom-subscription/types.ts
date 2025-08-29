import {
  CustomSubscriptionArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import React from 'react';
import { EssentialHookInformation } from '../types';

export interface HookWithArgumentsContainerProps {
  key: string;
  numberOfUses: number;
  hookArguments: CustomSubscriptionArguments;
}

export interface ObjectToCustomHookContainerMap extends EssentialHookInformation{
  hookArguments: CustomSubscriptionArguments;
}

export interface HookWithArgumentContainerToRender {
  componentToRender: React.FunctionComponent<HookWithArgumentsContainerProps>;
  hookArguments: CustomSubscriptionArguments;
  numberOfUses: number;
  version: number;
}
