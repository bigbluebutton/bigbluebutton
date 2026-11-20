/* eslint-disable no-console */
// Fails when bbb-graphql-middleware/config/client-operation-names.txt does not list exactly the
// operation names this client sends: each named operation of a static gql`` document, and, for a
// subscription, its Patched_ form too (makePatchedQuery in imports/ui/core/hooks/
// createUseSubscription.ts). The middleware labels those names by name in its metrics, outside
// the cap on distinct names; a name missing from the file is labeled under the cap, and can fall
// into (other) once the cap fills.
// Usage: node scripts/check-client-operation-names.js [--write]
// With --write, the names in the file are replaced by the client's.
const fs = require('fs');
const path = require('path');
// The parsers the client is built with, so the names are read as the client reads its documents.
// eslint-disable-next-line import/no-extraneous-dependencies
const ts = require('typescript');
const { parse } = require('graphql');

const HTML5 = path.join(__dirname, '..');
const LIST = path.join(HTML5, '..', 'bbb-graphql-middleware', 'config', 'client-operation-names.txt');
const LIST_NAME = 'bbb-graphql-middleware/config/client-operation-names.txt';

// The files that build gql`` documents at run time, which hold no name of their own: the plugins'
// documents (labeled under the cap) and the Patched_ form of a subscription (listed from the
// subscription).
const RUN_TIME_DOCUMENTS = [
  'imports/ui/components/plugins-engine/data-consumption/domain/shared/custom-query/hook-manager.tsx',
  'imports/ui/components/plugins-engine/data-consumption/domain/shared/custom-subscription/hook-manager.tsx',
  'imports/ui/components/plugins-engine/data-creation/mutation-trigger-handler/handler.tsx',
  'imports/ui/core/hooks/createUseSubscription.ts',
];

const sourceFiles = (dir, files = []) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) return;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(file, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(file);
  });
  return files;
};

const SCRIPT_KINDS = {
  '.ts': ts.ScriptKind.TS, '.tsx': ts.ScriptKind.TSX, '.js': ts.ScriptKind.JS, '.jsx': ts.ScriptKind.JSX,
};
// The text of a GraphQL operation, to find one written other than as a gql`` document.
const OPERATION_TEXT = /^\s*(query|mutation|subscription)\s+[_A-Za-z]/;

// The names gql is imported under in a file, from the packages that export it.
const gqlNames = (source) => {
  const names = new Set(['gql']);
  source.statements.forEach((statement) => {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) return;
    const bindings = statement.importClause.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) return;
    bindings.elements.forEach((element) => {
      if ((element.propertyName || element.name).text === 'gql') names.add(element.name.text);
    });
  });
  return names;
};

const clientOperationNames = () => {
  const names = new Map(); // name -> where it is defined
  const problems = [];
  sourceFiles(path.join(HTML5, 'imports')).sort().forEach((file) => {
    const relative = path.relative(HTML5, file);
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
      SCRIPT_KINDS[path.extname(file)]);
    const where = (node) => `${relative}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
    const gql = gqlNames(source);
    const isGql = (expression) => gql.has(expression.getText(source))
      || (ts.isPropertyAccessExpression(expression) && expression.name.text === 'gql');
    const visit = (node) => {
      const isGqlTag = ts.isTaggedTemplateExpression(node) && isGql(node.tag);
      const isGqlCall = ts.isCallExpression(node) && isGql(node.expression);
      if (isGqlTag && ts.isNoSubstitutionTemplateLiteral(node.template)) {
        try {
          parse(node.template.text).definitions.forEach((definition) => {
            if (definition.kind !== 'OperationDefinition' || !definition.name) return;
            const name = definition.name.value;
            if (!names.has(name)) names.set(name, where(node));
            if (definition.operation === 'subscription' && !names.has(`Patched_${name}`)) names.set(`Patched_${name}`, where(node));
          });
        } catch (error) {
          problems.push(`${where(node)}: the document does not parse: ${error.message}`);
        }
        return;
      }
      if (isGqlTag || isGqlCall) {
        if (!RUN_TIME_DOCUMENTS.includes(relative)) {
          problems.push(`${where(node)}: a document built at run time, whose operation name cannot be read here; `
            + 'write it as a static gql`` document');
        }
        return;
      }
      if (!RUN_TIME_DOCUMENTS.includes(relative)
        && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node))
        && OPERATION_TEXT.test(ts.isTemplateExpression(node) ? node.head.text : node.text)) {
        problems.push(`${where(node)}: a GraphQL operation that is not a gql\`\` document, whose name is not read here; `
          + 'write it as a static gql`` document');
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  });
  return { names, problems };
};

const readList = () => fs.readFileSync(LIST, 'utf8').split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));

const { names, problems } = clientOperationNames();
if (problems.length > 0) {
  problems.forEach((problem) => console.error(problem));
  process.exit(1);
}

if (process.argv.includes('--write')) {
  const header = fs.readFileSync(LIST, 'utf8').split('\n').filter((line) => line.startsWith('#'));
  fs.writeFileSync(LIST, `${[...header, ...[...names.keys()].sort()].join('\n')}\n`);
  console.log(`${LIST_NAME}: ${names.size} names written`);
  process.exit(0);
}

const listed = new Set(readList());
const missing = [...names.keys()].filter((name) => !listed.has(name)).sort()
  .map((name) => `${name}  (${names.get(name)})`);
const extra = [...listed].filter((name) => !names.has(name)).sort();
if (missing.length > 0 || extra.length > 0) {
  if (missing.length > 0) console.error(`Operation names of the client missing from ${LIST_NAME}:\n  ${missing.join('\n  ')}`);
  if (extra.length > 0) console.error(`Names in ${LIST_NAME} that the client no longer sends:\n  ${extra.join('\n  ')}`);
  console.error(`\n${LIST_NAME} lists the operation names of this client, which bbb-graphql-middleware`
    + ' labels by name in its metrics, outside the cap on distinct names. Update that file with the names'
    + ' above, or run `node scripts/check-client-operation-names.js --write` in bigbluebutton-html5.');
  process.exit(1);
}
console.log(`${LIST_NAME}: the ${names.size} operation names of the client are listed`);
