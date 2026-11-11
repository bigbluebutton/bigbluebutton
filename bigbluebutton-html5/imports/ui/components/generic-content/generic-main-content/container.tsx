import React, { useContext, useEffect, useRef } from 'react';
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
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useEjectPresentationAreaContent from '/imports/ui/core/hooks/useEjectPresentationAreaContent';
import Storage from '/imports/ui/services/storage/local';
import Auth from '/imports/ui/services/auth';
import { GenericContentMainAreaContainerProps } from '../types';

const MAIN_AREA_COUNT_KEY = 'pluginMainAreaContentCount';

const GenericContentMainAreaContainer: React.FC<GenericContentMainAreaContainerProps> = (
  props: GenericContentMainAreaContainerProps,
) => {
  const { genericMainContentId } = props;

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  const { data: currentUser } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const ejectPresentationAreaContent = useEjectPresentationAreaContent();
  const previousMainAreaIds = useRef<string[]>([]);
  let genericContainerContentExtensibleArea = [] as PluginSdk.GenericContentMainArea[];

  if (pluginsExtensibleAreasAggregatedState.genericContentItems) {
    genericContainerContentExtensibleArea = pluginsExtensibleAreasAggregatedState.genericContentItems
      .filter((g) => g.type === GenericContentType.MAIN_AREA) as PluginSdk.GenericContentMainArea[];
  }

  const mainAreaIds = genericContainerContentExtensibleArea.map((g) => g.id);
  const mainAreaIdsKey = mainAreaIds.join(',');

  useEffect(() => {
    const previousIds = previousMainAreaIds.current;
    previousMainAreaIds.current = mainAreaIds;
    const added = mainAreaIds.filter((id) => !previousIds.includes(id));
    const removed = previousIds.filter((id) => !mainAreaIds.includes(id));
    if (added.length === 0 && removed.length === 0) return;

    // Items without a stable id get a new one on every render of the plugin:
    // an item swapped for another takes its place in the pile instead of
    // jumping on top of the content shown over it
    const replaced = Math.min(added.length, removed.length);
    removed.slice(replaced).forEach((id) => {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.GENERIC_CONTENT,
          open: false,
          genericContentId: id,
        },
      });
    });
    added.forEach((id, index) => {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.GENERIC_CONTENT,
          open: true,
          genericContentId: id,
          replacesGenericContentId: index < replaced ? removed[index] : undefined,
        },
      });
    });

    // Only more items than before is new content, which ejects core content
    // like core features do among themselves. The count is kept per meeting in
    // this browser, so the content a plugin restores after a reload or a rejoin
    // is not shared again.
    const countKey = `${MAIN_AREA_COUNT_KEY}-${Auth.meetingID}`;
    const previousCount = Number(Storage.getItem(countKey)) || 0;
    Storage.setItem(countKey, mainAreaIds.length);
    if (mainAreaIds.length > previousCount && currentUser?.presenter) {
      ejectPresentationAreaContent('pluginContent');
    }
  }, [mainAreaIdsKey]);

  const genericContentLayoutInformation: GenericContentMainAreaFromLayout = layoutSelectOutput(
    (i: Output) => i.genericMainContent,
  );

  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing, isLocalChange } = cameraDock;

  if (!genericContainerContentExtensibleArea
    || genericContainerContentExtensibleArea.length === 0
    || !genericMainContentId) return null;
  return (
    <GenericMainContent
      genericContentId={genericMainContentId}
      renderFunctionComponents={genericContainerContentExtensibleArea}
      isResizing={isResizing}
      isLocalChange={isLocalChange}
      genericContentLayoutInformation={genericContentLayoutInformation}
    />
  );
};

export default GenericContentMainAreaContainer;
