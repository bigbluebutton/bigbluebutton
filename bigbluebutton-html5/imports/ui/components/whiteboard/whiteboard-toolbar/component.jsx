import React, { Component, PropTypes } from 'react';
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
        iconRadius: 6,
        sessionRadius: 6,
      },
      colorSelected: '#000000',
      fontSizeSelected: 18,

      //keeping the previous color and the thickness icon's radius selected for svg animation
      prevColorSelected: '#000000',
      prevIconRadius: 6,

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
    this.props.setWhiteboardToolbarValues(
      annotationSelected.sessionValue,
      thicknessSelected.sessionRadius,
      this.HEXToINTColor(colorSelected),
      fontSizeSelected,
    );
  }

  componentDidMount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentWillUnmount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentDidUpdate(prevProps, prevState) {
    //check if thickness or color have changed and we need to trigger svg animation
    const { thicknessRadius, thicknessColor, colorColor } = this.refs;
    if(this.state.thicknessSelected.iconRadius != prevState.thicknessSelected.iconRadius) {
      var node1 = findDOMNode(thicknessRadius);
      node1.beginElement();
    }
    if(this.state.colorSelected != prevState.colorSelected) {
      var node2 = findDOMNode(thicknessColor);
      var node3 = findDOMNode(colorColor);
      node2.beginElement();
      node3.beginElement();
    }
  }

  //open a submenu
  displaySubMenu(listName) {
    this.setState({
      currentSubmenuOpen: this.state.currentSubmenuOpen == listName ? '' : listName,
    });
  }

  //close a current submenu (fires onBlur only, when you click anywhere on the screen)
  closeSubMenu() {
    if(this.state.onBlurEnabled) {
      this.setState({
        currentSubmenuOpen: undefined,
      });
    }
  }

  //undo annotation
  handleUndo() {
    this.props.undoAnnotation(this.props.whiteboardId);
  }

  //clear all annotations
  handleClearAll() {
    this.props.clearWhiteboard(this.props.whiteboardId);
  }

  //changes a current selected annotation both in the state and in the session
  //and closes the annotation list
  handleAnnotationChange(annotation) {
    const { thicknessSelected, colorSelected, fontSizeSelected } = this.state;
    this.props.setWhiteboardToolbarValues(
      annotation.sessionValue,
      thicknessSelected.sessionRadius,
      this.HEXToINTColor(colorSelected),
      fontSizeSelected,
    );

    this.setState({
      annotationSelected: annotation,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  //changes a current selected thickness both in the state and in the session
  //and closes the thickness list
  handleThicknessChange(thicknessObj) {
    const { annotationSelected, colorSelected, fontSizeSelected } = this.state;
    this.props.setWhiteboardToolbarValues(
      annotationSelected.sessionValue,
      thicknessObj.sessionRadius,
      this.HEXToINTColor(colorSelected),
      fontSizeSelected,
    );

    this.setState({
      prevIconRadius: this.state.thicknessSelected.iconRadius,
      thicknessSelected: thicknessObj,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleFontSizeChange(fontSizeObj) {
    const { annotationSelected, colorSelected, thicknessSelected } = this.state;

    this.props.setWhiteboardToolbarValues(
      annotationSelected.sessionValue,
      thicknessSelected.sessionRadius,
      this.HEXToINTColor(colorSelected),
      fontSizeObj.fontSize,
    );

    this.setState({
      fontSizeSelected: fontSizeObj.fontSize,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  //changes a current selected color both in the state and in the session
  //and closes the color list
  handleColorChange(color) {
    const { annotationSelected, thicknessSelected, fontSizeSelected } = this.state;
    this.props.setWhiteboardToolbarValues(
      annotationSelected.sessionValue,
      thicknessSelected.sessionRadius,
      this.HEXToINTColor(color),
      fontSizeSelected
    );
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
                      r={this.state.thicknessSelected.iconRadius}
                      stroke="black"
                      strokeWidth="1"
                    >
                      <animate
                        ref="thicknessColor"
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
                        ref="thicknessRadius"
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
                    ref="colorColor"
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
    {fontSize: 30},
    {fontSize: 24},
    {fontSize: 20},
    {fontSize: 18},
    {fontSize: 16},
    {fontSize: 14},
    {fontSize: 12},
  ],
};

WhiteboardToolbar.defaultProps = defaultProps;
