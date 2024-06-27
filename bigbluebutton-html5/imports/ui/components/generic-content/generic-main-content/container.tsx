import React, { useContext, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import {
  DispatcherFunction,
  GenericContentMainArea as GenericContentMainAreaFromLayout,
  Input,
  Output,
} from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import GenericMainContent from './component';
import { ACTIONS, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import getDifferenceBetweenLists from '../utils';
import { GenericContentMainAreaContainerProps } from '../types';

const GenericContentMainAreaContainer: React.FC<GenericContentMainAreaContainerProps> = (
  props: GenericContentMainAreaContainerProps,
) => {
  const { genericMainContentId } = props;

  const previousPluginGenericContainerContents = useRef<PluginSdk.GenericContentMainArea[]>([]);
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  let genericContainerContentExtensibleArea = [] as PluginSdk.GenericContentMainArea[];

  if (pluginsExtensibleAreasAggregatedState.genericContentItems) {
    const genericContainerContent = pluginsExtensibleAreasAggregatedState.genericContentItems
      .filter((g) => g.type === GenericContentType.MAIN_AREA) as PluginSdk.GenericContentMainArea[];
    genericContainerContentExtensibleArea = [
      ...genericContainerContent,
    ];
    const [
      genericContentItemsAdded,
      genericContentItemsRemoved,
    ] = getDifferenceBetweenLists(
      previousPluginGenericContainerContents.current,
      genericContainerContentExtensibleArea,
    );
    if (genericContentItemsAdded.length > 0 || genericContentItemsRemoved.length > 0) {
      previousPluginGenericContainerContents.current = [...genericContainerContentExtensibleArea];
      genericContentItemsAdded.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_CONTENT,
            open: true,
            genericContentId: g.id,
          },
        });
      });
      genericContentItemsRemoved.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_CONTENT,
            open: false,
            genericContentId: g.id,
          },
        });
      });
    }
  }

  const genericContentLayoutInformation: GenericContentMainAreaFromLayout = layoutSelectOutput(
    (i: Output) => i.genericMainContent,
  );

  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing } = cameraDock;

  if (!genericContainerContentExtensibleArea
    || genericContainerContentExtensibleArea.length === 0
    || !genericMainContentId) return null;
  return (
    <GenericMainContent
      genericContentId={genericMainContentId}
      renderFunctionComponents={genericContainerContentExtensibleArea}
      isResizing={isResizing}
      genericContentLayoutInformation={genericContentLayoutInformation}
    />
  );
};

export default GenericContentMainAreaContainer;
