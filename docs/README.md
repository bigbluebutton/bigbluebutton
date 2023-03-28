# BigBlueButton Docs

These docs are automatically built using [Docusaurus 2](https://docusaurus.io/)
and GitHub Actions (see [deploy-docs.yml](../.github/workflows/deploy-docs.yml)).

## Local Development

To test build the docs locally you can either use `yarn` or `npm`.

```
$ yarn install  # install docusaurus and dependencies
$ yarn start  # start local dev server
```

The last command starts a local development server and opens up a browser window.
Most changes are reflected live without having to restart the server.

There is also a  script `build.sh` that goes through all branches of the repository
and adds all release branches that have a `docusaurus.config.js`-file as versions
to the docs.
Note that you can not have uncommited local changes before you run `/build.sh`,
otherwise git will refuse to change branches.
This step is optional and if you don't run it, docusaurus will only build the
currently checkout out version which is recommended for local development
(building all the versions locally can lead to problems with the live
updates when using `yarn start`).

### Build

If you only want to build the docs you can run:

```
$ yarn clear # ensure cached content is not interfering with your changes
$ yarn build
```

This command generates static content into the `build` directory
and can be served using any static contents hosting service.

### Troubleshooting

Sometimes cached content can interfere with your changes during live updates
in development or when building the docs.
To avoid this you can run:

```
$ yarn clear  # ensure cached content is not interfering with your changes
$ rm -r versioned_docs versioned_sidebars versions.json  # if you build multiple versions
```

## Cutting a new release

The docs for all versions are build and deployed from the `develop`-branch,
but the actual documentation per version lives in each version-branch (e.g. `v2.6.x-release`).
When cutting a new BigBlueButton release at least these two files need to be adjusted on `develop`:

- `build.sh`: the variable `BRANCHES` is a list of all branches for which documentation will be included
- `docusaurus.config.js`: adjust metadata and versions in `config.presets.docs.versions`
