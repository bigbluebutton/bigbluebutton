import React from "react";
import PropTypes from "prop-types";
import { defineMessages, injectIntl } from "react-intl";

import Menu from "@material-ui/core/Menu";
import { Divider } from "@material-ui/core";

import Icon from "/imports/ui/components/common/icon/component";
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';

import { ENTER } from "/imports/utils/keyCodes";

import Styled from './styles';

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
});

class BBBMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };

    this.opts = props.opts;
    this.autoFocus = false;

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidUpdate() {
    const { anchorEl } = this.state;
    if (this.props.open === false && anchorEl) {
      this.setState({ anchorEl: null });
    } else if (this.props.open === true && !anchorEl) {
      this.setState({ anchorEl: this.anchorElRef });
    }
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose(event) {
    const { onCloseCallback } = this.props;
    this.setState({ anchorEl: null }, onCloseCallback());

    if (event) {
      event.persist();

      if (event.type === 'click') {
        setTimeout(() => {
          document.activeElement.blur();
        }, 0);
      }
    }
  };

  makeMenuItems() {
    const { actions, selectedEmoji } = this.props;

    return actions?.map(a => {
      const { dataTest, label, onClick, key, disabled } = a;

      const emojiSelected = key?.toLowerCase()?.includes(selectedEmoji?.toLowerCase());

      let customStyles = {
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingTop: '8px',
        paddingBottom: '8px',
        marginLeft: '4px',
        marginRight: '4px'
      };

      if (a.customStyles) {
        customStyles = { ...customStyles, ...a.customStyles };
      }

      return [
        a.dividerTop && <Divider disabled />,
        <Styled.BBBMenuItem
          emoji={emojiSelected ? 'yes' : 'no'}
          key={label}
          data-test={dataTest}
          disableRipple={true}
          disableGutters={true}
          disabled={disabled}
          style={customStyles}
          onClick={(event) => {
            onClick();
            const close = !key.includes('setstatus') && !key.includes('back');
            // prevent menu close for sub menu actions
            if (close) this.handleClose(event);
            event.stopPropagation();
          }}>
          <div style={{ display: 'flex', flexFlow: 'row', width: '100%' }}>
            {a.icon ? <Icon iconName={a.icon} key="icon" /> : null}
            <Styled.Option>{label}</Styled.Option>
            {a.iconRight ? <Styled.IconRight iconName={a.iconRight} key="iconRight" /> : null}
          </div>
        </Styled.BBBMenuItem>,
        a.divider && <Divider disabled />
      ];
    });
  }

  render() {
    const { anchorEl } = this.state;
    const { trigger, intl, customStyles, dataTest } = this.props;
    const actionsItems = this.makeMenuItems();

    let menuStyles = { zIndex: 9999 };

    if (customStyles) {
      menuStyles = { ...menuStyles, ...customStyles };
    }

    return (
      <>
        <div
          onClick={(e) => {
            e.persist();
            this.opts.autoFocus = !(['mouse', 'touch'].includes(e.nativeEvent.pointerType));
            this.handleClick(e);
          }}
          onKeyPress={(e) => {
            e.persist();
            if (e.which !== ENTER) return null;
            this.handleClick(e);
          }}
          accessKey={this.props?.accessKey}
          ref={(ref) => this.anchorElRef = ref}
        >
          {trigger}
        </div>

        <Menu
          {...this.opts}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          style={menuStyles}
          data-test={dataTest}
        >
          {actionsItems}
          {anchorEl && window.innerWidth < SMALL_VIEWPORT_BREAKPOINT &&
            <Styled.CloseButton
              label={intl.formatMessage(intlMessages.close)}
              size="lg"
              color="default"
              onClick={this.handleClose}
            />
          }
        </Menu>
      </>
    );
  }
}

export default injectIntl(BBBMenu);

BBBMenu.defaultProps = {
  opts: {
    id: "default-dropdown-menu",
    autoFocus: false,
    keepMounted: true,
    transitionDuration: 0,
    elevation: 3,
    getContentAnchorEl: null,
    fullwidth: "true",
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformorigin: { vertical: 'top', horizontal: 'right' },
  },
  onCloseCallback: () => { },
};

BBBMenu.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,

  trigger: PropTypes.element.isRequired,

  actions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    icon: PropTypes.string,
    iconRight: PropTypes.string,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    dividerTop: PropTypes.bool,
    accessKey: PropTypes.string,
  })).isRequired,

  onCloseCallback: PropTypes.func,
  dataTest: PropTypes.string,
};
