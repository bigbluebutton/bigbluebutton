import React, { useContext, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
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
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { isSharing, screenshareHasEnded } from '/imports/ui/components/screenshare/service';
import { EXTERNAL_VIDEO_STOP } from '/imports/ui/components/external-video-player/mutations';
import { PIN_NOTES } from '/imports/ui/components/notes/mutations';
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
  const { data: currentUser } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const { data: currentMeeting } = useMeeting((m) => ({ componentsFlags: m.componentsFlags }));
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const [pinSharedNotes] = useMutation(PIN_NOTES);
  const previousMainAreaIds = useRef<string[]>([]);
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
    }
  }

  const mainAreaIds = genericContainerContentExtensibleArea.map((g) => g.id);
  const mainAreaIdsKey = mainAreaIds.join(',');

  // New plugin content ejects core content, like core features do among themselves
  useEffect(() => {
    const hasNewContent = mainAreaIds.some((id) => !previousMainAreaIds.current.includes(id));
    previousMainAreaIds.current = mainAreaIds;
    if (!hasNewContent || !currentUser?.presenter) return;

    const { hasExternalVideo, isSharedNotesPinned } = currentMeeting?.componentsFlags || {};
    if (isSharing()) screenshareHasEnded();
    if (hasExternalVideo) stopExternalVideoShare();
    if (isSharedNotesPinned) pinSharedNotes({ variables: { pinned: false } });
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
