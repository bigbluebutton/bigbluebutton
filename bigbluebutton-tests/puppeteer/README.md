## BigBlueButton Puppeteer Tests

Tests for BigBlueButton using Puppeteer, Chromium and Jest.

## Get BBB URL and Secret and configure .env file

To run these tests with an existing BigBlueButton server, make sure you have a server set up, and that you have the server's URL and secret. These will be the same URL and secret you would use to make API calls to the server. If you do not have these, you can find them by running `bbb-conf --secret` from the terminal in the server.

Copy the `.env-template` file to a new file, and name it `.env`. In the `.env` file, add your BigBlueButton server URL and secret, so the tests will know which server to connect to.

## Setup

To run these tests, you will need the following:
* Ubuntu 16.04 or later
* Node.js 8.11.4 or later
* Docker

These instructions assume you have the BigBlueButton repository cloned into a directory named `bigbluebutton`.

First, you need to have the dependencies installed with `meteor npm install`, from the `bigbluebutton-html5` directory. When Puppeteer installs, it will automatically install the Chromium browser in which the tests will run.

To run individual tests, you can also optionally install Jest globally with `sudo npm install jest -g`.

```bash
$ cd ../bigbluebutton-tests/puppeteer
$ npm install
```

## Running the tests with an existing BigBlueButton server (All in one)

To run all the tests at once, run `npm test`.

## Running a single test with an existing BigBlueButton server (Specific test)

To run a specific test from `bash`:

```bash
$ bash ../bigbluebutton-tests/puppeteer/run.sh -t testcase
```

Test cases list: `webcamlayout/whiteboard/webcam/virtualizedlist/user/sharednotes/screenshare/presentation/notifications/customparameters/chat/breakout/audio`.

If you have Jest installed globally, you can run individual tests with `jest TEST [TEST...]`. The tests are found in the `.test.js` files, but you may choose to omit file extensions when running the tests.

## Debugging, Recording, Metrics and Evidences

### Debugging

To debug the tests, you will need to set `DEBUG=true`; if `DEBUG` receives `true`, the logs will show in the console from which we start the tests.

Debugging output will look like below:

```
  console.log
    19-Jan-2021 13:03:30  Meeting ID:  random-6850458
```
### Recording

To record the tests, you will need to set `WITH_RECORD=true`; if `WITH_RECORD` receives `true`, all tests will be recorded to .mp4 files, to keep track on what's going on and to have a good approach to catch problems or to have a proof that there are no problems.

Recording output will be saved under `data/test-date-testName/recording`; for example: `data/test-19-01-2021-pollResultsChatMessage/recording`.

**PS:** Recordings are just for manual testing.

### Getting Metrics

To run the tests and get their metrics, you will need to set `BBB_COLLECT_METRICS=true`; if `BBB_COLLECT_METRICS` receives `true`, the metrics will be generated at the end of the test inside `/data/test-date-testName/metrics` folder; for example: 
`data/test-19-01-2021-pollResultsChatMessage/metrics`.

### Getting Evidences

Generating evidences is about to take screenshots of the client during testing. And to realize this, assigning `GENERATE_EVIDENCES` in `.env` to `true`. This will take screenshots and save them in `data/test-date-testName/screenshots`; for example: `data/test-19-01-2021-pollResultsChatMessage/screenshots`.

## Visual Regression

Our test suite includes visual regression specs that can be execute separately with `npm run test-visual-regression` (desktop only). It will take screenshots of various views and components of the client, save them inside the `tests/puppeteer/__image_snapshots__` folder and put the failed cases into `tests/puppeteer/__image_snapshots__/__diff_output__`.
