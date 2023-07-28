import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import React from 'react';

export interface PluginContextData {
    providedPlugins: ProvidedPlugins
    setProvidedPlugins: React.Dispatch<React.SetStateAction<ProvidedPlugins>>
    userListLoadedInformation: UserListLoadedInformation
    setUserListLoadedInformation: React.Dispatch<React.SetStateAction<UserListLoadedInformation>>
}

export interface UserListLoadedInformation {
    offset: number
    limit: number
} 

export interface ProvidedPlugins {
    whiteboardToolbarItems: PluginSdk.WhiteboardToolbarItem[];
    userListDropdownItems: PluginSdk.UserListDropdownItemWrapper[];
}
