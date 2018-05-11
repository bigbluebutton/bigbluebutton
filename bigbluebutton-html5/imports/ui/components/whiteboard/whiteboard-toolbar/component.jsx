import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { HEXToINTColor, INTToHEXColor } from '/imports/utils/hexInt';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import deviceInfo from '/imports/utils/deviceInfo';
import { styles } from './styles.scss';
import ToolbarMenuItem from './toolbar-menu-item/component';
import ToolbarSubmenu from './toolbar-submenu/component';

const TRANSITION_DURATION = '0.4s';
const TOOLBAR_CONFIG = Meteor.settings.public.whiteboard.toolbar;
const ANNOTATION_COLORS = TOOLBAR_CONFIG.colors;
const THICKNESS_RADIUSES = TOOLBAR_CONFIG.thickness;
const FONT_SIZES = TOOLBAR_CONFIG.font_sizes;
const ANNOTATION_TOOLS = TOOLBAR_CONFIG.tools;

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
});

class WhiteboardToolbar extends Component {
  constructor() {
    super();

    this.state = {
      // a variable to control which list is currently open
      currentSubmenuOpen: '',

      // variables to keep current selected draw settings
      annotationSelected: {
        icon: 'pen_tool',
        value: 'pencil',
      },
      thicknessSelected: { value: 4 },
      colorSelected: { value: '#000000' },
      fontSizeSelected: { value: 20 },

      // keeping the previous color and the thickness icon's radius selected for svg animation
      prevColorSelected: { value: '#000000' },
      prevThicknessSelected: { value: 4 },

      // lists of tools/thickness/colors are not direct children of main toolbar buttons
      // and we want the list to close when onBlur fires at the main toolbar button
      // (click anywhere on the screen) thus we have to control the blur manually by disabling it
      // when you hover over the buttons in the list and enabling when the mouse leaves the list
      onBlurEnabled: true,
    };

    this.displaySubMenu = this.displaySubMenu.bind(this);
    this.closeSubMenu = this.closeSubMenu.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);
    this.handleSwitchWhiteboardMode = this.handleSwitchWhiteboardMode.bind(this);
    this.handleAnnotationChange = this.handleAnnotationChange.bind(this);
    this.handleThicknessChange = this.handleThicknessChange.bind(this);
    this.handleFontSizeChange = this.handleFontSizeChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentWillMount() {
    const drawSettings = this.props.actions.getCurrentDrawSettings();
    // if there are saved drawSettings in the session storage
    // - retrieve them and update toolbar values
    if (drawSettings) {
      this.setToolbarValues(drawSettings);
    // no drawSettings in the sessionStorage - setting default values
    } else {
      // setting default drawing settings if they haven't been set previously
      const {
        annotationSelected, thicknessSelected, colorSelected, fontSizeSelected,
      } = this.state;
      this.props.actions.setInitialWhiteboardToolbarValues(
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
  }

  componentDidMount() {
    if (!deviceInfo.browserType().isEdge) {
      if (this.state.annotationSelected.value !== 'text') {
        // trigger initial animation on the thickness circle, otherwise it stays at 0
        this.thicknessListIconColor.beginElement();
        this.thicknessListIconRadius.beginElement();
        this.colorListIconColor.beginElement();
      } else {
        this.colorListIconColor.beginElement();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // if color or thickness were changed
    // we might need to trigger svg animation for Color and Thickness icons
    this.animateSvgIcons(prevState);
  }

  setToolbarValues(drawSettings) {
    // divide by 2, since we need the radius for the thickness icon
    const thicknessSelected = { value: drawSettings.whiteboardAnnotationThickness / 2 };
    const fontSizeSelected = { value: drawSettings.textFontSize };
    const colorSelected = { value: INTToHEXColor(drawSettings.whiteboardAnnotationColor) };

    let annotationSelected = {};
    for (let i = 0; i < this.props.annotations.length; i += 1) {
      if (drawSettings.whiteboardAnnotationTool === this.props.annotations[i].value) {
        annotationSelected = this.props.annotations[i];
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

  animateSvgIcons(prevState) {
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
    if (!deviceInfo.browserType().isEdge) {
      // 1st case
      if (this.state.colorSelected.value !== prevState.colorSelected.value) {
        // 1st case b)
        if (this.state.annotationSelected.value !== 'text') {
          this.thicknessListIconColor.beginElement();
        }
        // 1st case a)
        this.colorListIconColor.beginElement();
      // 2nd case
      } else if (this.state.thicknessSelected.value !== prevState.thicknessSelected.value) {
        this.thicknessListIconRadius.beginElement();
        // 3rd case
      } else if (this.state.annotationSelected.value !== 'text' &&
            prevState.annotationSelected.value === 'text') {
        this.thicknessListIconRadius.beginElement();
        this.thicknessListIconColor.beginElement();
      }

      // 4th case, initial animation is triggered in componentDidMount
    }
  }

  // open a submenu
  displaySubMenu(listName) {
    this.setState({
      currentSubmenuOpen: this.state.currentSubmenuOpen === listName ? '' : listName,
    });
  }

  // close a current submenu (fires onBlur only, when you click anywhere on the screen)
  closeSubMenu() {
    // a separate case for the active text shape
    if (this.state.annotationSelected.value === 'text' && this.props.textShapeActiveId !== '') {
      return;
    }

    if (this.state.onBlurEnabled) {
      this.setState({
        currentSubmenuOpen: undefined,
      });
    }
  }

  // undo annotation
  handleUndo() {
    this.props.actions.undoAnnotation(this.props.whiteboardId);
  }

  // clear all annotations
  handleClearAll() {
    this.props.actions.clearWhiteboard(this.props.whiteboardId);
  }

  handleSwitchWhiteboardMode() {
    this.props.actions.changeWhiteboardMode(!this.props.multiUser);
  }

  // changes a current selected annotation both in the state and in the session
  // and closes the annotation list
  handleAnnotationChange(annotation) {
    const obj = {
      annotationSelected: annotation,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    };

    // to animate thickness icon properly when you switch the tool back from Text
    if (annotation.value === 'text') {
      obj.prevThicknessSelected = { value: 0 };
    }

    this.props.actions.setTool(annotation.value);
    this.setState(obj);
  }

  // changes a current selected thickness both in the state and in the session
  // and closes the thickness list
  handleThicknessChange(thicknessSelected) {
    // thickness value * 2 since this is radius, we need to double it
    this.props.actions.setThickness(thicknessSelected.value * 2);

    this.setState({
      prevThicknessSelected: this.state.thicknessSelected,
      thicknessSelected,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleFontSizeChange(fontSize) {
    this.props.actions.setFontSize(fontSize.value);

    this.setState({
      fontSizeSelected: fontSize,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  // changes a current selected color both in the state and in the session
  // and closes the color list
  handleColorChange(color) {
    this.props.actions.setColor(HEXToINTColor(color.value));

    this.setState({
      prevColorSelected: this.state.colorSelected,
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
    const { intl } = this.props;

    return (
      <ToolbarMenuItem
        label={intl.formatMessage(intlMessages.toolbarTools)}
        icon={this.state.annotationSelected.icon}
        onItemClick={this.displaySubMenu}
        objectToReturn="annotationList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'annotationList' ? styles.toolbarActive : null)}
      >
        {this.state.currentSubmenuOpen === 'annotationList' ?
          <ToolbarSubmenu
            type="annotations"
            customIcon={false}
            label="Annotations"
            onItemClick={this.handleAnnotationChange}
            objectsToRender={this.props.annotations}
            objectSelected={this.state.annotationSelected}
            handleMouseEnter={this.handleMouseEnter}
            handleMouseLeave={this.handleMouseLeave}
          />
        : null }
      </ToolbarMenuItem>
    );
  }

  renderFontItem() {
    const { intl } = this.props;

    return (
      <ToolbarMenuItem
        label={intl.formatMessage(intlMessages.toolbarFontSize)}
        customIcon={this.renderFontItemIcon()}
        onItemClick={this.displaySubMenu}
        objectToReturn="fontSizeList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'fontSizeList' ? styles.toolbarActive : null)}
      >
        {this.state.currentSubmenuOpen === 'fontSizeList' ?
          <ToolbarSubmenu
            type="font-size"
            customIcon
            label="Font Size"
            onItemClick={this.handleFontSizeChange}
            objectsToRender={this.props.fontSizes}
            objectSelected={this.state.fontSizeSelected}
            handleMouseEnter={this.handleMouseEnter}
            handleMouseLeave={this.handleMouseLeave}
          />
        : null }
      </ToolbarMenuItem>
    );
  }

  renderFontItemIcon() {
    return (
      <p
        className={styles.textThickness}
        style={{
          fontSize: this.state.fontSizeSelected.value,
          color: this.state.colorSelected.value,
          WebkitTransition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`, /* Safari */
          transition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`,
        }}
      >
        Aa
      </p>
    );
  }

  renderThicknessItem() {
    const { intl } = this.props;
    const isDisabled = this.state.annotationSelected.value === 'pointer';
    return (
      <ToolbarMenuItem
        disabled={isDisabled}
        label={isDisabled ?
          intl.formatMessage(intlMessages.toolbarLineThicknessDisabled)
          : intl.formatMessage(intlMessages.toolbarLineThickness)}
        onItemClick={this.displaySubMenu}
        objectToReturn="thicknessList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'thicknessList' ? styles.toolbarActive : null)}
        customIcon={this.renderThicknessItemIcon()}
      >
        {this.state.currentSubmenuOpen === 'thicknessList' ?
          <ToolbarSubmenu
            type="thickness"
            customIcon
            label="Thickness"
            onItemClick={this.handleThicknessChange}
            objectsToRender={this.props.thicknessRadiuses}
            objectSelected={this.state.thicknessSelected}
            handleMouseEnter={this.handleMouseEnter}
            handleMouseLeave={this.handleMouseLeave}
          />
        : null }
      </ToolbarMenuItem>
    );
  }

  renderThicknessItemIcon() {
    return (
      <svg className={styles.customSvgIcon} shapeRendering="geometricPrecision">
        { !deviceInfo.browserType().isEdge ?
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
              from={this.state.prevColorSelected.value}
              to={this.state.colorSelected.value}
              begin="indefinite"
              dur={TRANSITION_DURATION}
              repeatCount="0"
              fill="freeze"
            />
            <animate
              ref={(ref) => { this.thicknessListIconRadius = ref; }}
              attributeName="r"
              attributeType="XML"
              from={this.state.prevThicknessSelected.value}
              to={this.state.thicknessSelected.value}
              begin="indefinite"
              dur={TRANSITION_DURATION}
              repeatCount="0"
              fill="freeze"
            />
          </circle> : 
          <circle cx="50%" cy="50%" r={this.state.thicknessSelected.value} stroke="black" stroke-width="1" fill={this.state.colorSelected.value} />
        }
      </svg>
    );
  }

  renderColorItem() {
    const { intl } = this.props;
    const isDisabled = this.state.annotationSelected.value === 'pointer';
    return (
      <ToolbarMenuItem
        disabled={isDisabled}
        label={isDisabled ?
          intl.formatMessage(intlMessages.toolbarLineColorDisabled)
          : intl.formatMessage(intlMessages.toolbarLineColor)}
        onItemClick={this.displaySubMenu}
        objectToReturn="colorList"
        onBlur={this.closeSubMenu}
        className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'colorList' ? styles.toolbarActive : null)}
        customIcon={this.renderColorItemIcon()}
      >
        {this.state.currentSubmenuOpen === 'colorList' ?
          <ToolbarSubmenu
            type="color"
            customIcon
            label="Color"
            onItemClick={this.handleColorChange}
            objectsToRender={this.props.colors}
            objectSelected={this.state.colorSelected}
            handleMouseEnter={this.handleMouseEnter}
            handleMouseLeave={this.handleMouseLeave}
          />
        : null }
      </ToolbarMenuItem>
    );
  }

  renderColorItemIcon() {
    return (
      <svg className={styles.customSvgIcon}>
        { !deviceInfo.browserType().isEdge ?
          <rect x="25%" y="25%" width="50%" height="50%" stroke="black" strokeWidth="1">
            <animate
              ref={(ref) => { this.colorListIconColor = ref; }}
              attributeName="fill"
              attributeType="XML"
              from={this.state.prevColorSelected.value}
              to={this.state.colorSelected.value}
              begin="indefinite"
              dur={TRANSITION_DURATION}
              repeatCount="0"
              fill="freeze"
            />
          </rect> :
          <rect x="25%" y="25%" width="50%" height="50%" stroke="black" strokeWidth="1" fill={this.state.colorSelected.value}/>
        }
      </svg>
    );
  }

  renderUndoItem() {
    const { intl } = this.props;

    return (
      <ToolbarMenuItem
        label={intl.formatMessage(intlMessages.toolbarUndoAnnotation)}
        icon="undo"
        onItemClick={this.handleUndo}
        className={cx(styles.toolbarButton, styles.notActive)}
      />
    );
  }

  renderClearAllItem() {
    const { intl } = this.props;

    return (
      <ToolbarMenuItem
        label={intl.formatMessage(intlMessages.toolbarClearAnnotations)}
        icon="circle_close"
        onItemClick={this.handleClearAll}
        className={cx(styles.toolbarButton, styles.notActive)}
      />
    );
  }

  renderMultiUserItem() {
    const { intl, multiUser } = this.props;

    return (
      <ToolbarMenuItem
        label={multiUser ? intl.formatMessage(intlMessages.toolbarMultiUserOff) : intl.formatMessage(intlMessages.toolbarMultiUserOn)}
        icon={multiUser ? 'multi_whiteboard' : 'whiteboard'}
        onItemClick={this.handleSwitchWhiteboardMode}
        className={cx(styles.toolbarButton, styles.notActive)}
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
          {annotationSelected.value === 'text' ?
            this.renderFontItem()
            :
            this.renderThicknessItem()
          }
          {this.renderColorItem()}
          {this.renderUndoItem()}
          {this.renderClearAllItem()}
          {isPresenter ?
          this.renderMultiUserItem()
        : null }
        </div>
      </div>
    );
  }
}

WhiteboardToolbar.defaultProps = {
  colors: ANNOTATION_COLORS,
  thicknessRadiuses: THICKNESS_RADIUSES,
  fontSizes: FONT_SIZES,
  annotations: ANNOTATION_TOOLS,
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
  }).isRequired).isRequired,

  // defines an array of colors for the toolbar (color submenu)
  colors: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  // defines an array of thickness values for the toolbar and their corresponding session values
  thicknessRadiuses: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
  }).isRequired).isRequired,

  intl: intlShape.isRequired,

};

export default injectWbResizeEvent(injectIntl(WhiteboardToolbar));
