const { PropTypes, Component } = React;
const types = [
  'button', 'reset', 'submit'
];

class Button extends Component {
  constructor() {
    super(...arguments);

    this.propTypes = {
      disabled: PropTypes.bool,

      /**
       * You can use a custom element for this component
       */
      componentClass: PropTypes.elementType,
      
      /**
       * Defines HTML button type Attribute
       * @type {("button"|"reset"|"submit")}
       * @defaultValue 'button'
       */
      type: PropTypes.oneOf(types),
    }
  }

  getDefaultProps() {
    return {
      disabled: false,
      role: 'button'
    };
  }

  render() {
    let renderFuncName = this.props.href || this.props.target ?
      'renderAnchor' : 'renderButton';

    return this[renderFuncName]();
  }

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
  }

  renderButton() {
    let Component = this.props.componentClass || 'button';

    return (
      <Component
        {...this.props}
        type={this.props.type || 'button'}>
        {this.props.children}
      </Component>
    );
  }
}
