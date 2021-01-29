'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ExportMap = require('../ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _arrayIncludes = require('array-includes');

var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Notes on Typescript namespaces aka TSModuleDeclaration:

There are two forms:
- active namespaces: namespace Foo {} / module Foo {}
- ambient modules; declare module "eslint-plugin-import" {}

active namespaces:
- cannot contain a default export
- cannot contain an export all
- cannot contain a multi name export (export { a, b })
- can have active namespaces nested within them

ambient namespaces:
- can only be defined in .d.ts files
- cannot be nested within active namespaces
- have no other restrictions
*/

const rootProgram = 'root';
const tsTypePrefix = 'type:';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2.default)('export')
    }
  },

  create: function (context) {
    const namespace = new Map([[rootProgram, new Map()]]);

    function addNamed(name, node, parent, isType) {
      if (!namespace.has(parent)) {
        namespace.set(parent, new Map());
      }
      const named = namespace.get(parent);

      const key = isType ? `${tsTypePrefix}${name}` : name;
      let nodes = named.get(key);

      if (nodes == null) {
        nodes = new Set();
        named.set(key, nodes);
      }

      nodes.add(node);
    }

    function getParent(node) {
      if (node.parent && node.parent.type === 'TSModuleBlock') {
        return node.parent.parent;
      }

      // just in case somehow a non-ts namespace export declaration isn't directly
      // parented to the root Program node
      return rootProgram;
    }

    return {
      'ExportDefaultDeclaration': node => addNamed('default', node, getParent(node)),

      'ExportSpecifier': node => addNamed(node.exported.name, node.exported, getParent(node)),

      'ExportNamedDeclaration': function (node) {
        if (node.declaration == null) return;

        const parent = getParent(node);
        // support for old typescript versions
        const isTypeVariableDecl = node.declaration.kind === 'type';

        if (node.declaration.id != null) {
          if ((0, _arrayIncludes2.default)(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'], node.declaration.type)) {
            addNamed(node.declaration.id.name, node.declaration.id, parent, true);
          } else {
            addNamed(node.declaration.id.name, node.declaration.id, parent, isTypeVariableDecl);
          }
        }

        if (node.declaration.declarations != null) {
          for (let declaration of node.declaration.declarations) {
            (0, _ExportMap.recursivePatternCapture)(declaration.id, v => addNamed(v.name, v, parent, isTypeVariableDecl));
          }
        }
      },

      'ExportAllDeclaration': function (node) {
        if (node.source == null) return; // not sure if this is ever true

        const remoteExports = _ExportMap2.default.get(node.source.value, context);
        if (remoteExports == null) return;

        if (remoteExports.errors.length) {
          remoteExports.reportErrors(context, node);
          return;
        }

        const parent = getParent(node);

        let any = false;
        remoteExports.forEach((v, name) => name !== 'default' && (any = true) && // poor man's filter
        addNamed(name, node, parent));

        if (!any) {
          context.report(node.source, `No named exports found in module '${node.source.value}'.`);
        }
      },

      'Program:exit': function () {
        for (let _ref of namespace) {
          var _ref2 = _slicedToArray(_ref, 2);

          let named = _ref2[1];

          for (let _ref3 of named) {
            var _ref4 = _slicedToArray(_ref3, 2);

            let name = _ref4[0];
            let nodes = _ref4[1];

            if (nodes.size <= 1) continue;

            for (let node of nodes) {
              if (name === 'default') {
                context.report(node, 'Multiple default exports.');
              } else {
                context.report(node, `Multiple exports of name '${name.replace(tsTypePrefix, '')}'.`);
              }
            }
          }
        }
      }
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHBvcnQuanMiXSwibmFtZXMiOlsicm9vdFByb2dyYW0iLCJ0c1R5cGVQcmVmaXgiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwidXJsIiwiY3JlYXRlIiwiY29udGV4dCIsIm5hbWVzcGFjZSIsIk1hcCIsImFkZE5hbWVkIiwibmFtZSIsIm5vZGUiLCJwYXJlbnQiLCJpc1R5cGUiLCJoYXMiLCJzZXQiLCJuYW1lZCIsImdldCIsImtleSIsIm5vZGVzIiwiU2V0IiwiYWRkIiwiZ2V0UGFyZW50IiwiZXhwb3J0ZWQiLCJkZWNsYXJhdGlvbiIsImlzVHlwZVZhcmlhYmxlRGVjbCIsImtpbmQiLCJpZCIsImRlY2xhcmF0aW9ucyIsInYiLCJzb3VyY2UiLCJyZW1vdGVFeHBvcnRzIiwiRXhwb3J0TWFwIiwidmFsdWUiLCJlcnJvcnMiLCJsZW5ndGgiLCJyZXBvcnRFcnJvcnMiLCJhbnkiLCJmb3JFYWNoIiwicmVwb3J0Iiwic2l6ZSIsInJlcGxhY2UiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLE1BQU1BLGNBQWMsTUFBcEI7QUFDQSxNQUFNQyxlQUFlLE9BQXJCOztBQUVBQyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsV0FBSyx1QkFBUSxRQUFSO0FBREQ7QUFGRixHQURTOztBQVFmQyxVQUFRLFVBQVVDLE9BQVYsRUFBbUI7QUFDekIsVUFBTUMsWUFBWSxJQUFJQyxHQUFKLENBQVEsQ0FBQyxDQUFDWCxXQUFELEVBQWMsSUFBSVcsR0FBSixFQUFkLENBQUQsQ0FBUixDQUFsQjs7QUFFQSxhQUFTQyxRQUFULENBQWtCQyxJQUFsQixFQUF3QkMsSUFBeEIsRUFBOEJDLE1BQTlCLEVBQXNDQyxNQUF0QyxFQUE4QztBQUM1QyxVQUFJLENBQUNOLFVBQVVP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M0IsRUFBb0NLLElBQXBDO0FBQ0E7QUFDRDs7QUFFRCxjQUFNQyxTQUFTVSxVQUFVWCxJQUFWLENBQWY7O0FBRUEsWUFBSTBCLE1BQU0sS0FBVjtBQUNBTixzQkFBY08sT0FBZCxDQUFzQixDQUFDVCxDQUFELEVBQUluQixJQUFKLEtBQ3BCQSxTQUFTLFNBQVQsS0FDQzJCLE1BQU0sSUFEUCxLQUNnQjtBQUNoQjVCLGlCQUFTQyxJQUFULEVBQWVDLElBQWYsRUFBcUJDLE1BQXJCLENBSEY7O0FBS0EsWUFBSSxDQUFDeUIsR0FBTCxFQUFVO0FBQ1IvQixrQkFBUWlDLE1BQVIsQ0FBZTVCLEtBQUttQixNQUFwQixFQUNHLHFDQUFvQ25CLEtBQUttQixNQUFMLENBQVlHLEtBQU0sSUFEekQ7QUFFRDtBQUNGLE9BdERJOztBQXdETCxzQkFBZ0IsWUFBWTtBQUMxQix5QkFBc0IxQixTQUF0QixFQUFpQztBQUFBOztBQUFBLGNBQXJCUyxLQUFxQjs7QUFDL0IsNEJBQTBCQSxLQUExQixFQUFpQztBQUFBOztBQUFBLGdCQUF2Qk4sSUFBdUI7QUFBQSxnQkFBakJTLEtBQWlCOztBQUMvQixnQkFBSUEsTUFBTXFCLElBQU4sSUFBYyxDQUFsQixFQUFxQjs7QUFFckIsaUJBQUssSUFBSTdCLElBQVQsSUFBaUJRLEtBQWpCLEVBQXdCO0FBQ3RCLGtCQUFJVCxTQUFTLFNBQWIsRUFBd0I7QUFDdEJKLHdCQUFRaUMsTUFBUixDQUFlNUIsSUFBZixFQUFxQiwyQkFBckI7QUFDRCxlQUZELE1BRU87QUFDTEwsd0JBQVFpQyxNQUFSLENBQ0U1QixJQURGLEVBRUcsNkJBQTRCRCxLQUFLK0IsT0FBTCxDQUFhM0MsWUFBYixFQUEyQixFQUEzQixDQUErQixJQUY5RDtBQUlEO0FBQ0Y7QUFDRjtBQUNGO0FBQ0Y7QUF6RUksS0FBUDtBQTJFRDtBQWpIYyxDQUFqQiIsImZpbGUiOiJleHBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwb3J0TWFwLCB7IHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlIH0gZnJvbSAnLi4vRXhwb3J0TWFwJ1xuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcbmltcG9ydCBpbmNsdWRlcyBmcm9tICdhcnJheS1pbmNsdWRlcydcblxuLypcbk5vdGVzIG9uIFR5cGVzY3JpcHQgbmFtZXNwYWNlcyBha2EgVFNNb2R1bGVEZWNsYXJhdGlvbjpcblxuVGhlcmUgYXJlIHR3byBmb3Jtczpcbi0gYWN0aXZlIG5hbWVzcGFjZXM6IG5hbWVzcGFjZSBGb28ge30gLyBtb2R1bGUgRm9vIHt9XG4tIGFtYmllbnQgbW9kdWxlczsgZGVjbGFyZSBtb2R1bGUgXCJlc2xpbnQtcGx1Z2luLWltcG9ydFwiIHt9XG5cbmFjdGl2ZSBuYW1lc3BhY2VzOlxuLSBjYW5ub3QgY29udGFpbiBhIGRlZmF1bHQgZXhwb3J0XG4tIGNhbm5vdCBjb250YWluIGFuIGV4cG9ydCBhbGxcbi0gY2Fubm90IGNvbnRhaW4gYSBtdWx0aSBuYW1lIGV4cG9ydCAoZXhwb3J0IHsgYSwgYiB9KVxuLSBjYW4gaGF2ZSBhY3RpdmUgbmFtZXNwYWNlcyBuZXN0ZWQgd2l0aGluIHRoZW1cblxuYW1iaWVudCBuYW1lc3BhY2VzOlxuLSBjYW4gb25seSBiZSBkZWZpbmVkIGluIC5kLnRzIGZpbGVzXG4tIGNhbm5vdCBiZSBuZXN0ZWQgd2l0aGluIGFjdGl2ZSBuYW1lc3BhY2VzXG4tIGhhdmUgbm8gb3RoZXIgcmVzdHJpY3Rpb25zXG4qL1xuXG5jb25zdCByb290UHJvZ3JhbSA9ICdyb290J1xuY29uc3QgdHNUeXBlUHJlZml4ID0gJ3R5cGU6J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdwcm9ibGVtJyxcbiAgICBkb2NzOiB7XG4gICAgICB1cmw6IGRvY3NVcmwoJ2V4cG9ydCcpLFxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGNvbnN0IG5hbWVzcGFjZSA9IG5ldyBNYXAoW1tyb290UHJvZ3JhbSwgbmV3IE1hcCgpXV0pXG5cbiAgICBmdW5jdGlvbiBhZGROYW1lZChuYW1lLCBub2RlLCBwYXJlbnQsIGlzVHlwZSkge1xuICAgICAgaWYgKCFuYW1lc3BhY2UuaGFzKHBhcmVudCkpIHtcbiAgICAgICAgbmFtZXNwYWNlLnNldChwYXJlbnQsIG5ldyBNYXAoKSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5hbWVkID0gbmFtZXNwYWNlLmdldChwYXJlbnQpXG5cbiAgICAgIGNvbnN0IGtleSA9IGlzVHlwZSA/IGAke3RzVHlwZVByZWZpeH0ke25hbWV9YCA6IG5hbWVcbiAgICAgIGxldCBub2RlcyA9IG5hbWVkLmdldChrZXkpXG5cbiAgICAgIGlmIChub2RlcyA9PSBudWxsKSB7XG4gICAgICAgIG5vZGVzID0gbmV3IFNldCgpXG4gICAgICAgIG5hbWVkLnNldChrZXksIG5vZGVzKVxuICAgICAgfVxuXG4gICAgICBub2Rlcy5hZGQobm9kZSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQYXJlbnQobm9kZSkge1xuICAgICAgaWYgKG5vZGUucGFyZW50ICYmIG5vZGUucGFyZW50LnR5cGUgPT09ICdUU01vZHVsZUJsb2NrJykge1xuICAgICAgICByZXR1cm4gbm9kZS5wYXJlbnQucGFyZW50XG4gICAgICB9XG5cbiAgICAgIC8vIGp1c3QgaW4gY2FzZSBzb21laG93IGEgbm9uLXRzIG5hbWVzcGFjZSBleHBvcnQgZGVjbGFyYXRpb24gaXNuJ3QgZGlyZWN0bHlcbiAgICAgIC8vIHBhcmVudGVkIHRvIHRoZSByb290IFByb2dyYW0gbm9kZVxuICAgICAgcmV0dXJuIHJvb3RQcm9ncmFtXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiAobm9kZSkgPT4gYWRkTmFtZWQoJ2RlZmF1bHQnLCBub2RlLCBnZXRQYXJlbnQobm9kZSkpLFxuXG4gICAgICAnRXhwb3J0U3BlY2lmaWVyJzogKG5vZGUpID0+IGFkZE5hbWVkKG5vZGUuZXhwb3J0ZWQubmFtZSwgbm9kZS5leHBvcnRlZCwgZ2V0UGFyZW50KG5vZGUpKSxcblxuICAgICAgJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbiA9PSBudWxsKSByZXR1cm5cblxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSlcbiAgICAgICAgLy8gc3VwcG9ydCBmb3Igb2xkIHR5cGVzY3JpcHQgdmVyc2lvbnNcbiAgICAgICAgY29uc3QgaXNUeXBlVmFyaWFibGVEZWNsID0gbm9kZS5kZWNsYXJhdGlvbi5raW5kID09PSAndHlwZSdcblxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5pZCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGluY2x1ZGVzKFtcbiAgICAgICAgICAgICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJyxcbiAgICAgICAgICAgICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJyxcbiAgICAgICAgICBdLCBub2RlLmRlY2xhcmF0aW9uLnR5cGUpKSB7XG4gICAgICAgICAgICBhZGROYW1lZChub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUsIG5vZGUuZGVjbGFyYXRpb24uaWQsIHBhcmVudCwgdHJ1ZSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkTmFtZWQobm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lLCBub2RlLmRlY2xhcmF0aW9uLmlkLCBwYXJlbnQsIGlzVHlwZVZhcmlhYmxlRGVjbClcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAobGV0IGRlY2xhcmF0aW9uIG9mIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkZWNsYXJhdGlvbi5pZCwgdiA9PlxuICAgICAgICAgICAgICBhZGROYW1lZCh2Lm5hbWUsIHYsIHBhcmVudCwgaXNUeXBlVmFyaWFibGVEZWNsKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdFeHBvcnRBbGxEZWNsYXJhdGlvbic6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gLy8gbm90IHN1cmUgaWYgdGhpcyBpcyBldmVyIHRydWVcblxuICAgICAgICBjb25zdCByZW1vdGVFeHBvcnRzID0gRXhwb3J0TWFwLmdldChub2RlLnNvdXJjZS52YWx1ZSwgY29udGV4dClcbiAgICAgICAgaWYgKHJlbW90ZUV4cG9ydHMgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgICAgaWYgKHJlbW90ZUV4cG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgIHJlbW90ZUV4cG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSlcblxuICAgICAgICBsZXQgYW55ID0gZmFsc2VcbiAgICAgICAgcmVtb3RlRXhwb3J0cy5mb3JFYWNoKCh2LCBuYW1lKSA9PlxuICAgICAgICAgIG5hbWUgIT09ICdkZWZhdWx0JyAmJlxuICAgICAgICAgIChhbnkgPSB0cnVlKSAmJiAvLyBwb29yIG1hbidzIGZpbHRlclxuICAgICAgICAgIGFkZE5hbWVkKG5hbWUsIG5vZGUsIHBhcmVudCkpXG5cbiAgICAgICAgaWYgKCFhbnkpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLnNvdXJjZSxcbiAgICAgICAgICAgIGBObyBuYW1lZCBleHBvcnRzIGZvdW5kIGluIG1vZHVsZSAnJHtub2RlLnNvdXJjZS52YWx1ZX0nLmApXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAobGV0IFssIG5hbWVkXSBvZiBuYW1lc3BhY2UpIHtcbiAgICAgICAgICBmb3IgKGxldCBbbmFtZSwgbm9kZXNdIG9mIG5hbWVkKSB7XG4gICAgICAgICAgICBpZiAobm9kZXMuc2l6ZSA8PSAxKSBjb250aW51ZVxuXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCAnTXVsdGlwbGUgZGVmYXVsdCBleHBvcnRzLicpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoXG4gICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgYE11bHRpcGxlIGV4cG9ydHMgb2YgbmFtZSAnJHtuYW1lLnJlcGxhY2UodHNUeXBlUHJlZml4LCAnJyl9Jy5gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH1cbiAgfSxcbn1cbiJdfQ==