import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';

export default class WhiteboardToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSubmenuOpen: '',
      annotationSelected: 'hand',
      thicknessSelected: 6,
      colorSelected: '#000000',
      onBlurEnabled: true,
    };

    this.displaySubMenu = this.displaySubMenu.bind(this);
    this.closeSubMenu = this.closeSubMenu.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleRemoveAll = this.handleRemoveAll.bind(this);
    this.handleAnnotationChange = this.handleAnnotationChange.bind(this);
    this.handleThicknessChange = this.handleThicknessChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.disableOnBlur = this.disableOnBlur.bind(this);
    this.enableOnBlur = this.enableOnBlur.bind(this);
  }

  componentDidMount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  componentWillUnmount() {
    //to let the whiteboard know that the presentation area's size has changed
    window.dispatchEvent(new Event('resize'));
  }

  displaySubMenu(listName) {
    this.setState({
      currentSubmenuOpen: this.state.currentSubmenuOpen == listName ? '' : listName,
    });
  }

  closeSubMenu() {
    if(this.state.onBlurEnabled) {
      this.setState({
        currentSubmenuOpen: undefined,
      });
    }
  }

  handleUndo() {
    this.props.undoAnnotation();
  }

  handleRemoveAll() {
    console.log('handle clear all annotations action');
  }

  handleAnnotationChange(annotation) {
    this.setState({
      annotationSelected: annotation,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleThicknessChange(radius) {
    this.setState({
      thicknessSelected: radius,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  handleColorChange(color) {
    this.setState({
      colorSelected: color,
      onBlurEnabled: true,
      currentSubmenuOpen: '',
    });
  }

  disableOnBlur() {
    this.setState({
      onBlurEnabled: false,
    });
  }

  enableOnBlur() {
    this.setState({
      onBlurEnabled: true,
    });
  }

  renderAnnotationList() {

    return (
      <div className={cx(styles.annotationList, styles.toolbarList)}>
        { this.props.annotations? this.props.annotations.map((annotation) =>
          <Button
            label="Annotation"
            hideLabel={true}
            color={'default'}
            icon={annotation}
            size={'md'}
            className={cx(styles.toolbarListButton, this.state.annotationSelected == annotation ? styles.selectedListButton : '')}
            onClick={this.handleAnnotationChange.bind(null, annotation)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            key={annotation}
            role="button"
            aria-labelledby={`${annotation}Label`}
            aria-describedby={`${annotation}Descrip`}

          />
        ) : null}
      </div>
    );
  }

  renderThicknessList() {

    return (
      <div className={cx(styles.thicknessList, styles.toolbarList)}>
        {this.props.thicknessRadiuses ? this.props.thicknessRadiuses.map((radius) =>
          <Button
            label="Radius"
            hideLabel={true}
            color={'default'}
            size={'md'}
            className={cx(styles.toolbarListButton, this.state.thicknessSelected == radius ? styles.selectedListButton : '')}
            onClick={this.handleThicknessChange.bind(null, radius)}
            onMouseEnter={this.disableOnBlur}
            onMouseLeave={this.enableOnBlur}
            customSvgIcon={
              <svg className={styles.customSvgIcon}>
                <circle cx="50%" cy="50%" r={radius} fill="#F3F6F9"/>
              </svg>
            }
            key={radius}
            role="button"
            aria-labelledby={`${radius}Label`}
            aria-describedby={`${radius}Descrip`}
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
            customSvgIcon={
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
              icon={this.state.annotationSelected}
              size={'md'}
              onClick={this.displaySubMenu.bind(null, "annotationList")}
              onBlur={this.closeSubMenu}
              className={styles.toolbarButton}
            />
            {this.state.currentSubmenuOpen == "annotationList" ?
              this.renderAnnotationList()
            : null }
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              label="Thickness List"
              hideLabel={true}
              role="button"
              color={'default'}
              size={'md'}
              onClick={this.displaySubMenu.bind(null, "thicknessList")}
              onBlur={this.closeSubMenu}
              className={styles.toolbarButton}
              customSvgIcon={
                <svg className={styles.customSvgIcon} shapeRendering="geometricPrecision">
                  <circle shapeRendering="geometricPrecision" cx="50%" cy="50%" r={this.state.thicknessSelected} fill={this.state.colorSelected} stroke="black" stroke-width="1"/>
                </svg>
              }
            />
            {this.state.currentSubmenuOpen == "thicknessList" ?
              this.renderThicknessList()
            : null }
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              label="Color List"
              hideLabel={true}
              role="button"
              color={'default'}
              size={'md'}
              onClick={this.displaySubMenu.bind(null, "colorList")}
              onBlur={this.closeSubMenu}
              className={styles.toolbarButton}
              customSvgIcon={
              <svg className={styles.customSvgIcon}>
                <rect x="25%" y="25%" width="50%" height="50%" fill={this.state.colorSelected} stroke="black" stroke-width="1"/>
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
              onClick={this.handleRemoveAll}
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
  thicknessRadiuses: [14, 12, 10, 8, 6, 4, 2],
  annotations: ['text_tool', 'linte_tool', 'circle_tool', 'triangle_tool', 'rectangle_tool', 'pen_tool', 'hand'],
};

WhiteboardToolbar.defaultProps = defaultProps;
