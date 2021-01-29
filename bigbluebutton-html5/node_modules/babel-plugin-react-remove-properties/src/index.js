// @flow weak

export default function() {
  return {
    visitor: {
      Program(path, state) {
        // On program start, do an explicit traversal up front for this plugin.
        const properties = state.opts.properties || [];

        if (state.opts.property) {
          /* eslint-disable no-console */
          console.warn(`
            babel-plugin-react-remove-properties:
            The property option is deprecated, instead use the properties one.
          `);
          /* eslint-enable no-console */
          properties.push(state.opts.property);
        }

        if (properties.length === 0) {
          properties.push('data-test');
        }

        path.traverse({
          JSXIdentifier(path2) {
            if (properties.indexOf(path2.node.name) > -1) {
              path2.parentPath.remove();
            }
          },
        });
      },
    },
  };
}
