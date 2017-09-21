import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles.scss';
import WhiteboardToolbarItem from './whiteboard-toolbar-item/component';

const TRANSITION_DURATION = '0.4s';
const TOOLBAR_CONFIG = Meteor.settings.public.whiteboard.toolbar;
const ANNOTATION_COLORS = TOOLBAR_CONFIG.colors;
const THICKNESS_RADIUSES = TOOLBAR_CONFIG.thickness;
const FONT_SIZES = TOOLBAR_CONFIG.font_sizes;
const ANNOTATION_TOOLS = TOOLBAR_CONFIG.tools;

export default class WhiteboardToolbar extends Component {

  static HEXToINTColor(hexColor) {
    const _rrggbb = hexColor.slice(1);
    const rrggbb = _rrggbb.substr(0, 2) + _rrggbb.substr(2, 2) + _rrggbb.substr(4, 2);
    return parseInt(rrggbb, 16);
  }

  static INTToHEXColor(intColor) {
    let hex;
    hex = parseInt(intColor, 10).toString(16);
    while (hex.length < 6) {
      hex = `0${hex}`;
    }

    return `#${hex}`;
  }

  constructor(props) {
    super(props);

    this.state = {
      // a variable to control which list is currently open
      currentSubmenuOpen: '',

      // variables to keep current selected draw settings
      annotationSelected: {
        icon: 'hand',
        name: 'hand',
      },
      thicknessSelected: 4,
      colorSelected: '#000000',
      fontSizeSelected: 20,

      // keeping the previous color and the thickness icon's radius selected for svg animation
      prevColorSelected: '#000000',
      prevIconRadius: 4,

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
    this.renderAnnotationList = this.renderAnnotationList.bind(this);
    this.renderFontSizeList = this.renderFontSizeList.bind(this);
    this.renderThicknessList = this.renderThicknessList.bind(this);
    this.renderColorList = this.renderColorList.bind(this);
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
      const { annotationSelected, thicknessSelected, colorSelected, fontSizeSelected } = this.state;
      this.props.actions.setInitialWhiteboardToolbarValues(
        annotationSelected.name,
        thicknessSelected * 2,
        WhiteboardToolbar.HEXToINTColor(colorSelected),
        fontSizeSelected,
        {
          textShapeValue: '',
          textShapeActiveId: '',
        },
      );
    }
  }

