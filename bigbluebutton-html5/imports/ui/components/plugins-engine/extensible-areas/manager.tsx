import * as React from 'react';
import { useContext, useEffect } from 'react';
import { PluginProvidedUiItemDescriptor } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/base';
import * as uuidLib from 'uuid';
import { PluginsContext } from '../../components-data/plugin-context/context';

import PresentationToolbarPluginStateContainer from './components/presentation-toolbar/manager';
import UserListDropdownPluginStateContainer from './components/user-list-dropdown/manager';
import MediaAreaPluginStateContainer from './components/media-area/manager';
import AudioSettingsDropdownPluginStateContainer from './components/audio-settings-dropdown/manager';
import ActionBarPluginStateContainer from './components/action-bar/manager';
import AppsGalleryPluginStateContainer from './components/apps-gallery/manager';
import PresentationDropdownPluginStateContainer from './components/presentation-dropdown/manager';
import NavBarPluginStateContainer from './components/nav-bar/manager';
import OptionsDropdownPluginStateContainer from './components/options-dropdown/manager';
import CameraSettingsDropdownPluginStateContainer from './components/camera-settings-dropdown/manager';
import UserCameraDropdownPluginStateContainer from './components/user-camera-dropdown/manager';
import UserListItemAdditionalInformationPluginStateContainer from './components/user-list-item-additional-information/manager';
import {
  ExtensibleArea, ExtensibleAreaStateManagerProps,
  ExtensibleAreaComponentManager, ExtensibleAreaMap,
} from './types';
import FloatingWindowPluginStateContainer from './components/floating-window/manager';
import GenericContentPluginStateContainer from './components/generic-content/manager';
import ScreenshareHelperPluginStateContainer from './components/screenshare-helper/manager';
import UserCameraHelperPluginStateContainer from './components/user-camera-helper/manager';

const extensibleAreaMap: ExtensibleAreaMap = {};

const extensibleAreaComponentManagers: ExtensibleAreaComponentManager[] = [
  PresentationToolbarPluginStateContainer,
  UserListDropdownPluginStateContainer,
  MediaAreaPluginStateContainer,
  AudioSettingsDropdownPluginStateContainer,
  ActionBarPluginStateContainer,
  AppsGalleryPluginStateContainer,
  UserCameraHelperPluginStateContainer,
  PresentationDropdownPluginStateContainer,
  NavBarPluginStateContainer,
  OptionsDropdownPluginStateContainer,
  CameraSettingsDropdownPluginStateContainer,
  UserCameraDropdownPluginStateContainer,
  UserListItemAdditionalInformationPluginStateContainer,
  FloatingWindowPluginStateContainer,
  GenericContentPluginStateContainer,
  ScreenshareHelperPluginStateContainer,
];

function generateItemWithId<T extends PluginProvidedUiItemDescriptor>(
  item: T,
): T {
  if (!item.id) {
    item.setItemId(uuidLib.v4());
  }
  return item;
}

function aggregateExtensibleAreas(map: ExtensibleAreaMap): ExtensibleArea {
  const entries = Object.values(map);
  return {
    presentationToolbarItems: entries.flatMap((area) => area.presentationToolbarItems ?? []),
    userListDropdownItems: entries.flatMap((area) => area.userListDropdownItems ?? []),
    mediaAreaItems: entries.flatMap((area) => area.mediaAreaItems ?? []),
    audioSettingsDropdownItems: entries.flatMap((area) => area.audioSettingsDropdownItems ?? []),
    actionsBarItems: entries.flatMap((area) => area.actionsBarItems ?? []),
    appsGalleryItems: entries.flatMap((area) => area.appsGalleryItems ?? []),
    presentationDropdownItems: entries.flatMap((area) => area.presentationDropdownItems ?? []),
    navBarItems: entries.flatMap((area) => area.navBarItems ?? []),
    screenshareHelperItems: entries.flatMap((area) => area.screenshareHelperItems ?? []),
    optionsDropdownItems: entries.flatMap((area) => area.optionsDropdownItems ?? []),
    cameraSettingsDropdownItems: entries.flatMap((area) => area.cameraSettingsDropdownItems ?? []),
    userCameraDropdownItems: entries.flatMap((area) => area.userCameraDropdownItems ?? []),
    userCameraHelperItems: entries.flatMap((area) => area.userCameraHelperItems ?? []),
    userListItemAdditionalInformation: entries.flatMap(
      (area) => area.userListItemAdditionalInformation ?? [],
    ),
    floatingWindows: entries.flatMap((area) => area.floatingWindows ?? []),
    genericContentItems: entries.flatMap((area) => area.genericContentItems ?? []),
  };
}

const ExtensibleAreaStateManager = (props: ExtensibleAreaStateManagerProps) => {
  const {
    uuid,
    pluginApi,
  } = props;
  const { setPluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);

  if (!extensibleAreaMap[uuid]) {
    extensibleAreaMap[uuid] = {} as ExtensibleArea;
  }

  useEffect(() => {
    if (!extensibleAreaMap[uuid]) {
      extensibleAreaMap[uuid] = {} as ExtensibleArea;
    }

    return () => {
      delete extensibleAreaMap[uuid];
      setPluginsExtensibleAreasAggregatedState(aggregateExtensibleAreas(extensibleAreaMap));
    };
  }, [uuid, setPluginsExtensibleAreasAggregatedState]);

  return (
    <>
      {
        extensibleAreaComponentManagers.map(
          (ExtensibleAreaComponentManagerChild: ExtensibleAreaComponentManager, index: number) => (
            <ExtensibleAreaComponentManagerChild
              {
                ...{
                  key: `${uuid}-${index}`,
                  uuid,
                  generateItemWithId,
                  extensibleAreaMap,
                  pluginApi,
                }
              }
            />
          ),
        )
      }
    </>
  );
};

export default ExtensibleAreaStateManager;
