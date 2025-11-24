import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Divider } from '@mui/material';
import Icon from '/imports/ui/components/common/icon/component';
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';
import KEY_CODES from '/imports/utils/keyCodes';
import MenuSkeleton from './skeleton';
import GenericContentItem from '/imports/ui/components/generic-content/generic-content-item/component';
import Styled from './styles';

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
  active: {
    id: 'app.dropdown.list.item.activeLabel',
    description: 'active item label',
  },
});

class BBBMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };

    this.optsToMerge = {};
    this.autoFocus = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidUpdate() {
    const { anchorEl } = this.state;
    const { open } = this.props;
    if (open === false && anchorEl) {
      this.setState({ anchorEl: null });
    } else if (open === true && !anchorEl) {
      this.setState({ anchorEl: this.anchorElRef });
    }
  }

  handleKeyDown(event) {
    const { anchorEl } = this.state;
    const { isHorizontal } = this.props;
    const isMenuOpen = Boolean(anchorEl);

    const previousKey = isHorizontal ? KEY_CODES.ARROW_LEFT : KEY_CODES.ARROW_UP;
    const nextKey = isHorizontal ? KEY_CODES.ARROW_RIGHT : KEY_CODES.ARROW_DOWN;

    if ([KEY_CODES.ESCAPE, KEY_CODES.TAB].includes(event.which)) {
      this.handleClose();
      return;
    }

    if (isMenuOpen && [previousKey, nextKey].includes(event.which)) {
      event.preventDefault();
      event.stopPropagation();
      const menuItems = Array.from(document.querySelectorAll('[data-key^="menuItem-"]'));
      if (menuItems.length === 0) return;

      const focusedIndex = menuItems.findIndex((item) => item === document.activeElement);
      const nextIndex = event.which === previousKey ? focusedIndex - 1 : focusedIndex + 1;
      let indexToFocus = 0;
      if (nextIndex < 0) {
        indexToFocus = menuItems.length - 1;
      } else if (nextIndex >= menuItems.length) {
        indexToFocus = 0;
      } else {
        indexToFocus = nextIndex;
      }

      menuItems[indexToFocus].focus();
    }
  }

  handleClick(event) {
    const { disabled } = this.props;
    if (disabled) return;
    this.setState({ anchorEl: event.currentTarget });
  }

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
  }

  makeMenuItems() {
    const {
      actions, selectedEmoji, intl, isHorizontal, isEmoji, isMobile, roundButtons, keepOpen,
    } = this.props;

    return actions?.map((a) => {
      const {
        dataTest, label, onClick, key, disabled,
        description, selected, textColor, isToggle, loading,
        isTitle, titleActions, contentFunction,
      } = a;
      const emojiSelected = key?.toLowerCase()?.includes(selectedEmoji?.toLowerCase());

      let customStyles = {
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        marginLeft: '0px',
        marginRight: '0px',
      };

      let iconStyles = {};

      if (a.customStyles) {
        customStyles = { ...customStyles, ...a.customStyles };
      }

      if (a.iconStyles) {
        iconStyles = { ...iconStyles, ...a.iconStyles };
      }

      if (loading) {
        return (
          <MenuSkeleton key={label} />
        );
      }

      return [
        (!a.isSeparator && onClick) && (
          <Styled.BBBMenuItem
            emoji={emojiSelected ? 'yes' : 'no'}
            key={label}
            id={dataTest}
            data-test={dataTest}
            data-key={`menuItem-${dataTest}`}
            disableRipple
            disableGutters
            disabled={disabled || isTitle}
            style={customStyles}
            $roundButtons={roundButtons}
            $isToggle={isToggle}
            onClick={(event) => {
              onClick(event);
              const close = !keepOpen && !key?.includes('setstatus') && !key?.includes('back');
              // prevent menu close for sub menu actions
              if (close) this.handleClose(event);
              event.stopPropagation();
            }}
          >
            <Styled.MenuItemWrapper
              isMobile={isMobile}
              isEmoji={isEmoji}
            >
              {a.icon ? <Icon iconName={a.icon} key="icon" /> : null}
              <Styled.Option hasIcon={!!(a.icon)} isHorizontal={isHorizontal} isMobile={isMobile} aria-describedby={`${key}-option-desc`} $isToggle={isToggle}>{label}</Styled.Option>
              {description && <div className="sr-only" id={`${key}-option-desc`}>{`${description}${selected ? ` - ${intl.formatMessage(intlMessages.active)}` : ''}`}</div>}
              {a.iconRight ? <Styled.IconRight iconName={a.iconRight} key="iconRight" style={iconStyles} /> : null}
            </Styled.MenuItemWrapper>
          </Styled.BBBMenuItem>
        ),
        (!onClick && !a.isSeparator) && (
          <Styled.BBBMenuInformation
            key={a.key}
            isTitle={isTitle}
            isGenericContent={!!contentFunction}
            disabled={disabled || isTitle}
          >
            <Styled.MenuItemWrapper
              hasSpaceBetween={isTitle && titleActions}
            >
              {!contentFunction ? (
                <>
                  {a.icon ? <Icon color={textColor} iconName={a.icon} key="icon" /> : null}
                  <Styled.Option hasIcon={!!(a.icon)} isTitle={isTitle} textColor={textColor} isHorizontal={isHorizontal} isMobile={isMobile} aria-describedby={`${key}-option-desc`} $isToggle={isToggle}>{label}</Styled.Option>
                  {a.iconRight ? <Styled.IconRight color={textColor} iconName={a.iconRight} key="iconRight" /> : null}
                  {(isTitle && titleActions?.length > 0) ? (
                    titleActions.map((item, index) => (
                      <Styled.TitleAction
                        key={item.id || index}
                        tooltipplacement="right"
                        size="md"
                        onClick={item.onClick}
                        circle
                        tooltipLabel={item.tooltip}
                        hideLabel
                        icon={item.icon}
                      />
                    ))
                  ) : null}
                </>
              ) : (
                <GenericContentItem
                  width="100%"
                  renderFunction={contentFunction}
                />
              )}
            </Styled.MenuItemWrapper>
          </Styled.BBBMenuInformation>
        ),
        a.isSeparator && <Divider data-test={dataTest} disabled />,
      ];
    }) ?? [];
  }

  render() {
    const { anchorEl } = this.state;
    const {
      trigger,
      intl,
      customStyles,
      dataTest,
      opts,
      accessKey,
      renderOtherComponents,
      customAnchorEl,
      hasRoundedCorners,
      overrideMobileStyles,
      isHorizontal,
      minContent,
    } = this.props;
    const actionsItems = this.makeMenuItems();

    const roundedCornersStyles = { borderRadius: '3rem' };
    let menuStyles = { zIndex: 999 };

    if (customStyles) {
      menuStyles = { ...menuStyles, ...customStyles };
    }

    if (isHorizontal) {
      const horizontalStyles = { display: 'flex' };
      menuStyles = { ...menuStyles, ...horizontalStyles };
    }

    const paperStyle = {
      ...(hasRoundedCorners ? roundedCornersStyles : {}),
      ...(minContent ? { 'max-width': 'min-content' } : {}),
    };

    return (
      <>
        <div
          onClick={(e) => {
            e.persist();
            const firefoxInputSource = !([1, 5].includes(e.nativeEvent.mozInputSource)); // 1 = mouse, 5 = touch (firefox only)
            const chromeInputSource = !(['mouse', 'touch'].includes(e.nativeEvent.pointerType));

            this.optsToMerge.autoFocus = firefoxInputSource && chromeInputSource;
            this.handleClick(e);
          }}
          onKeyPress={(e) => {
            e.persist();
            if (e.which !== KEY_CODES.ENTER) return null;
            this.handleClick(e);
          }}
          accessKey={accessKey}
          ref={(ref) => this.anchorElRef = ref}
          tabIndex={-1}
        >
          {trigger}
        </div>

        <Styled.MenuWrapper
          {...opts}
          {...this.optsToMerge}
          anchorEl={customAnchorEl || anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          style={menuStyles}
          data-test={dataTest}
          onKeyDownCapture={this.handleKeyDown}
          $isHorizontal={isHorizontal}
          PaperProps={{
            style: paperStyle,
            className: overrideMobileStyles ? 'override-mobile-styles' : 'MuiPaper-root-mobile',
          }}
        >
          {actionsItems}
          {renderOtherComponents}
          {!overrideMobileStyles && anchorEl && window.innerWidth < SMALL_VIEWPORT_BREAKPOINT
            && (
              <Styled.CloseButton
                label={intl.formatMessage(intlMessages.close)}
                size="lg"
                color="default"
                onClick={this.handleClose}
              />
            )}
        </Styled.MenuWrapper>
      </>
    );
  }
}

BBBMenu.defaultProps = {
  opts: {
    id: 'default-dropdown-menu',
    autoFocus: false,
    keepMounted: true,
    transitionDuration: 0,
    elevation: 3,
    getcontentanchorel: null,
    fullwidth: 'true',
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformorigin: { vertical: 'top', horizontal: 'right' },
  },
  onCloseCallback: () => { },
  dataTest: '',
  minContent: false,
};

BBBMenu.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,

  trigger: PropTypes.element.isRequired,

  actions: PropTypes.array.isRequired,

  onCloseCallback: PropTypes.func,
  dataTest: PropTypes.string,
  open: PropTypes.bool,
  customStyles: PropTypes.object,
  opts: PropTypes.object,
  accessKey: PropTypes.string,
  minContent: PropTypes.bool,
};

export default injectIntl(BBBMenu);
