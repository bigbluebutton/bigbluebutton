const { PropTypes } = React;

Tooltip = React.createClass({
  propTypes: {
    componentClass: CustomPropTypes.elementType,
    title: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      placement: 'bottom'
    };
  },

  render() {
    let Component = this.props.componentClass || 'span';

    return (
      <Component
        {...this.props}

        rel="tooltip"
        role="tooltip"
        data-placement={this.props.placement}
        title={this.props.title}>
        {this.props.children}
      </Component>
    );
  }
});
