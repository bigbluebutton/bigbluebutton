import React, { useContext, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '../layout/context';
import {
  DispatcherFunction,
  GenericComponent as GenericComponentFromLayout,
  Input,
  Output,
} from '../layout/layoutTypes';
import { PluginsContext } from '../components-data/plugin-context/context';
import GenericComponentContent from './component';
import { ACTIONS, PRESENTATION_AREA } from '../layout/enums';
import getDifferenceBetweenLists from './utils';
import { GenericComponentContainerProps } from './types';

const GenericComponentContainer: React.FC<GenericComponentContainerProps> = (props: GenericComponentContainerProps) => {
  const { genericComponentId } = props;

  const previousPluginGenericComponents = useRef<PluginSdk.GenericComponent[]>([]);
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  let genericComponentExtensibleArea = [] as PluginSdk.GenericComponent[];

  if (pluginsExtensibleAreasAggregatedState.genericComponents) {
    genericComponentExtensibleArea = [
      ...pluginsExtensibleAreasAggregatedState.genericComponents as PluginSdk.GenericComponent[],
    ];
    const [
      genericComponentsAdded,
      genericComponentsRemoved,
    ] = getDifferenceBetweenLists(previousPluginGenericComponents.current, genericComponentExtensibleArea);
    if (genericComponentsAdded.length > 0 || genericComponentsRemoved.length > 0) {
      previousPluginGenericComponents.current = [...genericComponentExtensibleArea];
      genericComponentsAdded.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_COMPONENT,
            open: true,
            genericComponentId: g.id,
          },
        });
      });
      genericComponentsRemoved.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_COMPONENT,
            open: false,
            genericComponentId: g.id,
          },
        });
      });
    }
  }

  const genericComponentLayoutInformation: GenericComponentFromLayout = layoutSelectOutput(
    (i: Output) => i.genericComponent,
  );

  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing } = cameraDock;

  if (!genericComponentExtensibleArea
    || genericComponentExtensibleArea.length === 0
    || !genericComponentId) return null;
  return (
    <GenericComponentContent
      genericComponentId={genericComponentId}
      renderFunctionComponents={genericComponentExtensibleArea}
      isResizing={isResizing}
      genericComponentLayoutInformation={genericComponentLayoutInformation}
    />
  );
};

export default GenericComponentContainer;
