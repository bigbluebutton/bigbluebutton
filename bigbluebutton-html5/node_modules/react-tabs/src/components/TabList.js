import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

export default class TabList extends Component {
  static defaultProps = {
    className: 'react-tabs__tab-list',
  };

  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
    ]),
  };

  render() {
    const { children, className, ...attributes } = this.props;

    return (
      <ul {...attributes} className={cx(className)} role="tablist">
        {children}
      </ul>
    );
  }
}

TabList.tabsRole = 'TabList';
