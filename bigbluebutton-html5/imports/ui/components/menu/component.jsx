import React from "react";
import PropTypes from "prop-types";
import { defineMessages, injectIntl } from "react-intl";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Divider } from "@material-ui/core";

import Icon from "/imports/ui/components/icon/component";
import Button from "/imports/ui/components/button/component";

import { styles } from "./styles";

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
});

//Used to switch to mobile view
const MAX_WIDTH = 640;

class BBBMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };

    this.setAnchorEl = this.setAnchorEl.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget})
  };
    
  handleClose() {
    const { onCloseCallback } = this.props;
    this.setState({ anchorEl: null}, onCloseCallback());
  };

  setAnchorEl(el) {
    this.setState({ anchorEl: el });
  };

  makeMenuItems() {
    const { actions, selectedEmoji } = this.props;

    return actions?.map(a => {
      const { label, onClick, key } = a;
      const itemClasses = [styles.menuitem];

      if (key?.toLowerCase()?.includes(selectedEmoji?.toLowerCase())) itemClasses.push(styles.emojiSelected);

      return [<MenuItem 
        key={label}
        className={itemClasses.join(' ')}
        disableRipple={true}
        disableGutters={true}
        style={{ paddingLeft: '4px',paddingRight: '4px',paddingTop: '8px', paddingBottom: '8px', marginLeft: '4px', marginRight: '4px' }}
        onClick={() => { 
          onClick();
          const close = !label.includes('Set status') && !label.includes('Back');
          // prevent menu close for sub menu actions
          if (close) this.handleClose();
        }}>
          <div style={{ display: 'flex', flexFlow: 'row', width: '100%'}}>
            {a.icon ? <Icon iconName={a.icon} key="icon" /> : null}
            <div className={styles.option}>{label}</div>
            {a.iconRight ? <Icon iconName={a.iconRight} key="iconRight" className={styles.iRight} /> : null}
          </div>
        </MenuItem>,
        a.divider && <Divider />  
    ];
    });
  }
  
  render() {
    const { anchorEl } = this.state;
    const { trigger, intl, opts, wide } = this.props;
    const actionsItems = this.makeMenuItems();

    const menuClasses = [styles.menu];
    if (wide) menuClasses.push(styles.wide)

    return (
      <div>
        <div onClick={this.handleClick}>{trigger}</div>
        <Menu
          {...opts}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          className={menuClasses.join(' ')}
        >
          {actionsItems}
          {anchorEl && window.innerWidth < MAX_WIDTH && 
            <Button
              className={styles.closeBtn}
              label={intl.formatMessage(intlMessages.close)}
              size="lg"
              color="default"
              onClick={this.handleClose}
            />
          }
        </Menu>
      </div>
    );
  }
}

export default injectIntl(BBBMenu);

BBBMenu.defaultProps = {
  opts: {
    id: "default-dropdown-menu",
    keepMounted: true,
    transitionDuration: 0,
    elevation: 3,
    getContentAnchorEl: null,
    fullwidth: "true",
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformorigin: { vertical: 'top', horizontal: 'top' },
  },
  onCloseCallback: () => {},
  wide: false,
};

BBBMenu.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,

  trigger: PropTypes.element.isRequired,

  actions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string,
    iconRight: PropTypes.string,
    divider: PropTypes.bool,
  })).isRequired,

  onCloseCallback: PropTypes.func,

  wide: PropTypes.bool,
};
