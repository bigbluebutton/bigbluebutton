import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { HEXToINTColor, INTToHEXColor } from '/imports/utils/hexInt';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import { noop } from 'lodash';
import KEY_CODES from '/imports/utils/keyCodes';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';
import ToolbarMenuItem from './toolbar-menu-item/component';
import ToolbarSubmenu from './toolbar-submenu/component';

const TRANSITION_DURATION = '0.4s';
const TOOLBAR_CONFIG = Meteor.settings.public.whiteboard.toolbar;
const ANNOTATION_COLORS = TOOLBAR_CONFIG.colors;
const THICKNESS_RADIUSES = TOOLBAR_CONFIG.thickness;
const FONT_SIZES = TOOLBAR_CONFIG.font_sizes;

const intlMessages = defineMessages({
  toolbarTools: {
    id: 'app.whiteboard.toolbar.tools',
    description: 'Whiteboard toolbar tools menu',
  },
  toolbarLineThickness: {
    id: 'app.whiteboard.toolbar.thickness',
    description: 'Whiteboard toolbar thickness menu',
  },
  toolbarLineThicknessDisabled: {
    id: 'app.whiteboard.toolbar.thicknessDisabled',
    description: 'Whiteboard toolbar thickness menu',
  },
  toolbarLineColor: {
    id: 'app.whiteboard.toolbar.color',
    description: 'Whiteboard toolbar colors menu',
  },
  toolbarLineColorDisabled: {
    id: 'app.whiteboard.toolbar.colorDisabled',
    description: 'Whiteboard toolbar colors menu',
  },
  toolbarUndoAnnotation: {
    id: 'app.whiteboard.toolbar.undo',
    description: 'Whiteboard toolbar tools menu',
  },
  toolbarClearAnnotations: {
    id: 'app.whiteboard.toolbar.clear',
    description: 'Whiteboard toolbar clear menu',
  },
  toolbarMultiUserOn: {
    id: 'app.whiteboard.toolbar.multiUserOn',
    description: 'Whiteboard toolbar turn multi-user on menu',
  },
  toolbarMultiUserOff: {
    id: 'app.whiteboard.toolbar.multiUserOff',
    description: 'Whiteboard toolbar turn multi-user off menu',
  },
  toolbarFontSize: {
    id: 'app.whiteboard.toolbar.fontSize',
    description: 'Whiteboard toolbar font size menu',
  },
  toolbarItemPan: {
    id: 'app.whiteboard.toolbar.tools.hand',
    description: 'Label for the pan toolbar item',
  },
});

const isEdge = browser().name === 'edge';
const runExceptInEdge = fn => (isEdge ? noop : fn);

