import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClick: PropTypes.func.isRequired,
}

class ClickOutside extends PureComponent {
  constructor(props) {
    super(props);
    this.childrenRefs = React.Children.map(this.props.children, () => React.createRef());
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick);
  }

  handleClick = (e) => {
    const { onClick } = this.props;
    const isOutside = this.childrenRefs.every(ref => !ref.current.contains(e.target));
    if (isOutside) {
      onClick();
    }
  };

  render() {
    return React.Children.map(this.props.children, (element, idx) => {
      return React.cloneElement(element, { ref: this.childrenRefs[idx] });
    });
  }
}

ClickOutside.propTypes = propTypes;

export default ClickOutside;
