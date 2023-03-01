# BigBlueButton Docs

These docs are automatically built using [Docusaurus 2](https://docusaurus.io/)
and GitHub Actions (see [deploy-docs.yml](../.github/workflows/deploy-docs.yml)).

## Local Development

To test build the docs locally you can either use `yarn` or `npm`.

```
$ yarn install  # install docusaurus and dependencies
$ ./build.sh  # add all versions to build
$ yarn start  # start local dev server
```

The script `build.sh` goes through all branches of the repository and adds all
release branches that have a `docusaurus.config.js`-file as versions to the docs.
Note that you can not have uncommited local changes before you run `/build.sh`,
otherwise git will refuse to change branches.
This step is optional and if you don't run it docusaurus will only build the
currently checkout out version.

The last command starts a local development server and opens up a browser window.
Most changes are reflected live without having to restart the server.


### Build

If you only want to build the docs you can run:

```
$ yarn build
```

This command generates static content into the `build` directory
and can be served using any static contents hosting service.
