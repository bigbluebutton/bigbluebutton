var CustomPropTypes = {};

CustomPropTypes.elementType = function (props, propName, componentName) {
  const errBeginning = `Invalid prop '${propName}' of value '${props[propName]}'` +
` supplied to '${componentName}'. Expected an Element 'type'`;

  if (typeof props[propName] !== 'function') {
    if (React.isValidElement(props[propName])) {
      return new Error(errBeginning + ', not an actual Element');
    }

    if (typeof props[propName] !== 'string') {
      return new Error(errBeginning +
        ' such as a tag name or return value of React.createClass(...)');
    }
  }
};

export default CustomPropTypes;
