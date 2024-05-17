import React, { useContext } from 'react';
import { GenericComponentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-component/enums';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import SidekickContentMenuItem from './sidekick-menu-item/component';
import SidekickContentMenuTitle from './sidekick-menu-title/component';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

interface GenericComponentSidekickMenuProps {
  genericComponentSidekickContents: PluginSdk.GenericComponentSidekickContent[]
  sidebarContentPanel: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  currentSidekickContent: string;
}

interface MappedMenuItems {
  [key: string]: PluginSdk.GenericComponentSidekickContent[]
}

const GenericComponentSidekickMenu: React.FC<GenericComponentSidekickMenuProps> = ({
  genericComponentSidekickContents,
  sidebarContentPanel,
  layoutContextDispatch,
  currentSidekickContent,
}) => {
  const groupBySidekickMenuTitle: MappedMenuItems = {};

  genericComponentSidekickContents.forEach((item) => {
    const { menuItemTitle } = item;
    let alreadySetArray = groupBySidekickMenuTitle[menuItemTitle];
    if (alreadySetArray) {
      alreadySetArray.push(item);
    } else {
      alreadySetArray = [item];
    }
    groupBySidekickMenuTitle[menuItemTitle] = alreadySetArray;
  });
  if (Object.keys(groupBySidekickMenuTitle).length !== 0) {
    return Object.keys(groupBySidekickMenuTitle).map((itemMenuTitle) => (
      <Styled.SidekickMenuComponentWrapper
        key={itemMenuTitle}
      >
        <SidekickContentMenuTitle
          key={itemMenuTitle}
          menuItemTitle={itemMenuTitle}
        />
        {
          groupBySidekickMenuTitle[itemMenuTitle]?.map((itemToBeRendered) => (
            <SidekickContentMenuItem
              currentSidekickContent={currentSidekickContent}
              key={`${itemToBeRendered.id}-${itemMenuTitle}-${itemToBeRendered.menuItemContentMessage}`}
              sidekickContentId={itemToBeRendered.id}
              sidebarContentPanel={sidebarContentPanel}
              layoutContextDispatch={layoutContextDispatch}
              contentMessage={itemToBeRendered.menuItemContentMessage}
              iconName={itemToBeRendered.menuItemIcon}
              open={itemToBeRendered.open}
            />
          ))
        }
      </Styled.SidekickMenuComponentWrapper>
    ));
  }
  return null;
};

const GenericComponentSidekickMenuContainer: React.FC = () => {
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let genericComponentSidekickContentExtensibleArea = [] as PluginSdk.GenericComponentSidekickContent[];

  const layoutContextDispatch = layoutDispatch();

  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel, genericComponentSidekickContentId: currentSidekickContent } = sidebarContent;

  if (pluginsExtensibleAreasAggregatedState.genericComponents) {
    genericComponentSidekickContentExtensibleArea = [
      ...pluginsExtensibleAreasAggregatedState.genericComponents as PluginSdk.GenericComponentSidekickContent[],
    ].filter((p) => p.type === GenericComponentType.SIDEKICK_CONTENT);
  }
  return (
    <>
      <GenericComponentSidekickMenu
        currentSidekickContent={currentSidekickContent}
        genericComponentSidekickContents={genericComponentSidekickContentExtensibleArea}
        layoutContextDispatch={layoutContextDispatch}
        sidebarContentPanel={sidebarContentPanel}
      />
    </>
  );
};

export default GenericComponentSidekickMenuContainer;