class WhiteboardToolbar extends Component {
  constructor(props) {
    super(props);

    const { annotations, multiUser, isPresenter } = this.props;

    let annotationSelected = {
      icon: 'hand',
      value: 'hand',
    };

    if (multiUser && !isPresenter) {
      annotationSelected = {
        icon: 'pen_tool',
        value: 'pencil',
      };
    }

    if (!annotations.some(el => el.value === annotationSelected.value) && annotations.length > 0) {
      annotationSelected = annotations[annotations.length - 1];
    }

    this.state = {
      // a variable to control which list is currently open
      currentSubmenuOpen: '',

      // variables to keep current selected draw settings
      annotationSelected,
      prevAnnotationSelected: annotationSelected,
      thicknessSelected: { value: 1 },
      colorSelected: { value: '#ff0000' },
      fontSizeSelected: { value: 20 },

      // keeping the previous color and the thickness icon's radius selected for svg animation
      prevColorSelected: { value: '#ff0000' },
      prevThicknessSelected: { value: 2 },

      // lists of tools/thickness/colors are not direct children of main toolbar buttons
      // and we want the list to close when onBlur fires at the main toolbar button
      // (click anywhere on the screen) thus we have to control the blur manually by disabling it
      // when you hover over the buttons in the list and enabling when the mouse leaves the list
      onBlurEnabled: true,

      panMode: false,
    };

    this.displaySubMenu = this.displaySubMenu.bind(this);
    this.closeSubMenu = this.closeSubMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);
    this.handleSwitchWhiteboardMode = this.handleSwitchWhiteboardMode.bind(this);
    this.handleAnnotationChange = this.handleAnnotationChange.bind(this);
    this.handleThicknessChange = this.handleThicknessChange.bind(this);
    this.handleFontSizeChange = this.handleFontSizeChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.componentDidMount = runExceptInEdge(this.componentDidMount);
    this.componentDidUpdate = runExceptInEdge(this.componentDidUpdate);
    this.panOn = this.panOn.bind(this);
    this.panOff = this.panOff.bind(this);
  }

  componentDidMount() {
    const { actions, multiUser, isPresenter } = this.props;
    const drawSettings = actions.getCurrentDrawSettings();
    const {
      annotationSelected, thicknessSelected, colorSelected, fontSizeSelected,
    } = this.state;

    document.addEventListener('keydown', this.panOn);
    document.addEventListener('keyup', this.panOff);

    // if there are saved drawSettings in the session storage
    // - retrieve them and update toolbar values
    if (drawSettings) {
      if (multiUser && !isPresenter) {
        drawSettings.whiteboardAnnotationTool = 'pencil';
        this.handleAnnotationChange({ icon: 'pen_tool', value: 'pencil' });
      }

      this.setToolbarValues(drawSettings);
      // no drawSettings in the sessionStorage - setting default values
    } else {
      // setting default drawing settings if they haven't been set previously
      actions.setInitialWhiteboardToolbarValues(
        annotationSelected.value,
        thicknessSelected.value * 2,
        HEXToINTColor(colorSelected.value),
        fontSizeSelected.value,
        {
          textShapeValue: '',
          textShapeActiveId: '',
        },
      );
    }

    if (annotationSelected.value !== 'text') {
      // trigger initial animation on the thickness circle, otherwise it stays at 0
      this.thicknessListIconColor.beginElement();
      this.thicknessListIconRadius.beginElement();
      this.colorListIconColor.beginElement();
    } else {
      this.colorListIconColor.beginElement();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { annotations } = this.props;
    const { annotationSelected } = prevState;
    const hadInAnnotations = annotations.some(el => el.value === annotationSelected.value);

    // if color or thickness were changed
    // we might need to trigger svg animation for Color and Thickness icons
    this.animateSvgIcons(prevState);

    if (prevProps.annotations.length !== annotations.length && annotations.length === 0) {
      this.handleAnnotationChange({ icon: null, value: null });
    }

    if (!hadInAnnotations && annotations.length) {
      this.handleAnnotationChange(annotations[annotations.length - 1]);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.panOn);
    document.removeEventListener('keyup', this.panOff);
  }

  setToolbarValues(drawSettings) {
    const {
      annotations,
    } = this.props;

    const {
      whiteboardAnnotationThickness,
      textFontSize, whiteboardAnnotationColor,
      whiteboardAnnotationTool,
    } = drawSettings;

    // divide by 2, since we need the radius for the thickness icon
    const thicknessSelected = { value: whiteboardAnnotationThickness / 2 };
    const fontSizeSelected = { value: textFontSize };
    const colorSelected = { value: INTToHEXColor(whiteboardAnnotationColor) };

    let annotationSelected = {};
    for (let i = 0; i < annotations.length; i += 1) {
      if (whiteboardAnnotationTool === annotations[i].value) {
        annotationSelected = annotations[i];
        break;
      }
    }
    this.setState({
      colorSelected,
      fontSizeSelected,
      thicknessSelected,
      annotationSelected,
    });
  }

  panOn(event) {
    const { annotationSelected } = this.state;
    const { target, which } = event;
    const isBody = target.nodeName === 'BODY';

    if (annotationSelected.value === 'hand' || !isBody) return;

    const { annotations } = this.props;

    if ([KEY_CODES.SPACE].includes(which)) {
      this.setState(
        {
          panMode: true,
          prevAnnotationSelected: annotationSelected,
        },
        this.handleAnnotationChange(annotations[annotations.length - 1]),
      );
    }
  }

  panOff(event) {
    const { target, which } = event;
    const isInputArea = target.nodeName === 'TEXTAREA' || target.nodeName === 'INPUT';
    const { panMode } = this.state;

    if (isInputArea || !panMode) return;

    const { prevAnnotationSelected } = this.state;

    if ([KEY_CODES.SPACE].includes(which)) {
      this.setState({ panMode: false },
        this.handleAnnotationChange(prevAnnotationSelected));
    }
  }

  animateSvgIcons(prevState) {
    const {
      colorSelected,
      annotationSelected,
      thicknessSelected,
    } = this.state;

    /* Animation for the svg icons that we use for thickness (circle) and color (rectangle)
     * has to be triggered manually
     * we have 4 main cases:
     * 1. Color change -
         a) Text tool is selected, Font-Size icon substitutes the thickness icon,
            thus we need to trigger the color change just for the color icon
         b) Any other tool than Text tool is selected - trigger color change for both icons
     * 2. Thickness change - trigger radius for the thickness icon
     * 3. Switch from the Text tool to any other - trigger color and radius for thickness
     * 4. Trigger initial animation for the icons
    */
    // 1st case
    if (this.thicknessListIconRadius && this.thicknessListIconColor) {
      if (colorSelected.value !== prevState.colorSelected.value) {
        // 1st case b)
        if (annotationSelected.value !== 'text') {
          this.thicknessListIconColor.beginElement();
        }
        // 1st case a)
        this.colorListIconColor.beginElement();
        // 2nd case
      } else if (thicknessSelected.value !== prevState.thicknessSelected.value) {
        this.thicknessListIconRadius.beginElement();
        // 3rd case
      } else if (annotationSelected.value !== 'text'
        && prevState.annotationSelected.value === 'text') {
        this.thicknessListIconRadius.beginElement();
        this.thicknessListIconColor.beginElement();
      }
    }
    // 4th case, initial animation is triggered in componentDidMount
  }

  // open a submenu
  displaySubMenu(listName) {
    const { currentSubmenuOpen } = this.state;

    this.setState({
      currentSubmenuOpen: currentSubmenuOpen === listName ? '' : listName,
      onBlurEnabled: false,
    });
  }

  // close a current submenu (fires onBlur only, when you click anywhere on the screen)
  closeSubMenu() {
    const {
      annotationSelected,
      onBlurEnabled,
    } = this.state;

    const {
      textShapeActiveId,
    } = this.props;

    // a separate case for the active text shape
    if (annotationSelected.value === 'text' && textShapeActiveId !== '') return;

    if (onBlurEnabled) {
      this.setState({
        currentSubmenuOpen: undefined,
      });
    }
  }

  // undo annotation
  handleUndo() {
    const {
      actions,
      whiteboardId,
    } = this.props;

    actions.undoAnnotation(whiteboardId);
  }

  // clear all annotations
  handleClearAll() {
    const {
      actions,
      whiteboardId,
    } = this.props;

    actions.clearWhiteboard(whiteboardId);
  }

  handleSwitchWhiteboardMode() {
    const {
      multiUser,
      whiteboardId,
      actions,
    } = this.props;

    actions.changeWhiteboardMode(!multiUser, whiteboardId);
  }

  // changes a current selected annotation both in the state and in the session
  // and closes the annotation list
  handleAnnotationChange(annotation) {
    const { actions } = this.props;
    const obj = {
      annotationSelected: annotation,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    };

    // to animate thickness icon properly when you switch the tool back from Text
    if (annotation.value === 'text') {
      obj.prevThicknessSelected = { value: 0 };
    }

    actions.setTool(annotation.value);
    this.setState(obj);
  }

  // changes a current selected thickness both in the state and in the session
  // and closes the thickness list
  handleThicknessChange(incomingThickness) {
    const { actions } = this.props;
    const { thicknessSelected } = this.state;

    // thickness value * 2 since this is radius, we need to double it
    actions.setThickness(incomingThickness.value * 2);

    this.setState({
      prevThicknessSelected: thicknessSelected,
      thicknessSelected: incomingThickness,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleClose() {
    this.setState({
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleFontSizeChange(fontSize) {
    const { actions } = this.props;
    actions.setFontSize(fontSize.value);

    this.setState({
      fontSizeSelected: fontSize,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  // changes a current selected color both in the state and in the session
  // and closes the color list
  handleColorChange(color) {
    const { actions } = this.props;
    const { colorSelected } = this.state;
    actions.setColor(HEXToINTColor(color.value));

    this.setState({
      prevColorSelected: colorSelected,
      colorSelected: color,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  // disabling onBlur flag when mouse is over the items in the lists
  handleMouseEnter() {
    this.setState({
      onBlurEnabled: false,
    });
  }

  // enabling the onBlur flag when the mouse leaving the lists
  handleMouseLeave() {
    this.setState({
      onBlurEnabled: true,
    });
  }

  renderToolItem() {
    const { panMode, annotationSelected, currentSubmenuOpen } = this.state;
    const { intl, annotations } = this.props;
    const isDisabled = !annotations.length;

    return panMode
      ? (
        <ToolbarMenuItem
          icon="hand"
          label={intl.formatMessage(intlMessages.toolbarItemPan)}
          onItemClick={() => { }}
          className={styles.toolbarButton}
        />
      ) : (
        <ToolbarMenuItem
          disabled={isDisabled}
          label={intl.formatMessage(intlMessages.toolbarTools)}
          icon={annotationSelected.icon}
          onItemClick={this.displaySubMenu}
          objectToReturn="annotationList"
          onBlur={this.closeSubMenu}
          className={cx(styles.toolbarButton, currentSubmenuOpen === 'annotationList' ? styles.toolbarActive : null)}
          showCornerTriangle
        >
          {currentSubmenuOpen === 'annotationList' && annotations.length > 1
            ? (
              <ToolbarSubmenu
                type="annotations"
                customIcon={false}
                label="Annotations"
                onItemClick={this.handleAnnotationChange}
                objectsToRender={panMode ? annotations[annotations.length - 1] : annotations}
                objectSelected={annotationSelected}
                handleMouseEnter={this.handleMouseEnter}
                handleMouseLeave={this.handleMouseLeave}
                handleClose={this.handleClose}
              />
            )
            : null}
        </ToolbarMenuItem>
      );
  }

  renderFontItem() {
    const { intl, fontSizes } = this.props;
    const { currentSubmenuOpen, fontSizeSelected } = this.state;

    return (
      <ToolbarMenuItem
        label={intl.formatMessage(intlMessages.toolbarFontSize)}
        customIcon={this.renderFontItemIcon()}
        onItemClick={this.displaySubMenu}
        objectToReturn="fontSizeList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, currentSubmenuOpen === 'fontSizeList' ? styles.toolbarActive : null)}
        showCornerTriangle
      >
        {currentSubmenuOpen === 'fontSizeList'
          ? (
            <ToolbarSubmenu
              type="font-size"
              customIcon
              label="Font Size"
              onItemClick={this.handleFontSizeChange}
              objectsToRender={fontSizes}
              objectSelected={fontSizeSelected}
              handleMouseEnter={this.handleMouseEnter}
              handleMouseLeave={this.handleMouseLeave}
              handleClose={this.handleClose}
            />
          )
          : null}
      </ToolbarMenuItem>
    );
  }

  renderFontItemIcon() {
    const { fontSizeSelected, colorSelected } = this.state;
    return (
      <p
        className={styles.textThickness}
        style={{
          fontSize: fontSizeSelected.value,
          color: colorSelected.value,
          WebkitTransition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`, /* Safari */
          transition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`,
        }}
      >
        Aa
      </p>
    );
  }

  renderThicknessItem() {
    const {
      intl,
      annotations,
      thicknessRadiuses,
    } = this.props;

    const {
      annotationSelected,
      currentSubmenuOpen,
      thicknessSelected,
    } = this.state;

    const isDisabled = annotationSelected.value === 'hand' || !annotations.length;
    return (
      <ToolbarMenuItem
        disabled={isDisabled}
        label={isDisabled
          ? intl.formatMessage(intlMessages.toolbarLineThicknessDisabled)
          : intl.formatMessage(intlMessages.toolbarLineThickness)}
        onItemClick={this.displaySubMenu}
        objectToReturn="thicknessList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, currentSubmenuOpen === 'thicknessList' ? styles.toolbarActive : null)}
        customIcon={this.renderThicknessItemIcon()}
        showCornerTriangle
      >
        {currentSubmenuOpen === 'thicknessList'
          ? (
            <ToolbarSubmenu
              type="thickness"
              customIcon
              label="Thickness"
              onItemClick={this.handleThicknessChange}
              objectsToRender={thicknessRadiuses}
              objectSelected={thicknessSelected}
              handleMouseEnter={this.handleMouseEnter}
              handleMouseLeave={this.handleMouseLeave}
              handleClose={this.handleClose}
            />
          )
          : null}
      </ToolbarMenuItem>
    );
  }

  renderThicknessItemIcon() {
    const {
      colorSelected,
      thicknessSelected,
      prevThicknessSelected,
      prevColorSelected,
    } = this.state;

    return (
      <svg className={styles.customSvgIcon} shapeRendering="geometricPrecision">
        {isEdge
          ? (
            <circle
              cx="50%"
              cy="50%"
              r={thicknessSelected.value}
              stroke="black"
              strokeWidth="1"
              fill={colorSelected.value}
            />
          )
          : (
            <circle
              shapeRendering="geometricPrecision"
              cx="50%"
              cy="50%"
              stroke="black"
              strokeWidth="1"
            >
              <animate
                ref={(ref) => { this.thicknessListIconColor = ref; }}
                attributeName="fill"
                attributeType="XML"
                from={prevColorSelected.value}
                to={colorSelected.value}
                begin="indefinite"
                dur={TRANSITION_DURATION}
                repeatCount="1"
                fill="freeze"
              />
              <animate
                ref={(ref) => { this.thicknessListIconRadius = ref; }}
                attributeName="r"
                attributeType="XML"
                from={prevThicknessSelected.value}
                to={thicknessSelected.value}
                begin="indefinite"
                dur={TRANSITION_DURATION}
                repeatCount="1"
                fill="freeze"
              />
            </circle>
          )}
      </svg>
    );
  }

  renderColorItem() {
    const {
      intl,
      annotations,
      colors,
    } = this.props;

    const {
      annotationSelected,
      currentSubmenuOpen,
      colorSelected,
    } = this.state;

    const isDisabled = annotationSelected.value === 'hand' || !annotations.length;
    return (
      <ToolbarMenuItem
        disabled={isDisabled}
        label={isDisabled
          ? intl.formatMessage(intlMessages.toolbarLineColorDisabled)
          : intl.formatMessage(intlMessages.toolbarLineColor)}
        onItemClick={this.displaySubMenu}
        objectToReturn="colorList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, currentSubmenuOpen === 'colorList' ? styles.toolbarActive : null)}
        customIcon={this.renderColorItemIcon()}
        showCornerTriangle
      >
        {currentSubmenuOpen === 'colorList'
          ? (
            <ToolbarSubmenu
              type="color"
              customIcon
              label="Color"
              onItemClick={this.handleColorChange}
              objectsToRender={colors}
              objectSelected={colorSelected}
              handleMouseEnter={this.handleMouseEnter}
              handleMouseLeave={this.handleMouseLeave}
              handleClose={this.handleClose}
            />
          )
          : null}
      </ToolbarMenuItem>
    );
  }

  renderColorItemIcon() {
    const {
      colorSelected,
      prevColorSelected,
    } = this.state;

    return (
      <svg className={styles.customSvgIcon}>
        {isEdge
          ? (
            <rect
              x="25%"
              y="25%"
              width="50%"
              height="50%"
              stroke="black"
              strokeWidth="1"
              fill={colorSelected.value}
            />
          ) : (
            <rect x="25%" y="25%" width="50%" height="50%" stroke="black" strokeWidth="1">
              <animate
                ref={(ref) => { this.colorListIconColor = ref; }}
                attributeName="fill"
                attributeType="XML"
                from={prevColorSelected.value}
                to={colorSelected.value}
                begin="indefinite"
                dur={TRANSITION_DURATION}
                repeatCount="1"
                fill="freeze"
              />
            </rect>
          )
        }
      </svg>
    );
  }

  renderUndoItem() {
    const { intl, isMeteorConnected } = this.props;

    return (
      <ToolbarMenuItem
        disabled={!isMeteorConnected}
        label={intl.formatMessage(intlMessages.toolbarUndoAnnotation)}
        icon="undo"
        onItemClick={this.handleUndo}
        className={styles.toolbarButton}
      />
    );
  }

  renderClearAllItem() {
    const { intl, isMeteorConnected } = this.props;

    return (
      <ToolbarMenuItem
        disabled={!isMeteorConnected}
        label={intl.formatMessage(intlMessages.toolbarClearAnnotations)}
        icon="delete"
        onItemClick={this.handleClearAll}
        className={styles.toolbarButton}
      />
    );
  }

  renderMultiUserItem() {
    const { intl, multiUser, isMeteorConnected } = this.props;

    return (
      <ToolbarMenuItem
        disabled={!isMeteorConnected}
        label={multiUser
          ? intl.formatMessage(intlMessages.toolbarMultiUserOff)
          : intl.formatMessage(intlMessages.toolbarMultiUserOn)
        }
        icon={multiUser ? 'multi_whiteboard' : 'whiteboard'}
        onItemClick={this.handleSwitchWhiteboardMode}
        className={styles.toolbarButton}
      />
    );
  }

  render() {
    const { annotationSelected } = this.state;
    const { isPresenter } = this.props;
    return (
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbarWrapper}>
          {this.renderToolItem()}
          {annotationSelected.value === 'text' ? this.renderFontItem() : this.renderThicknessItem()}
          {this.renderColorItem()}
          {this.renderUndoItem()}
          {this.renderClearAllItem()}
          {isPresenter ? this.renderMultiUserItem() : null}
        </div>
      </div>
    );
  }
}

WhiteboardToolbar.defaultProps = {
  colors: ANNOTATION_COLORS,
  thicknessRadiuses: THICKNESS_RADIUSES,
  fontSizes: FONT_SIZES,
  intl: intlShape,
};

WhiteboardToolbar.propTypes = {
  // defines a current mode of the whiteboard, multi/single user
  multiUser: PropTypes.bool.isRequired,

  // defines whether a current user is a presenter or not
  isPresenter: PropTypes.bool.isRequired,

  // defines an object of available actions
  actions: PropTypes.objectOf(PropTypes.func).isRequired,

  // defines the id of the active text shape (if any)
  // for the separate onBlur case in the closeSubMenu()
  textShapeActiveId: PropTypes.string.isRequired,

  // defines a current whiteboard id
  whiteboardId: PropTypes.string.isRequired,

  // defines an array of icons for the toolbar as well as their corresponding session values
  annotations: PropTypes.arrayOf(PropTypes.object).isRequired,

  // defines an array of font-sizes for the Font-size submenu of the text shape
  fontSizes: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
  }).isRequired),

  // defines an array of colors for the toolbar (color submenu)
  colors: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired),
  // defines an array of thickness values for the toolbar and their corresponding session values
  thicknessRadiuses: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
  }).isRequired),

  intl: intlShape,

};

export default injectWbResizeEvent(injectIntl(WhiteboardToolbar));
