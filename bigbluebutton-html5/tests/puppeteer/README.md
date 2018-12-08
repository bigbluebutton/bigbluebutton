# BigBlueButton Puppeteer Tests

Tests for BigBlueButton using Puppeteer, Chromium and Jest.

## Setup

To run these tests, you will need the following:
* Ubuntu 16.04 or later
* Node.js 8.11.4 or later
* Docker

These instructions assume you have the BigBlueButton repository cloned into a directory named `bigbluebutton`.

First, you need to have the dependencies installed with `meteor npm install`, from the `bigbluebutton-html5` directory. When Puppeteer installs, it will automatically install the Chromium browser in which the tests will run.

To run individual tests, you can also optionally install Jest globally with `sudo npm install jest -g`.

## Running the tests with an existing BigBlueButton server

To run these tests with an existing BigBlueButton server, make sure you have a server set up, and that you have the server's URL and secret. These will be the same URL and secret you would use to make API calls to the server. If you do not have these, you can find them by running `bbb-conf --secret` from the terminal in the server.

Copy the `.env-template` file to a new file, and name it `.env`. In the `.env` file, add your BigBlueButton server URL and secret, so the tests will know which server to connect to.

To run all the tests at once, run `npm test`. If you have Jest installed globally, you can run individual tests with `jest TEST [TEST...]`. The tests are found in the `.test.js` files, but you may choose to omit file extensions when running the tests.

## Running the tests in a Docker container

Using this method, you can run the tests with the latest version of the HTML5 client, which you can find in this repository. You will need Docker to run tests this way. To run the tests, just run `./test-html5.sh` from the `bigbluebutton/bigbluebutton-html5` directory. The script will start a Docker container with a BigBlueButton server and the source code for the HTML5 client, and will run the tests with this server before stopping and removing the container.

### Note

The HTML5 client takes a long time to start in the Docker container. The script will check if the HTML5 client is running before running the tests, but it will exit if it takes too many attempts. If the HTML5 client takes too long to start and the check exits without running the tests, you can experiment with the values of `maxRetries` and `retryDelay` in `html5-check.js`. Note that the value of `retryDelay` is in milliseconds.

## Known Issues

* Hotkeys do not work yet. When hotkeys are pressed, keydown and keyup events are fired, but the click events that would normally be created to press buttons do not occur.
* Some tests will sometimes fail with a timeout error. Different tests may fail every time the tests are run. This problem affects all tests, and the cause is unknown as of now.
