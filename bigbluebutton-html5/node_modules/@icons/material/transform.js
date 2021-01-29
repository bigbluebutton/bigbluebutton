const fs = require('fs-extra')
const process = require('process')
const changeCase = require('change-case')

const EXIT = 1
const README = './README.md'
const README_HEADER = '# Material Icons\n\n> materialdesignicons.com\n\n|   | Name\n:-: | :----------:\n'
const iconsFrom = './svg'
const iconsTo = './icons'

const createFileString = (name, paths) =>
  `import React from 'react'

const DEFAULT_SIZE = 24

export default ({
  fill = 'currentColor',
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  style = {},
  ...props
}) => (
  <svg
    viewBox={ \`0 0 \${ DEFAULT_SIZE } \${ DEFAULT_SIZE }\` }
    style={{ fill, width, height, ...style }}
    { ...props }
  >
    ${ paths }
  </svg>
)
`

const createIndexString = (file) => `export { default as ${ file.replace('.js', '') } } from './${ file }'`

const createMarkdownString = (file) => {
  const name = file.replace('.js', '')
  const oldFileName = changeCase.paramCase(name).replace('-icon', '')

  return `<img src="https://unpkg.com/@icons/material/svg/${ oldFileName }.svg" width="24" height="24"> | \`${ name }\``
}

fs.removeSync(README)
fs.writeFileSync(README, '')

fs.removeSync(iconsFrom)
fs.ensureDirSync(iconsFrom)
fs.copySync('./node_modules/mdi-svg/svg', iconsFrom)

fs.removeSync(iconsTo)
fs.ensureDirSync(iconsTo)
fs.writeFileSync(`${ iconsTo }/index.js`, '')

fs.readdir(iconsFrom)
  .then((files) => {
    const fileContents = files.map((filename) => fs.readFile(`${ iconsFrom }/${ filename }`, 'utf-8'))
    return Promise.all(fileContents)
      .then((contents) => ({
        names: files,
        contents,
      }))
  })
  .then((files) => Promise.all(
    files.names.map((filename, i) => {
      const content = files.contents[i]
      // eslint-disable-next-line no-unused-vars
      const [match, paths] = content.match(/<svg .+?>(.+?)<\/svg>/)
      const name = `${ changeCase.pascalCase(filename.replace('.svg', '')) }Icon`

      return fs.writeFile(`${ iconsTo }/${ name }.js`, createFileString(name, paths))
    })
  ))
  .then(() =>
    fs.readdir(iconsTo)
      .then((files) => {
        const file = files.map((fileName) => createMarkdownString(fileName))
        return fs.writeFile(README, `${ README_HEADER }${ file.join('\n') }\n`)
      })
  )
  .then(() =>
    fs.readdir(iconsTo)
      .then((files) => {
        const file = files.map((fileName) => createIndexString(fileName))
        return fs.writeFile(`${ iconsTo }/index.js`, `${ file.join('\n') }\n`)
      })
  )
  .catch((err) => {
    console.log(err)
    process.exit(EXIT)
  })
