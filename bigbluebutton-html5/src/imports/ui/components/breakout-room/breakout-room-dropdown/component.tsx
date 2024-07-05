import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import BBBMenu from '/imports/ui/components/common/menu/component';
import CreateBreakoutRoomContainerGraphql from '../create-breakout-room/component';
import Trigger from '/imports/ui/components/common/control-header/right/component';

const intlMessages = defineMessages({
  options: {
    id: 'app.breakout.dropdown.options',
    description: 'Breakout options label',
  },
  manageDuration: {
    id: 'app.breakout.dropdown.manageDuration',
    description: 'Manage duration label',
  },
  manageUsers: {
    id: 'app.breakout.dropdown.manageUsers',
    description: 'Manage users label',
  },
  destroy: {
    id: 'app.breakout.dropdown.destroyAll',
    description: 'Destroy breakouts label',
  },
});

interface BreakoutDropdownProps {
  openBreakoutTimeManager: () => void;
  endAllBreakouts: () => void;
  isMeteorConnected: boolean;
  amIModerator: boolean;
  isRTL: boolean;
}

interface MenuItem {
  key: string;
  dataTest: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

const BreakoutDropdown: React.FC<BreakoutDropdownProps> = ({
  openBreakoutTimeManager,
  endAllBreakouts,
  isMeteorConnected,
  amIModerator,
  isRTL,
}) => {
  const intl = useIntl();
  const [isCreateBreakoutRoomModalOpen, setIsCreateBreakoutRoomModalOpen] = useState(false);

  const getAvailableActions = (): MenuItem[] => {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      key: 'breakoutTimeManager',
      dataTest: 'openBreakoutTimeManager',
      label: intl.formatMessage(intlMessages.manageDuration),
      onClick: () => {
        openBreakoutTimeManager();
      },
    });

    menuItems.push({
      key: 'updateBreakoutUsers',
      dataTest: 'openUpdateBreakoutUsersModal',
      label: intl.formatMessage(intlMessages.manageUsers),
      onClick: () => {
        setIsCreateBreakoutRoomModalOpen(true);
      },
    });

    if (amIModerator) {
      menuItems.push({
        key: 'endAllBreakouts',
        dataTest: 'endAllBreakouts',
        label: intl.formatMessage(intlMessages.destroy),
        disabled: !isMeteorConnected,
        onClick: () => {
          endAllBreakouts();
        },
      });
    }

    return menuItems;
  };

  const setCreateBreakoutRoomModalIsOpen = (value: boolean) => {
    setIsCreateBreakoutRoomModalOpen(value);
  };

  return (
    <>
      <BBBMenu
        trigger={
          (
            <Trigger
              data-test="breakoutOptionsMenu"
              icon="more"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />
          )
        }
        opts={{
          id: 'breakoutroom-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        }}
        actions={getAvailableActions()}
      />
      {isCreateBreakoutRoomModalOpen ? (
        <CreateBreakoutRoomContainerGraphql
          isUpdate
          priority="low"
          setIsOpen={setCreateBreakoutRoomModalIsOpen}
          isOpen={isCreateBreakoutRoomModalOpen}
        />
      ) : null}
    </>
  );
};

export default BreakoutDropdown;
