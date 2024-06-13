import React, { useContext, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import {
  DispatcherFunction,
  GenericMainContent as GenericContentFromLayout,
  Input,
  Output,
} from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import GenericMainContent from './component';
import { ACTIONS, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import getDifferenceBetweenLists from '../utils';
import { GenericMainContentContainerProps } from '../types';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content/enums';

const GenericMainContentContainer: React.FC<GenericMainContentContainerProps> = (props: GenericMainContentContainerProps) => {
  const { genericMainContentId } = props;

  const previousPluginGenericContainerContents = useRef<PluginSdk.GenericContentMainArea[]>([]);
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  let genericContainerContentExtensibleArea = [] as PluginSdk.GenericContentMainArea[];

  if (pluginsExtensibleAreasAggregatedState.genericContents) {
      .filter((g) => g.type === GenericContentType.MAIN_AREA) as PluginSdk.GenericContentMainArea[];
    genericContainerContentExtensibleArea = [
      ...genericContainerContent,
    ];
    const [
      genericContentsAdded,
      genericContentsRemoved,
    ] = getDifferenceBetweenLists(previousPluginGenericContainerContents.current, genericContainerContentExtensibleArea);
    if (genericContentsAdded.length > 0 || genericContentsRemoved.length > 0) {
      previousPluginGenericContainerContents.current = [...genericContainerContentExtensibleArea];
      genericContentsAdded.forEach((g) => {
        layoutContextDispatch({
          type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
          value: {
            content: PRESENTATION_AREA.GENERIC_CONTENT,
            open: true,
            genericContentId: g.id,
          },
        });
      });
      genericContentsRemoved.forEach((g) => {
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

  const genericContentLayoutInformation: GenericContentFromLayout = layoutSelectOutput(
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

export default GenericMainContentContainer;
