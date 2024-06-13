import React, { useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import GenericSidekickContent from './component';
import { GenericSidekickContentContainerProps } from '../types';
import logger from '/imports/startup/client/logger';

const GenericSidekickContentContainer: React.FC<GenericSidekickContentContainerProps> = (
  props: GenericSidekickContentContainerProps,
) => {
  const { genericSidekickContentId } = props;
  const genericSidekickContentIdIsolated = genericSidekickContentId.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '');

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let genericSidekickContentExtensibleArea = [] as PluginSdk.GenericContentSidekickArea[];

  if (pluginsExtensibleAreasAggregatedState.genericContents) {
    const genericMainContent = pluginsExtensibleAreasAggregatedState.genericContents
      .filter((g) => g.type === GenericContentType.SIDEKICK_AREA) as PluginSdk.GenericContentSidekickArea[];
    genericSidekickContentExtensibleArea = [...genericMainContent];
  }

  if (genericSidekickContentExtensibleArea.length === 0) return null;
  const pickedGenericSidekickContent = genericSidekickContentExtensibleArea
    .filter((gsc) => gsc.id === genericSidekickContentIdIsolated)[0];

  if (!pickedGenericSidekickContent) {
    logger.error({
      logCode: 'generic_sidekick_content_not_found',
      extraInfo: {
        genericSidekickContentId,
        genericSidekickContentIdIsolated,
      },
    }, `Generic sidekick content with id ${genericSidekickContentIdIsolated} not found`);
  }

  return (
    <GenericSidekickContent
      genericContentId={pickedGenericSidekickContent.id}
      renderFunction={pickedGenericSidekickContent.contentFunction}
      genericContentLabel={pickedGenericSidekickContent.name}
    />
  );
};

export default GenericSidekickContentContainer;
