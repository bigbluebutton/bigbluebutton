import CustomPropTypes from '../utils/propTypes.js';
const { PropTypes } = React;

export let Tooltip = React.createClass({
  propTypes: {
    componentClass: CustomPropTypes.elementType,
    title: PropTypes.string.isRequired,
  },

  getDefaultProps() {
    return {
      placement: 'bottom',
      componentClass: 'span',
    };
  },

  render() {
    let Component = this.props.componentClass;

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
  },
});
