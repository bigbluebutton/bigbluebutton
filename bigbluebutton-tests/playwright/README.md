## BigBlueButton Playwright Tests

Tests for BigBlueButton using Playwright.

## Setup (with an existing BigBlueButton server)

You need to install the dependencies:
```bash
$ cd ../bigbluebutton-tests/playwright
$ npm install
$ npx playwright install
```
To run these tests with an existing BigBlueButton server, you need to find the server's URL and secret (can be done with `bbb-conf --secret` command). You need to put them into the `.env` file inside `bigbluebutton-tests/playwright` folder (variables `BBB_URL` and `BBB_SECRET`).

## Run tests

Tests can be executed using `npx`. You can run all tests in each of 3 supported environments (`chromium`, `firefox`, `webkit`) with the following command:
```bash
$ npx playwright test
```

You can also run a single test suite and limit the execution to only one browser:
```bash
$ npx playwright test chat --browser=firefox
```
