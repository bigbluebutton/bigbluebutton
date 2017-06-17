import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { findDOMNode } from 'react-dom';

export default class WhiteboardToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //a variable to control which list is currently open
      currentSubmenuOpen: '',

      //variables to keep current selected draw settings
      annotationSelected: {
        icon: 'hand',
        sessionValue: 'Hand',
      },
      thicknessSelected: {
        iconRadius: 4,
        sessionRadius: 3,
      },
      colorSelected: '#000000',
      fontSizeSelected: 18,

      //keeping the previous color and the thickness icon's radius selected for svg animation
      prevColorSelected: '#000000',
      prevIconRadius: 4,

      //lists of tools/thickness/colors are not direct children of main toolbar buttons
      //and we want the list to close when onBlur fires at the main toolbar button
      //(click anywhere on the screen) thus we have to control the blur manually by disabling it
      //when you hover over the buttons in the list and enabling when the mouse leaves the list
      onBlurEnabled: true,
    };

    this.displaySubMenu = this.displaySubMenu.bind(this);
    this.closeSubMenu = this.closeSubMenu.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleClearAll = this.handleClearAll.bind(this);
    this.handleAnnotationChange = this.handleAnnotationChange.bind(this);
    this.handleThicknessChange = this.handleThicknessChange.bind(this);
    this.handleFontSizeChange = this.handleFontSizeChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.disableOnBlur = this.disableOnBlur.bind(this);
    this.enableOnBlur = this.enableOnBlur.bind(this);
  }

  componentWillMount() {

    //setting default or resetting current drawing settings in the session
    const { annotationSelected, thicknessSelected, colorSelected, fontSizeSelected } = this.state;
    this.props.actions.setWhiteboardToolbarValues(
      annotationSelected.sessionValue,
      thicknessSelected.sessionRadius,
      this.HEXToINTColor(colorSelected),
      fontSizeSelected,
      {
        textShapeValue: '',
        textShapeActiveId: '',
      },
    );
  }

  componentDidMount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));

    if(this.state.annotationSelected.sessionValue != "Text") {
      //trigger initial animation on the thickness circle, otherwise it stays at 0
      var node = findDOMNode(this.thicknessListIconRadius);
      node.beginElement();
    }
  }

  componentWillUnmount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentDidUpdate(prevProps, prevState) {
    // if color or thickness were changed
    // we might need to trigger svg animation for Color and Thickness icons
    this.animateSvgIcons(prevState);
  }

  animateSvgIcons(prevState) {
    /* Animation for the svg icons that we use for thickness (circle) and color (rectangle)
     * has to be triggered manually
     * we have 4 main cases:
     * 1. Color change -
         a) Text tool is selected, Font-Size icon substitutes the thickness icon,
            thus we need to trigger just color change for the color icon
         b) Any other tool than Text tool is selected - trigger color change for both icons
     * 2. Thickness change - trigger radius for the thickness icon
     * 3. Switch from the Text tool to any other - trigger color and radius for thickness
     * 4. Trigger initial animation for the icons
    */

    // 1st case
    if(this.state.colorSelected != prevState.colorSelected) {
      // 1st case a)
      if(this.state.annotationSelected.sessionValue == "Text") {
        const node = findDOMNode(this.colorListIconColor);
        node.beginElement();
      // 1st case b)
      } else {
        const node = findDOMNode(this.colorListIconColor);
        const node2 = findDOMNode(this.thicknessListIconColor);
        node.beginElement();
        node2.beginElement();
      }
    // 2nd case
    } else if(this.state.thicknessSelected.iconRadius != prevState.thicknessSelected.iconRadius) {
      const node = findDOMNode(this.thicknessListIconRadius);
      node.beginElement();
    }

    // 3rd case
    else if(this.state.annotationSelected.sessionValue != "Text" &&
          prevState.annotationSelected.sessionValue == "Text") {
      const node = findDOMNode(this.thicknessListIconRadius);
      const node2 = findDOMNode(this.thicknessListIconColor);
      node.beginElement();
      node2.beginElement();
    }

    // 4th case, initial animation (just thickness) is triggered in componentDidMount
  }

  //open a submenu
  displaySubMenu(listName) {
    this.setState({
      currentSubmenuOpen: this.state.currentSubmenuOpen == listName ? '' : listName,
    });
  }

  //close a current submenu (fires onBlur only, when you click anywhere on the screen)
  closeSubMenu() {

    // a separate case for the active text shape
    if(this.state.annotationSelected.sessionValue == "Text" && this.props.textShapeActiveId != '') {
      return;
    }

    if(this.state.onBlurEnabled) {
      this.setState({
        currentSubmenuOpen: undefined,
      });
    }
  }

  //undo annotation
  handleUndo() {
    this.props.actions.undoAnnotation(this.props.whiteboardId);
  }

  //clear all annotations
  handleClearAll() {
    this.props.actions.clearWhiteboard(this.props.whiteboardId);
  }

  //changes a current selected annotation both in the state and in the session
  //and closes the annotation list
  handleAnnotationChange(annotation) {

    const obj = {
      annotationSelected: annotation,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    };

    // to animate thickness icon properly when you switch the tool back from Text
    if(annotation.sessionValue == "Text") {
      obj.prevIconRadius = 0;
    }

    this.props.actions.setTool(annotation.sessionValue);
    this.setState(obj);
  }

  //changes a current selected thickness both in the state and in the session
  //and closes the thickness list
  handleThicknessChange(thicknessObj) {
    this.props.actions.setThickness(thicknessObj.sessionRadius);

    this.setState({
      prevIconRadius: this.state.thicknessSelected.iconRadius,
      thicknessSelected: thicknessObj,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleFontSizeChange(fontSizeObj) {
    this.props.actions.setFontSize(fontSizeObj.fontSize);

    this.setState({
      fontSizeSelected: fontSizeObj.fontSize,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  //changes a current selected color both in the state and in the session
  //and closes the color list
  handleColorChange(color) {
    this.props.actions.setColor(this.HEXToINTColor(color));

    this.setState({
      prevColorSelected: this.state.colorSelected,
      colorSelected: color,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  HEXToINTColor(hexColor) {
    var _rrggbb = hexColor.slice(1);
    var rrggbb = _rrggbb.substr(0, 2) + _rrggbb.substr(2, 2) + _rrggbb.substr(4, 2);
    return parseInt(rrggbb, 16);
  }

  //disabling onBlur flag when mouse is over the items in the lists
  disableOnBlur() {
    this.setState({
      onBlurEnabled: false,
    });
  }

  //enabling the onBlur flag when the mouse leaving the lists
  enableOnBlur() {
    this.setState({
      onBlurEnabled: true,
    });
  }

  renderAnnotationList() {

    return (
      <div className={cx(styles.annotationList, styles.toolbarList)}>
        { this.props.annotations? this.props.annotations.map((annotation, index) =>
          <Button
            label="Annotation"
            hideLabel={true}
            color={'default'}
            icon={annotation.icon}
            size={'md'}
            className={cx(styles.toolbarListButton, this.state.annotationSelected.sessionValue == annotation.sessionRadius ? styles.selectedListButton : '')}
            onClick={this.handleAnnotationChange.bind(null, annotation)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            key={index}
            role="button"
          />
        ) : null}
      </div>
    );
  }

  renderFontSizeList() {

    return (
      <div className={cx(styles.fontSizeList, styles.toolbarList)}>
        {this.props.fontSizes ? this.props.fontSizes.map((fontSizeObj, index) =>
          <Button
            hideLabel={true}
            label="Radius"
            color={'default'}
            size={'md'}
            className={cx(styles.toolbarListButton, styles.fontSizeListButton, this.state.fontSizeSelected == fontSizeObj.fontSize ? styles.selectedListButton : '')}
            onClick={this.handleFontSizeChange.bind(null, fontSizeObj)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            key={index}
            customIcon={
              <p className={styles.textThickness} style={{fontSize: fontSizeObj.fontSize}}>
                Aa
              </p>
            }
          >
          </Button>
        ) : null}
      </div>
    );
  }

  renderThicknessList() {

    return (
      <div className={cx(styles.thicknessList, styles.toolbarList)}>
        {this.props.thicknessRadiuses ? this.props.thicknessRadiuses.map((thicknessObj, index) =>
          <Button
            label="Radius"
            hideLabel={true}
            color={'default'}
            size={'md'}
            className={cx(styles.toolbarListButton, this.state.thicknessSelected.sessionRadius == thicknessObj.sessionRadius ? styles.selectedListButton : '')}
            onClick={this.handleThicknessChange.bind(null, thicknessObj)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            customIcon={
              <svg className={styles.customSvgIcon}>
                <circle cx="50%" cy="50%" r={thicknessObj.iconRadius} fill="#F3F6F9"/>
              </svg>
            }
            key={index}
          />
        ) : null}
      </div>
    );
  }

  renderColorList() {

    return (
      <div className={cx(styles.colorList, styles.toolbarList)}>
        {this.props.colors ? this.props.colors.map((color) =>
          <Button
            label="Color"
            hideLabel={true}
            color={'default'}
            size={'md'}
            className={cx(styles.toolbarListButton, this.state.colorSelected == color ? styles.selectedListButton : '')}
            onClick={this.handleColorChange.bind(null, color)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            customIcon={
              <svg className={styles.customSvgIcon}>
                <rect x="20%" y="20%" width="60%" height="60%" fill={color}/>
              </svg>
            }
            key={color}
            role="button"
            aria-labelledby={`${color}Label`}
            aria-describedby={`${color}Descrip`}
          />
        ) : null}
      </div>
    );
  }

  render() {

    return (
      <div className={styles.toolbarContainer} style={{height: this.props.height}}>
        <div className={styles.toolbarWrapper}>
          <div className={styles.buttonWrapper}>
            <Button
              label="Tools"
              hideLabel={true}
              role="button"
              color={'default'}
              icon={this.state.annotationSelected.icon}
              size={'md'}
              onClick={this.displaySubMenu.bind(null, "annotationList")}
              onBlur={this.closeSubMenu}
              className={cx(styles.toolbarButton, this.state.currentSubmenuOpen == "annotationList" ? '' : styles.notActive)}
            />
            {this.state.currentSubmenuOpen == "annotationList" ?
              this.renderAnnotationList()
            : null }
          </div>

          {this.state.annotationSelected.sessionValue == "Text" ?
            <div className={styles.buttonWrapper}>
              <Button
                label="Thickness List"
                hideLabel={true}
                role="button"
                color={'default'}
                size={'md'}
                onClick={this.displaySubMenu.bind(null, "fontSizeList")}
                onBlur={this.closeSubMenu}
                className={cx(styles.toolbarButton, this.state.currentSubmenuOpen == "fontSizeList" ? '' : styles.notActive)}
                customIcon={
                  <p className={styles.textThickness} style={{fontSize: this.state.fontSizeSelected, color: this.state.colorSelected}}>
                    Aa
                  </p>
                }
              />
              {this.state.currentSubmenuOpen == "fontSizeList" ?
                this.renderFontSizeList()
              : null }
            </div>
          :
            <div className={styles.buttonWrapper}>
              <Button
                label="Thickness List"
                hideLabel={true}
                role="button"
                color={'default'}
                size={'md'}
                onClick={this.displaySubMenu.bind(null, "thicknessList")}
                onBlur={this.closeSubMenu}
                className={cx(styles.toolbarButton, this.state.currentSubmenuOpen == "thicknessList" ? '' : styles.notActive)}
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
                        dur="0.4s"
                        repeatCount="0"
                        fill="freeze"
                      />
                      <animate
                        ref={(ref) => { this.thicknessListIconRadius = ref; }}
                        attributeName="r"
                        attributeType="XML"
                        from={this.state.prevIconRadius}
                        to={this.state.thicknessSelected.iconRadius}
                        begin={'indefinite'}
                        dur="0.4s"
                        repeatCount="0"
                        fill="freeze"
                      />
                    </circle>
                  </svg>
                }
              />
              {this.state.currentSubmenuOpen == "thicknessList" ?
                this.renderThicknessList()
              : null }
            </div>
          }
          <div className={styles.buttonWrapper}>
            <Button
              label="Color List"
              hideLabel={true}
              role="button"
              color={'default'}
              size={'md'}
              onClick={this.displaySubMenu.bind(null, "colorList")}
              onBlur={this.closeSubMenu}
              className={cx(styles.toolbarButton, this.state.currentSubmenuOpen == "colorList" ? '' : styles.notActive)}
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
                    dur="0.4s"
                    repeatCount="0"
                    fill="freeze"
                  />
                </rect>
              </svg>
            }
            />
            {this.state.currentSubmenuOpen == "colorList" ?
              this.renderColorList()
            : null }
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              label="Undo Annotation"
              hideLabel={true}
              role="button"
              color={'default'}
              icon={'undo'}
              size={'md'}
              onClick={this.handleUndo}
              className={cx(styles.toolbarButton, styles.notActive)}
            />
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              label="Clear All Annotations"
              hideLabel={true}
              role="button"
              color={'default'}
              icon={'circle_close'}
              size={'md'}
              onClick={this.handleClearAll}
              className={cx(styles.toolbarButton, styles.notActive)}
            />
          </div>
        </div>
      </div>
    );
  }
}

const defaultProps = {
  colors: [
      '#000000', '#FFFFFF', '#FF0000', '#FF8800', '#CCFF00','#00FF00',
      '#00FFFF', '#0088FF', '#0000FF', '#8800FF', '#FF00FF', '#C0C0C0'
  ],
  thicknessRadiuses: [
    {iconRadius: 14, sessionRadius: 30},
    {iconRadius: 12, sessionRadius: 22},
    {iconRadius: 10, sessionRadius: 15},
    {iconRadius: 8, sessionRadius: 10},
    {iconRadius: 6, sessionRadius:6},
    {iconRadius: 4, sessionRadius: 3},
    {iconRadius: 2, sessionRadius: 1}
  ],
  annotations: [
    {icon: 'text_tool', sessionValue: "Text"},
    {icon: 'linte_tool', sessionValue:"Line"},
    {icon: 'circle_tool', sessionValue: "Ellipse"},
    {icon: 'triangle_tool', sessionValue: "Triangle"},
    {icon: 'rectangle_tool', sessionValue: "Rectangle"},
    {icon: 'pen_tool', sessionValue: "Pencil"},
    {icon: 'hand', sessionValue: "Hand"}
  ],
  fontSizes: [
    {fontSize: 36},
    {fontSize: 32},
    {fontSize: 28},
    {fontSize: 24},
    {fontSize: 20},
    {fontSize: 16},
    {fontSize: 12},
  ],
};

WhiteboardToolbar.defaultProps = defaultProps;
