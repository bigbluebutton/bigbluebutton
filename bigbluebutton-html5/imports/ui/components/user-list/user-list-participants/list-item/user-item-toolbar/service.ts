import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UserListDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-dropdown-item/enums';
import { DropdownItem } from './types';

export const makeDropdownPluginItem: (
  userDropdownItems: PluginSdk.UserListDropdownInterface[]) => DropdownItem[] = (
    userDropdownItems: PluginSdk.UserListDropdownInterface[],
  ) => userDropdownItems.map(
    (userDropdownItem: PluginSdk.UserListDropdownInterface) => {
      const returnValue: DropdownItem = {
        isSeparator: false,
        key: userDropdownItem.id,
        iconRight: undefined,
        onClick: undefined,
        label: undefined,
        icon: undefined,
        tooltip: undefined,
        textColor: undefined,
        allowed: undefined,
        dataTest: undefined,
      };
      switch (userDropdownItem.type) {
        case UserListDropdownItemType.OPTION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownOption;
          returnValue.label = dropdownButton.label;
          returnValue.tooltip = dropdownButton.tooltip;
          returnValue.icon = dropdownButton.icon;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.onClick = dropdownButton.onClick;
          returnValue.dataTest = dropdownButton.dataTest;
          break;
        }
        case UserListDropdownItemType.FIXED_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownFixedContentInformation;
          returnValue.label = dropdownButton.label;
          returnValue.icon = dropdownButton.icon;
          returnValue.iconRight = dropdownButton.iconRight;
          returnValue.textColor = dropdownButton.textColor;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.dataTest = dropdownButton.dataTest;
          break;
        }
        case UserListDropdownItemType.GENERIC_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownGenericContentInformation;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.contentFunction = dropdownButton.contentFunction;
          returnValue.dataTest = dropdownButton.dataTest;
          break;
        }
        case UserListDropdownItemType.SEPARATOR: {
          const dropdownSeparator = userDropdownItem as PluginSdk.UserListDropdownSeparator;
          returnValue.allowed = true;
          returnValue.isSeparator = true;
          returnValue.dataTest = dropdownSeparator.dataTest;
          break;
        }
        default:
          break;
      }
      return returnValue;
    },
  );

export default makeDropdownPluginItem;
