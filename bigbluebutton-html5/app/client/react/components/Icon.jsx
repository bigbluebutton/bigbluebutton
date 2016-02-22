const { PropTypes } = React;

Icon = React.createClass({
  propTypes: {
    iconName: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      prependIconName: 'fi-',
      title: ''
    };
  },

  render() {
    let renderFuncName = this.props.title ? 'renderTooltip' : 'renderIcon';
    return this[renderFuncName]();
  },

  renderIcon() {
    return (<i className={classNames(this.props.className, this.props.prependIconName + this.props.iconName)}></i>);
  },

  renderTooltip() {
    return (
      <Tooltip title={this.props.title} placement={this.props.placement}>
        {this.renderIcon()}
      </Tooltip>
    );
  }
});
