/* eslint-disable no-console */
// Fails when a locale file is not valid JSON, or when a translation does not parse or
// uses a placeholder that its en.json string does not have: react-intl renders such a
// message raw, braces included.
// Usage: node scripts/check-locale-placeholders.js [--base <dir>] [<locales dir>]
// With --base, problems that the locale files in <dir> already have only get counted.
const fs = require('fs');
const path = require('path');
// The parser react-intl uses in the client, so both read a message the same way.
// eslint-disable-next-line import/no-extraneous-dependencies
const { parse, TYPE } = require('@formatjs/icu-messageformat-parser');

const SOURCE = 'en.json';
const TRANSIFEX = 'https://app.transifex.com/bigbluebutton/';

const collectPlaceholders = (elements, names) => {
  elements.forEach((element) => {
    if (element.type === TYPE.literal || element.type === TYPE.pound) return;
    if (element.type === TYPE.tag) {
      names.add(`<${element.value}>`);
      collectPlaceholders(element.children, names);
      return;
    }
    names.add(`{${element.value}}`);
    Object.values(element.options || {}).forEach((option) => {
      collectPlaceholders(option.value, names);
    });
  });
  return names;
};

const readLocales = (dir) => {
  const locales = Object.fromEntries(fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      try {
        return [file, { text, messages: JSON.parse(text) }];
      } catch (error) {
        return [file, { text, messages: {}, invalid: error.message }];
      }
    }));
  if (!locales[SOURCE]) throw new Error(`${dir} has no ${SOURCE}`);
  return locales;
};

const findProblems = (locales) => {
  const problems = [];
  const placeholdersOf = (file, key, message) => {
    try {
      return collectPlaceholders(parse(message), new Set());
    } catch (error) {
      problems.push({ file, key, text: `does not parse (${error.message})` });
      return null;
    }
  };
  const allowed = {};
  Object.entries(locales[SOURCE].messages).forEach(([key, message]) => {
    allowed[key] = placeholdersOf(SOURCE, key, message);
  });
  Object.entries(locales).forEach(([file, { messages, invalid }]) => {
    if (invalid) problems.push({ file, key: '', text: `is not valid JSON (${invalid})` });
    if (file === SOURCE) return;
    Object.entries(messages).forEach(([key, message]) => {
      if (!allowed[key]) return;
      const unknown = [...(placeholdersOf(file, key, message) || [])]
        .filter((name) => !allowed[key].has(name));
      if (unknown.length) {
        problems.push({
          file, key, text: `uses ${unknown.join(', ')}, which the English string does not have`,
        });
      }
    });
  });
  return problems;
};

const args = process.argv.slice(2);
const baseAt = args.indexOf('--base');
const baseDir = baseAt === -1 ? null : args.splice(baseAt, 2)[1];
const dir = args[0] || path.join(__dirname, '..', 'public', 'locales');

const locales = readLocales(dir);
const base = baseDir ? readLocales(baseDir) : null;
const idOf = ({ file, key, text }) => [file, key, text].join('\t');
const known = new Set(base ? findProblems(base).map(idOf) : []);
const problems = findProblems(locales);
const fresh = problems.filter((problem) => !known.has(idOf(problem)));

fresh.forEach(({ file, key, text }) => {
  const filePath = path.join(dir, file);
  const line = Math.max(1, locales[file].text.split('\n')
    .findIndex((content) => key && content.includes(`${JSON.stringify(key)}:`)) + 1);
  const message = [key, text].filter(Boolean).join(' ');
  if (process.env.GITHUB_ACTIONS === 'true') {
    const relative = path.relative(process.env.GITHUB_WORKSPACE, path.resolve(filePath));
    console.log(`::error file=${relative},line=${line}::${message}`);
  } else {
    console.log(`${filePath}:${line}: ${message}`);
  }
});

const older = problems.length - fresh.length;
if (older) {
  console.log(`${older} problem(s) that --base already has are not counted; `
    + 'run without --base to list them.');
}
const reworded = [...new Set(fresh.map(({ key }) => key))].filter((key) => base
  && key in base[SOURCE].messages
  && base[SOURCE].messages[key] !== locales[SOURCE].messages[key]);
if (reworded.length) {
  console.log(`en.json changes the English text of ${reworded.join(', ')}. `
    + 'When a new text drops or renames a placeholder, give it a new key: '
    + 'Transifex keeps the translations of an existing key.');
}
if (fresh.some(({ key }) => !reworded.includes(key))) {
  console.log(`Translations come from Transifex (${TRANSIFEX}): fix them there, its next sync `
    + 'overwrites these files.');
}
if (fresh.length) {
  console.log(`${fresh.length} new problem(s).`);
  process.exitCode = 1;
} else {
  console.log('No new placeholder problems.');
}
