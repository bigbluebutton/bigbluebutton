import React, { useContext, useEffect } from 'react';
import * as PluginSdk from  'bigbluebutton-html-plugin-sdk'

import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '../layout/context';
import {
  GenericComponent as GenericComponentFromLayout,
  Input,
  Output,
} from '../layout/layoutTypes';
import { PluginsContext } from '../components-data/plugin-context/context';
import { GenericComponentContainerProps } from './types';
import { ACTIONS } from '../layout/enums';
import { GenericComponentContent } from './component';


const GenericComponentContainer: React.FC<GenericComponentContainerProps> = (props: GenericComponentContainerProps) => {
    const {
      shouldShowScreenshare,
      shouldShowSharedNotes,
      shouldShowExternalVideo,
    } = props;
  
    const hasExternalVideoOnLayout: boolean = layoutSelectInput((i: Input) => i.externalVideo.hasExternalVideo);
    const hasScreenShareOnLayout: boolean = layoutSelectInput((i: Input) => i.screenShare.hasScreenShare);
    const isSharedNotesPinned: boolean = layoutSelectInput((i: Input) => i.sharedNotes.isPinned);
  
    const {
      pluginsExtensibleAreasAggregatedState,
    } = useContext(PluginsContext);
    let genericComponentExtensibleArea = [] as PluginSdk.GenericComponent[];
    if (pluginsExtensibleAreasAggregatedState.genericComponents) {
      genericComponentExtensibleArea = [
        ...pluginsExtensibleAreasAggregatedState.genericComponents as PluginSdk.GenericComponent[],
      ];
    }
    useEffect(() => {
      if ( shouldShowScreenshare || shouldShowSharedNotes || shouldShowExternalVideo ) {
        layoutContextDispatch({
          type: ACTIONS.SET_HAS_GENERIC_COMPONENT,
          value: false,
        });
      }
    }, [
      shouldShowScreenshare,
      shouldShowSharedNotes,
      shouldShowExternalVideo,
    ])
  
    const genericComponent: GenericComponentFromLayout = layoutSelectOutput((i: Output) => i.genericComponent);
    const hasGenericComponentOnLayout: boolean = layoutSelectInput((i: Input) => i.genericComponent.hasGenericComponent);
    const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
    const { isResizing } = cameraDock;
  
    const layoutContextDispatch = layoutDispatch();
    if (!hasGenericComponentOnLayout || !genericComponentExtensibleArea) return null;
    return (
      <GenericComponentContent
        hasExternalVideoOnLayout={hasExternalVideoOnLayout}
        isSharedNotesPinned={isSharedNotesPinned}
        hasScreenShareOnLayout={hasScreenShareOnLayout}
        renderFunctionComponents={genericComponentExtensibleArea}
        isResizing={isResizing}
        genericComponent={genericComponent}
      />
    );
  };
  
  export default GenericComponentContainer;
  