import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import BBBMenu from "/imports/ui/components/common/menu/component";
import Button from '/imports/ui/components/common/button/component';
import CreateBreakoutRoomModal from '/imports/ui/components/actions-bar/create-breakout-room/container';

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
    defaultMessage: 'Manage Users',
  },
  destroy: {
    id: 'app.breakout.dropdown.destroyAll',
    description: 'Destroy breakouts label',
  },
});

class BreakoutDropdown extends PureComponent {
  constructor(props) {
    super(props);
  }

  getAvailableActions() {
    const {
      intl,
      openBreakoutTimeManager,
      endAllBreakouts,
      isMeteorConnected,
      amIModerator,
      mountModal,
    } = this.props;

    this.menuItems = [];

    this.menuItems.push(
      {
        key: 'breakoutTimeManager',
        dataTest: 'openBreakoutTimeManager',
        label: intl.formatMessage(intlMessages.manageDuration),
        onClick: () => {
          openBreakoutTimeManager();
        }
      }
    );

    this.menuItems.push(
      {
        key: 'updateBreakoutUsers',
        dataTest: 'openUpdateBreakoutUsersModal',
        label: intl.formatMessage(intlMessages.manageUsers),
        onClick: () => {
          mountModal(
            <CreateBreakoutRoomModal isUpdate />
          );
        }
      }
    );

    if (amIModerator) {
      this.menuItems.push(
        {
          key: 'endAllBreakouts',
          dataTest: 'endAllBreakouts',
          label: intl.formatMessage(intlMessages.destroy),
          disabled: !isMeteorConnected,
          onClick: () => {
            endAllBreakouts();
          }
        }
      );
    }

    return this.menuItems;
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <>
        <BBBMenu
          trigger={
            <Button
              data-test="breakoutOptionsMenu"
              icon="more"
              size="sm"
              ghost
              circle
              hideLabel
              color="dark"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />
          }
          opts={{
            id: "default-dropdown-menu",
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getContentAnchorEl: null,
            fullwidth: "true",
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformorigin: { vertical: 'bottom', horizontal: 'left' },
          }}
          actions={this.getAvailableActions()}
        />
      </>
    );
  }
}

export default withModalMounter(injectIntl(BreakoutDropdown));
