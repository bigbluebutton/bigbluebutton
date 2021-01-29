import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

const DEFAULT_CLASS = 'react-tabs__tab-panel';

export default class TabPanel extends Component {
  static defaultProps = {
    className: DEFAULT_CLASS,
    forceRender: false,
    selectedClassName: `${DEFAULT_CLASS}--selected`,
  };

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
    ]),
    forceRender: PropTypes.bool,
    id: PropTypes.string, // private
    selected: PropTypes.bool, // private
    selectedClassName: PropTypes.string,
    tabId: PropTypes.string, // private
  };

  render() {
    const {
      children,
      className,
      forceRender,
      id,
      selected,
      selectedClassName,
      tabId,
      ...attributes
    } = this.props;

    return (
      <div
        {...attributes}
        className={cx(className, {
          [selectedClassName]: selected,
        })}
        role="tabpanel"
        id={id}
        aria-labelledby={tabId}
      >
        {forceRender || selected ? children : null}
      </div>
    );
  }
}

TabPanel.tabsRole = 'TabPanel';
