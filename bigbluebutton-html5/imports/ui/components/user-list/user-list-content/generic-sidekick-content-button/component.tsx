import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { SidekickAreaOptionsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/enums';
import { RenameGenericContentSidekickAreaCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import Styled from './styles';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import GenericContentSidekickAreaMenuItem from './menu-item/component';

interface GenericComponentSidekickMenuProps {
  sidebarContentPanel: string;
  layoutContextDispatch: (...args: unknown[]) => void;
}

interface MappedMenuItems {
  [key: string]: PluginSdk.GenericContentSidekickArea[]
}

interface RenamedSectionObject {
  [oldName: string]: string;
}

const GenericSidekickContentNavButton = ({
  sidebarContentPanel, layoutContextDispatch,
}: GenericComponentSidekickMenuProps) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let genericSidekickContentExtensibleArea = [] as PluginSdk.GenericContentSidekickArea[];

  const [renamedSection, setRenamedSection] = useState<RenamedSectionObject>({});

  if (pluginsExtensibleAreasAggregatedState.genericContentItems) {
    const genericMainContent = pluginsExtensibleAreasAggregatedState.genericContentItems
      .filter((g) => g.type === GenericContentType.SIDEKICK_AREA) as PluginSdk.GenericContentSidekickArea[];
    genericSidekickContentExtensibleArea = [...genericMainContent];
  }

  const genericContentSidekickId = (id: string) => PANELS.GENERIC_CONTENT_SIDEKICK + id;

  const groupBySidekickMenuSection: MappedMenuItems = {};

  genericSidekickContentExtensibleArea.forEach((item) => {
    const { section } = item;
    let alreadySetArray = groupBySidekickMenuSection[section];
    if (alreadySetArray) {
      alreadySetArray.push(item);
    } else {
      alreadySetArray = [item];
    }
    groupBySidekickMenuSection[section] = alreadySetArray;
  });

  const handleGenericContentRename = useCallback(
    ((ev: CustomEvent<RenameGenericContentSidekickAreaCommandArguments>) => {
      const {
        id: genericContentId,
        newName,
      } = ev.detail;
      setRenamedSection((prev) => {
        const newObj = { ...prev };
        Object.entries(groupBySidekickMenuSection).forEach(([section, listOfMenu]) => {
          const isSectionIdInside = listOfMenu.some(
            (menu) => menu.id === genericContentId,
          );
          if (isSectionIdInside) {
            newObj[section] = newName;
          }
        });
        return newObj;
      });
    }) as EventListener,
    [renamedSection, pluginsExtensibleAreasAggregatedState],
  );

  useEffect(() => {
    window.addEventListener(
      SidekickAreaOptionsEnum.RENAME_GENERIC_CONTENT_SECTION,
      handleGenericContentRename,
    );

    return () => {
      window.removeEventListener(
        SidekickAreaOptionsEnum.RENAME_GENERIC_CONTENT_SECTION,
        handleGenericContentRename,
      );
    };
  }, [handleGenericContentRename]);

  if (Object.keys(groupBySidekickMenuSection).length !== 0) {
    return Object.keys(groupBySidekickMenuSection).map((section) => (
      <Styled.Section
        key={genericContentSidekickId(section)}
      >
        <Styled.Container>
          <Styled.SmallTitle>
            {renamedSection[section] || section}
          </Styled.SmallTitle>
        </Styled.Container>
        {groupBySidekickMenuSection[section].map((genericContentSidekickAreaObject) => (
          <GenericContentSidekickAreaMenuItem
            key={genericContentSidekickId(genericContentSidekickAreaObject.id)}
            sidebarContentPanel={sidebarContentPanel}
            genericSidekickContentId={genericContentSidekickId(genericContentSidekickAreaObject.id)}
            genericContentSidekickAreaObject={genericContentSidekickAreaObject}
            layoutContextDispatch={layoutContextDispatch}
          />
        ))}
      </Styled.Section>
    ));
  }
  return null;
};

export default GenericSidekickContentNavButton;
