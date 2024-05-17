import React, {
  useContext,
  useEffect,
  useRef,
} from 'react';
import { GenericComponentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-component/enums';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import Styled from './styles';

interface GenericComponentSidekickContentContainerProps {
  sidekickContentId: string;
}

interface GenericComponentSidekickContentProps {
  contenteToBeRendered: PluginSdk.GenericComponentSidekickContent;
}

const GenericComponentSidekickContent: React.FC<GenericComponentSidekickContentProps> = ({
  contenteToBeRendered,
}) => {
  const genericComponentSidekickContentRef = useRef(null);

  useEffect(() => {
    if (genericComponentSidekickContentRef.current && contenteToBeRendered) {
      contenteToBeRendered.contentFunction(genericComponentSidekickContentRef.current);
    }
  }, [genericComponentSidekickContentRef, contenteToBeRendered]);

  return (
    <Styled.GenericComponentSidebarContent
      ref={genericComponentSidekickContentRef}
    />
  );
};

const GenericComponentSidekickContentContainer: React.FC<GenericComponentSidekickContentContainerProps> = ({
  sidekickContentId,
}: GenericComponentSidekickContentContainerProps) => {
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let genericComponentSidekickContentExtensibleArea = [] as PluginSdk.GenericComponentSidekickContent[];

  if (pluginsExtensibleAreasAggregatedState.genericComponents) {
    genericComponentSidekickContentExtensibleArea = [
      ...pluginsExtensibleAreasAggregatedState.genericComponents as PluginSdk.GenericComponentSidekickContent[],
    ].filter((p) => p.type === GenericComponentType.SIDEKICK_CONTENT);
  }

  const contenteToBeRendered = genericComponentSidekickContentExtensibleArea.filter(
    (item) => item.id === sidekickContentId,
  )[0];
  return (
    <GenericComponentSidekickContent
      contenteToBeRendered={contenteToBeRendered}
    />
  );
};

export default GenericComponentSidekickContentContainer;
