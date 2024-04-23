import React, { useContext, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GenericComponentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-component/enums';

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
  const { genericComponentMainContentId } = props;

  const previousPluginGenericComponents = useRef<PluginSdk.GenericComponent[]>([]);
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  let genericComponentMainContentExtensibleArea = [] as PluginSdk.GenericComponent[];

  if (pluginsExtensibleAreasAggregatedState.genericComponents) {
    genericComponentMainContentExtensibleArea = [
      ...pluginsExtensibleAreasAggregatedState.genericComponents as PluginSdk.GenericComponent[],
    ].filter((p) => p.type === GenericComponentType.MAIN_CONTENT);
    const [
      genericComponentMainContentsAdded,
      genericComponentMainContentsRemoved,
    ] = getDifferenceBetweenLists(previousPluginGenericComponents.current, genericComponentMainContentExtensibleArea);
    if (genericComponentMainContentsAdded.length > 0 || genericComponentMainContentsRemoved.length > 0) {
      previousPluginGenericComponents.current = [...genericComponentMainContentExtensibleArea];
      genericComponentMainContentsAdded.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_COMPONENT_MAIN_CONTENT,
            open: true,
            genericComponentMainContentId: g.id,
          },
        });
      });
      genericComponentMainContentsRemoved.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_COMPONENT_MAIN_CONTENT,
            open: false,
            genericComponentMainContentId: g.id,
          },
        });
      });
    }
  }

  const genericComponentMainContentLayoutInformation: GenericComponentFromLayout = layoutSelectOutput(
    (i: Output) => i.genericComponentMainContent,
  );

  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing } = cameraDock;

  if (!genericComponentMainContentExtensibleArea
    || genericComponentMainContentExtensibleArea.length === 0
    || !genericComponentMainContentId) return null;
  return (
    <GenericComponentContent
      genericComponentMainContentId={genericComponentMainContentId}
      renderFunctionComponents={genericComponentMainContentExtensibleArea}
      isResizing={isResizing}
      genericComponentMainContentLayoutInformation={genericComponentMainContentLayoutInformation}
    />
  );
};

export default GenericComponentContainer;
