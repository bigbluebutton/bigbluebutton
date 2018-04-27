import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import { styles } from '../styles';
import ToolbarSubmenuItem from '../toolbar-submenu-item/component';

const intlMessages = defineMessages({
  toolPointer: {
    id: 'app.whiteboard.toolbar.tools.pointer',
    description: 'Tool submenu pointer item',
  },
  toolPencil: {
    id: 'app.whiteboard.toolbar.tools.pencil',
    description: 'Tool submenu pencil annotation',
  },
  toolRectangle: {
    id: 'app.whiteboard.toolbar.tools.rectangle',
    description: 'Tool submenu rectangle annotation',
  },
  toolTriangle: {
    id: 'app.whiteboard.toolbar.tools.triangle',
    description: 'Tool submenu triangle annotation',
  },
  toolEllipse: {
    id: 'app.whiteboard.toolbar.tools.ellipse',
    description: 'Tool submenu ellipse annotation',
  },
  toolLine: {
    id: 'app.whiteboard.toolbar.tools.line',
    description: 'Tool submenu line annotation',
  },
  toolText: {
    id: 'app.whiteboard.toolbar.tools.text',
    description: 'Tool submenu text annotation',
  },
  colorBlack: {
    id: 'app.whiteboard.toolbar.color.black',
    description: 'Color submenu black color',
  },
  colorWhite: {
    id: 'app.whiteboard.toolbar.color.white',
    description: 'Color submenu white color',
  },
  colorRed: {
    id: 'app.whiteboard.toolbar.color.red',
    description: 'Color submenu red color',
  },
  colorOrange: {
    id: 'app.whiteboard.toolbar.color.orange',
    description: 'Color submenu orange color',
  },
  colorEletricLime: {
    id: 'app.whiteboard.toolbar.color.eletricLime',
    description: 'Color submenu eletric lime color',
  },
  colorLime: {
    id: 'app.whiteboard.toolbar.color.lime',
    description: 'Color submenu lime color',
  },
  colorCyan: {
    id: 'app.whiteboard.toolbar.color.cyan',
    description: 'Color submenu cyan color',
  },
  colorDodgerBlue: {
    id: 'app.whiteboard.toolbar.color.dodgerBlue',
    description: 'Color submenu dodger blue color',
  },
  colorBlue: {
    id: 'app.whiteboard.toolbar.color.blue',
    description: 'Color submenu blue color',
  },
  colorViolet: {
    id: 'app.whiteboard.toolbar.color.violet',
    description: 'Color submenu violet color',
  },
  colorMagenta: {
    id: 'app.whiteboard.toolbar.color.magenta',
    description: 'Color submenu magenta color',
  },
  colorSilver: {
    id: 'app.whiteboard.toolbar.color.silver',
    description: 'Color submenu silver color',
  },
});

class ToolbarSubmenu extends Component {
  static getCustomIcon(type, obj) {
    if (type === 'color') {
      return (
        <svg className={styles.customSvgIcon}>
          <rect x="20%" y="20%" width="60%" height="60%" fill={obj.value} />
        </svg>
      );
    } else if (type === 'thickness') {
      return (
        <svg className={styles.customSvgIcon}>
          <circle cx="50%" cy="50%" r={obj.value} />
        </svg>
      );
    } else if (type === 'font-size') {
      return (
        <p className={styles.textThickness} style={{ fontSize: obj.value }}>
          Aa
        </p>
      );
    }

    return null;
  }

  static getWrapperClassNames(type) {
    if (type === 'color') {
      return cx(styles.colorList, styles.toolbarList);
    } else if (type === 'thickness') {
      return cx(styles.thicknessList, styles.toolbarList);
    } else if (type === 'font-size') {
      return cx(styles.fontSizeList, styles.toolbarList);
    } else if (type === 'annotations') {
      return cx(styles.annotationList, styles.toolbarList);
    }

    return null;
  }
  constructor() {
    super();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  onItemClick(objectToReturn) {
    if (this.props.onItemClick) {
      this.props.onItemClick(objectToReturn);
    }
  }

  handleMouseEnter() {
    if (this.props.handleMouseEnter) {
      this.props.handleMouseEnter();
    }
  }

  handleMouseLeave() {
    if (this.props.handleMouseLeave) {
      this.props.handleMouseLeave();
    }
  }

  formatSubmenuLabel(type, obj) {
    const { intl } = this.props;

    if (type === 'annotations') {
      const intlLabel = `tool${_.upperFirst(obj.value)}`;
      return intl.formatMessage(intlMessages[intlLabel]);
    }

    if (type === 'color') {
      const intlLabel = `color${_.upperFirst(obj.label)}`;
      return intl.formatMessage(intlMessages[intlLabel]);
    }

    if (type === 'thickness' || type === 'font-size') {
      return obj.value.toString();
    }

    return '';
  }

  render() {
    const {
      type,
      objectsToRender,
      objectSelected,
      customIcon,
    } = this.props;

    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={ToolbarSubmenu.getWrapperClassNames(type)}
      >
        {objectsToRender ? objectsToRender.map(obj =>
          (
            <ToolbarSubmenuItem
              label={this.formatSubmenuLabel(type, obj)}
              icon={!customIcon ? obj.icon : null}
              customIcon={customIcon ? ToolbarSubmenu.getCustomIcon(type, obj) : null}
              onItemClick={this.onItemClick}
              objectToReturn={obj}
              className={cx(
                styles.toolbarListButton,
                objectSelected.value === obj.value ? styles.selectedListButton : '',
              )}
              key={obj.value}
            />
          )) : null}
      </div>
    );
  }
}

ToolbarSubmenu.propTypes = {
  onItemClick: PropTypes.func.isRequired,
  handleMouseEnter: PropTypes.func.isRequired,
  handleMouseLeave: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  objectsToRender: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ]).isRequired).isRequired,
  objectSelected: PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ]).isRequired,
  label: PropTypes.string.isRequired,
  customIcon: PropTypes.bool.isRequired,

  intl: intlShape.isRequired,

};

export default injectIntl(ToolbarSubmenu);
