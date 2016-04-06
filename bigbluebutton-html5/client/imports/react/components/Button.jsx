import CustomPropTypes from '../utils/propTypes.js';

const { PropTypes } = React;
const TYPES = [
  'button', 'reset', 'submit',
];

export let Button = React.createClass({
  propTypes: {
    disabled: PropTypes.bool,

    /**
     * You can use a custom element for this component
     */
    componentClass: CustomPropTypes.elementType,

    /**
     * Defines HTML button type Attribute
     * @type {("button"|"reset"|"submit")}
     * @defaultValue 'button'
     */
    type: PropTypes.oneOf(TYPES),
  },

  getDefaultProps() {
    return {
      disabled: false,
      type: 'button',
    };
  },

  render() {
    let renderFuncName = this.props.href || this.props.target ?
      'renderAnchor' : 'renderButton';

    return this[renderFuncName]();
  },

  renderAnchor() {
    let Component = this.props.componentClass || 'a';
    let href = this.props.href || '#';

    return (
      <Component
        {...this.props}
        href={href}
        role="button">
        {this.props.children}
      </Component>
    );
  },

  renderButton() {
    let Component = this.props.componentClass || 'button';

    return (
      <Component
        {...this.props}
        type={this.props.type || 'button'}
        role="button">
        {this.props.children}
      </Component>
    );
  },
});
