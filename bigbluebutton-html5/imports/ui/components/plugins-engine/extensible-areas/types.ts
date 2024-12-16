import * as React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginProvidedUiItemDescriptor } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/base';

export interface ExtensibleAreaStateManagerProps {
  uuid: string;
  pluginApi: PluginSdk.PluginApi;
}

export interface ExtensibleArea {
  presentationToolbarItems: PluginSdk.PresentationToolbarInterface[];
  userListDropdownItems: PluginSdk.UserListDropdownInterface[];
  actionButtonDropdownItems: PluginSdk.ActionButtonDropdownInterface[];
  audioSettingsDropdownItems: PluginSdk.AudioSettingsDropdownInterface[];
  actionsBarItems: PluginSdk.ActionsBarInterface[];
  presentationDropdownItems: PluginSdk.PresentationDropdownInterface[];
  navBarItems: PluginSdk.NavBarInterface[];
  screenshareHelperItems: PluginSdk.ScreenshareHelperInterface[];
  optionsDropdownItems: PluginSdk.OptionsDropdownInterface[];
  cameraSettingsDropdownItems: PluginSdk.CameraSettingsDropdownInterface[];
  userCameraDropdownItems: PluginSdk.UserCameraDropdownInterface[];
  userCameraHelperItems: PluginSdk.UserCameraHelperInterface[];
  userListItemAdditionalInformation: PluginSdk.UserListItemAdditionalInformationInterface[];
  floatingWindows: PluginSdk.FloatingWindowInterface[]
  genericContentItems: PluginSdk.GenericContentInterface[]
}

/**
 * @description This represents the map containing the state provided by
 * each plugin with its own UUID.
 * @example {UUID -> Plugin information} // Maps the UUID from the
 * loaded plugin to object it will render
 * {"0005538e-5844-44e4-a405-0cad635bee19": {presentationToolbarItems: [{id: "123",
 *  label: "I am a plugin", ...restOfObject}]}}
 */
export type ExtensibleAreaMap = {
  [uuid: string]: ExtensibleArea;
}

export interface ExtensibleAreaComponentManagerProps {
  uuid: string;
  generateItemWithId<T extends PluginProvidedUiItemDescriptor>(
      item: T): T;
  extensibleAreaMap: ExtensibleAreaMap;
  pluginApi: PluginSdk.PluginApi;
}

export type ExtensibleAreaComponentManager = React.FC<ExtensibleAreaComponentManagerProps>;