  componentDidMount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));

    if (this.state.annotationSelected.name !== 'text') {
      // trigger initial animation on the thickness circle, otherwise it stays at 0
      this.thicknessListIconColor.beginElement();
      this.thicknessListIconRadius.beginElement();
      this.colorListIconColor.beginElement();
    } else {
      this.colorListIconColor.beginElement();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // if color or thickness were changed
    // we might need to trigger svg animation for Color and Thickness icons
    this.animateSvgIcons(prevState);
  }

  componentWillUnmount() {
    // to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  setToolbarValues(drawSettings) {
    // divide by 2, since we need the radius for the thickness icon
    const thicknessSelected = drawSettings.whiteboardAnnotationThickness / 2;
    const fontSizeSelected = drawSettings.textFontSize;
    const colorSelected = WhiteboardToolbar.INTToHEXColor(drawSettings.whiteboardAnnotationColor);

    let annotationSelected = {};
    for (let i = 0; i < this.props.annotations.length; i += 1) {
      if (drawSettings.whiteboardAnnotationTool === this.props.annotations[i].name) {
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

    // 1st case
    if (this.state.colorSelected !== prevState.colorSelected) {
      // 1st case b)
      if (this.state.annotationSelected.name !== 'text') {
        this.thicknessListIconColor.beginElement();
      }
      // 1st case a)
      this.colorListIconColor.beginElement();
    // 2nd case
    } else if (this.state.thicknessSelected !== prevState.thicknessSelected) {
      this.thicknessListIconRadius.beginElement();
      // 3rd case
    } else if (this.state.annotationSelected.name !== 'text' &&
          prevState.annotationSelected.name === 'text') {
      this.thicknessListIconRadius.beginElement();
      this.thicknessListIconColor.beginElement();
    }

    // 4th case, initial animation is triggered in componentDidMount
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
    if (this.state.annotationSelected.name === 'text' && this.props.textShapeActiveId !== '') {
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
    if (annotation.name === 'text') {
      obj.prevIconRadius = 0;
    }

    this.props.actions.setTool(annotation.name);
    this.setState(obj);
  }

  // changes a current selected thickness both in the state and in the session
  // and closes the thickness list
  handleThicknessChange(thicknessValue) {
    // thicknessValue * 2 since this is radius, we need to double it
    this.props.actions.setThickness(thicknessValue * 2);

    this.setState({
      prevIconRadius: this.state.thicknessSelected,
      thicknessSelected: thicknessValue,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleFontSizeChange(fontSizeValue) {
    this.props.actions.setFontSize(fontSizeValue);

    this.setState({
      fontSizeSelected: fontSizeValue,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  // changes a current selected color both in the state and in the session
  // and closes the color list
  handleColorChange(color) {
    this.props.actions.setColor(WhiteboardToolbar.HEXToINTColor(color));

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

  renderAnnotationList() {
    const { annotations } = this.props;

    return (
      <div className={cx(styles.annotationList, styles.toolbarList)}>
        { annotations ? annotations.map(annotation =>
          (
            <WhiteboardToolbarItem
              label={'Annotation'}
              icon={annotation.icon}
              onItemClick={this.handleAnnotationChange}
              objectToReturn={annotation}
              className={cx(styles.toolbarListButton, this.state.annotationSelected.name === annotation.name ? styles.selectedListButton : '')}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              key={annotation.name}
            />
          ),
        ) : null}
      </div>
    );
  }

  renderFontSizeList() {
    const { fontSizes } = this.props;

    return (
      <div className={cx(styles.fontSizeList, styles.toolbarList)}>
        {fontSizes ? fontSizes.map(fontSizeValue =>
          (
            <WhiteboardToolbarItem
              label={'Font Size'}
              customIcon={
                <p className={styles.textThickness} style={{ fontSize: fontSizeValue }}>
                  Aa
                </p>
              }
              onItemClick={this.handleFontSizeChange}
              objectToReturn={fontSizeValue}
              className={cx(styles.toolbarListButton, styles.fontSizeListButton, this.state.fontSizeSelected === fontSizeValue ? styles.selectedListButton : '')}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              key={fontSizeValue}
            />
          ),
        ) : null}
      </div>
    );
  }

  renderThicknessList() {
    const { thicknessRadiuses } = this.props;

    return (
      <div className={cx(styles.thicknessList, styles.toolbarList)}>
        {thicknessRadiuses ? thicknessRadiuses.map(thicknessRadius =>
          (
            <WhiteboardToolbarItem
              label={'Radius'}
              customIcon={
                <svg className={styles.customSvgIcon}>
                  <circle cx="50%" cy="50%" r={thicknessRadius} fill="#F3F6F9" />
                </svg>
              }
              onItemClick={this.handleThicknessChange}
              objectToReturn={thicknessRadius}
              className={cx(styles.toolbarListButton, this.state.thicknessSelected === thicknessRadius ? styles.selectedListButton : '')}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              key={thicknessRadius}
            />
          ),
        ) : null}
      </div>
    );
  }

  renderColorList() {
    const { colors } = this.props;

    return (
      <div className={cx(styles.colorList, styles.toolbarList)}>
        {colors ? colors.map(color =>
          (
            <WhiteboardToolbarItem
              label={'Color'}
              customIcon={
                <svg className={styles.customSvgIcon}>
                  <rect x="20%" y="20%" width="60%" height="60%" fill={color} />
                </svg>
              }
              onItemClick={this.handleColorChange}
              objectToReturn={color}
              className={cx(styles.toolbarListButton, this.state.colorSelected === color ? styles.selectedListButton : '')}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              key={color}
            />
          ),
        ) : null}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.toolbarContainer} style={{ height: this.props.height }}>
        <div className={styles.toolbarWrapper}>
          <WhiteboardToolbarItem
            label={'Tools'}
            icon={this.state.annotationSelected.icon}
            onItemClick={this.displaySubMenu}
            objectToReturn={'annotationList'}
            onBlur={this.closeSubMenu}
            className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'annotationList' ? '' : styles.notActive)}
            renderSubMenu={this.state.currentSubmenuOpen === 'annotationList' ? this.renderAnnotationList : null}
          />
          {this.state.annotationSelected.name === 'text' ?
            <WhiteboardToolbarItem
              label={'Font Size List'}
              customIcon={
                <p
                  className={styles.textThickness}
                  style={{
                    fontSize: this.state.fontSizeSelected,
                    color: this.state.colorSelected,
                    WebkitTransition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`, /* Safari */
                    transition: `color ${TRANSITION_DURATION}, font-size ${TRANSITION_DURATION}`,
                  }}
                >
                  Aa
                </p>
              }
              onItemClick={this.displaySubMenu}
              objectToReturn={'fontSizeList'}
              onBlur={this.closeSubMenu}
              className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'fontSizeList' ? '' : styles.notActive)}
              renderSubMenu={this.state.currentSubmenuOpen === 'fontSizeList' ? this.renderFontSizeList : null}
            />
          :
              <WhiteboardToolbarItem
                label={'Thickness List'}
                onItemClick={this.displaySubMenu}
                objectToReturn={'thicknessList'}
                onBlur={this.closeSubMenu}
                className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'thicknessList' ? '' : styles.notActive)}
                renderSubMenu={this.state.currentSubmenuOpen === 'thicknessList' ? this.renderThicknessList : null}
                customIcon={
                  <svg className={styles.customSvgIcon} shapeRendering="geometricPrecision">
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
                        from={this.state.prevColorSelected}
                        to={this.state.colorSelected}
                        begin={'indefinite'}
                        dur={TRANSITION_DURATION}
                        repeatCount="0"
                        fill="freeze"
                      />
                      <animate
                        ref={(ref) => { this.thicknessListIconRadius = ref; }}
                        attributeName="r"
                        attributeType="XML"
                        from={this.state.prevIconRadius}
                        to={this.state.thicknessSelected}
                        begin={'indefinite'}
                        dur={TRANSITION_DURATION}
                        repeatCount="0"
                        fill="freeze"
                      />
                    </circle>
                  </svg>
              }
              />
          }
          <WhiteboardToolbarItem
            label={'Color List'}
            onItemClick={this.displaySubMenu}
            objectToReturn={'colorList'}
            onBlur={this.closeSubMenu}
            className={cx(styles.toolbarButton, this.state.currentSubmenuOpen === 'colorList' ? '' : styles.notActive)}
            renderSubMenu={this.state.currentSubmenuOpen === 'colorList' ? this.renderColorList : null}
            customIcon={
              <svg className={styles.customSvgIcon}>
                <rect x="25%" y="25%" width="50%" height="50%" stroke="black" strokeWidth="1">
                  <animate
                    ref={(ref) => { this.colorListIconColor = ref; }}
                    attributeName="fill"
                    attributeType="XML"
                    from={this.state.prevColorSelected}
                    to={this.state.colorSelected}
                    begin={'indefinite'}
                    dur={TRANSITION_DURATION}
                    repeatCount="0"
                    fill="freeze"
                  />
                </rect>
              </svg>
              }
          />
          <WhiteboardToolbarItem
            label={'Undo Annotation'}
            icon={'undo'}
            onItemClick={this.handleUndo}
            className={cx(styles.toolbarButton, styles.notActive)}
          />
          <WhiteboardToolbarItem
            label={'Clear All Annotations'}
            icon={'circle_close'}
            onItemClick={this.handleClearAll}
            className={cx(styles.toolbarButton, styles.notActive)}
          />
          {this.props.isPresenter ?
            <WhiteboardToolbarItem
              label={this.props.multiUser ? 'Turn multi-user mode off' : 'Tuen multi-user mode on'}
              icon={this.props.multiUser ? 'multi_whiteboard' : 'whiteboard'}
              onItemClick={this.handleSwitchWhiteboardMode}
              className={cx(styles.toolbarButton, styles.notActive)}
            />
          : null}
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
  fontSizes: PropTypes.arrayOf(PropTypes.number).isRequired,

  // defines an array of colors for the toolbar (color submenu)
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,

  // defines an array of thickness values for the toolbar and their corresponding session values
  thicknessRadiuses: PropTypes.arrayOf(PropTypes.number).isRequired,

  // defines the physical height of the whiteboard
  height: PropTypes.number.isRequired,
};
