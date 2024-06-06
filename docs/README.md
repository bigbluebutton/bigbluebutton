# BigBlueButton Docs

These docs are automatically built using [Docusaurus 2](https://docusaurus.io/)
and GitHub Actions (see [deploy-docs.yml](../.github/workflows/deploy-docs.yml)).

## Local Development

To test build the docs locally use:

```bash
$ npm ci  # install docusaurus and dependencies (based on the package-lock.json file)
$ npx docusaurus start  # start local dev server
```

By default `docusaurus.config.js` contains instructions for the building of a few extra branches. However, on in a development environment you may run into the following error from docusaurus:




![Development setup for docusaurus possible error](/docusaurus_start_error_001.png)

`Error: The docs folder does not exist for version "2.6". A docs folder is expected to be found at versioned_docs/version-2.6.`

In this case you may want to drop all but the current branch. For example:

```
diff --git a/docs/docusaurus.config.js b/docs/docusaurus.config.js
index 50b72b12ec..04f360a955 100644
--- a/docs/docusaurus.config.js
+++ b/docs/docusaurus.config.js
@@ -38,12 +38,6 @@ const config = {
                     lastVersion: '2.7',
                     includeCurrentVersion: false,
                     versions: {
-                        '2.5-legacy': {
-                            banner: 'none'
-                        },
-                        '2.6': {
-                            banner: 'none'
-                        },
                         '2.7': {
                             banner: 'none'
                         },

```

The last command starts a local development server and opens up a browser window.
Most changes are reflected live without having to restart the server.

There is also a  script `build.sh` that goes through all branches of the repository
and adds all release branches that have a `docusaurus.config.js`-file as versions
to the docs.
Note that you can not have uncommitted local changes before you run `/build.sh`,
otherwise git will refuse to change branches.
This step is optional and if you don't run it, docusaurus will only build the
currently checkout out version which is recommended for local development
(building all the versions locally can lead to problems with the live
updates when using `npx docusaurus start`).

### Build

If you only want to build the docs you can run:

```
$ npx docusaurus clear # ensure cached content is not interfering with your changes
$ npx docusaurus build
$ npm run serve
```

This command generates static content into the `build` directory
and can be served using any static contents hosting service.

### Troubleshooting

Sometimes cached content can interfere with your changes during live updates
in development or when building the docs.
To avoid this you can run:

```
$ npx docusaurus clear  # ensure cached content is not interfering with your changes
$ rm -r versioned_docs versioned_sidebars versions.json  # if you build multiple versions
```

## Cutting a new release

The docs for all versions are build and deployed from the `develop`-branch,
but the actual documentation per version lives in each version-branch (e.g. `v2.6.x-release`).
When cutting a new BigBlueButton release at least these two files need to be adjusted on `develop`:

- `build.sh`: the variable `BRANCHES` is a list of all branches for which documentation will be included
- `docusaurus.config.js`: adjust metadata and versions in `config.presets.docs.versions`
