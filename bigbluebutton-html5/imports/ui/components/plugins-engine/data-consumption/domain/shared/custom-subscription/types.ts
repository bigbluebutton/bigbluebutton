import {
  CustomSubscriptionArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import React from 'react';
import { EssentialHookInformation } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SubscriptionHookWithArgumentsContainerProps {
  numberOfUses: number;
  hookArguments: CustomSubscriptionArguments;
}

export interface ObjectToCustomSubscriptionHookContainerMap extends EssentialHookInformation {
  hookArguments: CustomSubscriptionArguments;
}

export interface SubscriptionHookWithArgumentContainerToRender {
  componentToRender: React.FunctionComponent<SubscriptionHookWithArgumentsContainerProps>;
  hookArguments: CustomSubscriptionArguments;
  numberOfUses: number;
  version: number;
}
