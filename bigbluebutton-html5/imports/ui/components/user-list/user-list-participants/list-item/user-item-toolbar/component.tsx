import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import UserItemToolbarProps, { ToolbarEntry } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';

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
}) => {
  const intl = useIntl();
  const renderPinnedToolbarOption = (pinnedToolbarOption: ToolbarEntry) => {
    const {
      key,
      onClick,
      dataTest,
      label,
      icon,
    } = pinnedToolbarOption;

    return (
      <Styled.ToolbarItem
        key={key}
        onClick={onClick}
        data-test={dataTest}
      >
        <Tooltip
          title={label}
        >
          <Icon
            iconName={icon}
          />
        </Tooltip>
      </Styled.ToolbarItem>
    );
  };

  const renderOtherToolbarOptions = (addSeparator: boolean, allowedOtherToolbarOptions: ToolbarEntry[]) => {
    if (allowedOtherToolbarOptions.length > 0) {
      return (
        <>
          {addSeparator && <span key={uniqueId('separator-toolbar')}> | </span>}
          <BBBMenu
            trigger={
              (
                <Styled.MoreItems
                  onClick={() => setOpenUserAction(subjectUser.userId)}
                >
                  <Tooltip
                    title={intl.formatMessage(intlMessages.more)}
                  >
                    <Icon iconName="more" />
                  </Tooltip>
                </Styled.MoreItems>
              )
            }
            actions={allowedOtherToolbarOptions}
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
      {renderOtherToolbarOptions(addSeparator, onlyAllowedOtherToolbarOptions)}
    </Styled.ToolbarContainer>
  );
};

export default UserItemToolbar;
