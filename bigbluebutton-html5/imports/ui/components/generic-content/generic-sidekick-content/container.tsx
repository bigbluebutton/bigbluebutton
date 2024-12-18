import React, { useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import GenericSidekickContent from './component';
import { GenericContentSidekickContainerProps } from '../types';
import logger from '/imports/startup/client/logger';
import { layoutDispatch } from '../../layout/context';

const GenericContentSidekickContainer: React.FC<GenericContentSidekickContainerProps> = (
  props: GenericContentSidekickContainerProps,
) => {
  const { genericSidekickContentId } = props;
  const genericSidekickContentIdIsolated = genericSidekickContentId.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '');
  const layoutContextDispatch = layoutDispatch();

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let genericContentSidekickAreaExtensibleArea = [] as PluginSdk.GenericContentSidekickArea[];

  if (pluginsExtensibleAreasAggregatedState.genericContentItems) {
    const genericContentSidekickArea = pluginsExtensibleAreasAggregatedState.genericContentItems
      .filter((g) => g.type === GenericContentType.SIDEKICK_AREA) as PluginSdk.GenericContentSidekickArea[];
    genericContentSidekickAreaExtensibleArea = [...genericContentSidekickArea];
  }

  const pickedGenericSidekickContent = genericContentSidekickAreaExtensibleArea
    .filter((gsc) => gsc.id === genericSidekickContentIdIsolated)[0];

  if (genericContentSidekickAreaExtensibleArea.length === 0 || !pickedGenericSidekickContent) {
    logger.error({
      logCode: 'generic_sidekick_content_not_found',
      extraInfo: {
        genericSidekickContentId,
        genericSidekickContentIdIsolated,
      },
    }, `Generic sidekick content with id ${genericSidekickContentIdIsolated} not found`);
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
    return null;
  }

  return (
    <GenericSidekickContent
      layoutContextDispatch={layoutContextDispatch}
      genericContentId={pickedGenericSidekickContent.id}
      renderFunction={pickedGenericSidekickContent.contentFunction}
      genericContentLabel={pickedGenericSidekickContent.name}
    />
  );
};

export default GenericContentSidekickContainer;
