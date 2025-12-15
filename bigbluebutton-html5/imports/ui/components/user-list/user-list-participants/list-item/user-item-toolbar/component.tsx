import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UserListDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-dropdown-item/enums';
import UserItemToolbarProps, { ToolbarEntry } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';
import makeDropdownPluginItem from './service';

const intlMessages = defineMessages({
  more: {
    id: 'app.userList.more',
    description: 'Text for identifying more options',
  },
});

const UserItemToolbar: React.FC<UserItemToolbarProps> = ({
  subjectUser,
  pinnedToolbarOptions = [],
  otherToolbarOptions = [],
  setOpenUserAction,
  open,
  userListDropdownItems = [],
}) => {
  const intl = useIntl();
  const userDropdownItems = userListDropdownItems.filter(
    (item: PluginSdk.UserListDropdownInterface) => (subjectUser?.userId === item?.userId),
  );
  const renderPinnedToolbarOption = (pinnedToolbarOption: ToolbarEntry) => {
    const {
      key,
      onClick,
      dataTest,
      label,
      icon,
      disabled,
    } = pinnedToolbarOption;

    if (icon) {
      return (
        <Styled.ToolbarItem
          key={key}
          onClick={onClick}
          data-test={dataTest}
          disabled={disabled}
        >
          <Tooltip
            title={label}
          >
            <Icon iconName={icon} />
          </Tooltip>
        </Styled.ToolbarItem>
      );
    }

    return (
      <Styled.ToolbarItem
        key={key}
        onClick={onClick}
        data-test={dataTest}
        disabled={disabled}
        hasText
      >
        {label}
      </Styled.ToolbarItem>
    );
  };

  const renderOtherToolbarOptions = (
    addSeparator: boolean,
    allowedOtherToolbarOptions: ToolbarEntry[],
    userDropdownItems: PluginSdk.UserListDropdownInterface[],
  ) => {
    if (allowedOtherToolbarOptions.length > 0 || userDropdownItems.length > 0) {
      const beforeUserDropdownItems = userDropdownItems.filter((item) => (
        item?.type === UserListDropdownItemType.FIXED_CONTENT_INFORMATION
        || item?.type === UserListDropdownItemType.GENERIC_CONTENT_INFORMATION
        || (item?.type === UserListDropdownItemType.SEPARATOR
          && (item as PluginSdk.UserListDropdownSeparator)?.position
          === PluginSdk.UserListDropdownSeparatorPosition.BEFORE)
      ));

      const afterUserDropdownItems = userDropdownItems.filter((item) => (
        item?.type !== UserListDropdownItemType.FIXED_CONTENT_INFORMATION
          && item?.type !== UserListDropdownItemType.GENERIC_CONTENT_INFORMATION
          && !(item?.type === UserListDropdownItemType.SEPARATOR
            && (item as PluginSdk.UserListDropdownSeparator)?.position
            === PluginSdk.UserListDropdownSeparatorPosition.BEFORE)
      ));
      const actions = [
        ...makeDropdownPluginItem(beforeUserDropdownItems),
        ...allowedOtherToolbarOptions,
        ...makeDropdownPluginItem(afterUserDropdownItems),
      ];
      return (
        <>
          {addSeparator && <Styled.Pipe key={uniqueId('separator-toolbar')}> | </Styled.Pipe>}
          <BBBMenu
            trigger={
              (
                <Styled.MoreItems
                  onClick={() => setOpenUserAction(subjectUser.userId)}
                  data-test="moreOptionsUserItemButton"
                >
                  <Tooltip
                    title={intl.formatMessage(intlMessages.more)}
                  >
                    <Icon iconName="more" />
                  </Tooltip>
                </Styled.MoreItems>
              )
            }
            actions={actions}
            onCloseCallback={() => {
              setOpenUserAction(null);
            }}
            open={open}
          />
        </>
      );
    }
    return null;
  };

  if (pinnedToolbarOptions.length === 0 && otherToolbarOptions.length === 0) return null;

  const onlyAllowedPinnedToolbarOptions = pinnedToolbarOptions.filter((pinnedToolbarOption) => (
    pinnedToolbarOption.allowed));
  const onlyAllowedOtherToolbarOptions = otherToolbarOptions.filter((otherToolbarOption) => (
    otherToolbarOption.allowed));

  if (onlyAllowedPinnedToolbarOptions.length === 0 && onlyAllowedOtherToolbarOptions.length === 0) return null;
  const addSeparator = onlyAllowedPinnedToolbarOptions.length > 0;

  return (
    <Styled.ToolbarContainer>
      {onlyAllowedPinnedToolbarOptions.map((allowedPinnedToolbarOption) => (
        renderPinnedToolbarOption(allowedPinnedToolbarOption)
      ))}
      {renderOtherToolbarOptions(addSeparator, onlyAllowedOtherToolbarOptions, userDropdownItems)}
    </Styled.ToolbarContainer>
  );
};

export default UserItemToolbar;
