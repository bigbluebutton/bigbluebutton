# Acceptance Testing in HTML Client. Getting Started

The test suite for HTML5 client is currently under active development. The following instructions will help you install all the necessary tools and libraries to run the exiting specs and start writing your own tests.

## Run Selenium Server

Assuming that you have the BigBlueButton repository in `/home/firstuser/dev`, navigate to the directory containing acceptance tests:
```sh
$ cd /home/firstuser/dev/bigbluebutton/bigbluebutton-html5/tests/webdriverio
```

Create `tools` folder to store various third-party binaries:
```sh
$ mkdir tools
$ cd tools
```

Download Selenium jar file:
```sh
$ curl -O http://selenium-release.storage.googleapis.com/3.4/selenium-server-standalone-3.4.0.jar
```

and browser-specific WebDriver server.

Firefox WebDriver (GeckoDriver):
```sh
$ curl -L https://github.com/mozilla/geckodriver/releases/download/v0.16.1/geckodriver-v0.16.1-linux64.tar.gz | tar xz
```

Chrome WebDriver (ChromeDriver):
```sh
$ wget https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip
$ unzip chromedriver_linux64.zip
```

Along with the WebDriver, you need to install the browser itself.

How to install Chrome:
```sh
$ wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
$ sudo sh -C 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
$ sudo apt-get update
$ sudo apt-get install google-chrome-stable
```

How to install Firefox:
```sh
$ wget sourceforge.net/projects/ubuntuzilla/files/mozilla/apt/pool/main/f/firefox-mozilla-build/firefox-mozilla-build_52.0-0ubuntu1_amd64.deb
$ sudo dpkg -i firefox-mozilla-build_52.0-0ubuntu1_amd64.deb
```

In order to run headless browser, we will use Xvfb display server:
```sh
$ sudo apt-get install xvfb
```

At this point, you can run the Selenium server (replace `./geckodriver` with `./chromedriver` if you use Chrome):
```sh
$ xvfb-run java -jar selenium-server-standalone-3.4.0.jar
```

If you get an error `Xvfb failed to start`, run it with an `-a` option (Xvfb will use another display if the current one is already in use):
```sh
$ xvfb-run -a java -jar selenium-server-standalone-3.4.0.jar
```

Congratulations! You have Selenium server up and running. It is ready to handle your test cases. Now, keep the `xvfb-run` process running and continue in a new terminal session.

## Run the test specs

We use WebdriverIO interface to write the acceptance test cases. In order to execute the existing tests, you need to use `wdio` test runner. By default, it will look into any `*.spec.js` file inside the `/home/firstuser/dev/bigbluebutton/bigbluebutton-html5/tests/webdriverio/specs` directory. You can change the location of the test specs by modifying the `wdio` config file: `wdio.conf.js` (inside the `webdriverio` directory).

Before proceeding any further, make sure HTML5 client is up and running.
Node.js installation is also required:

```sh
$ sudo apt-get install nodejs-legacy
```

You can run all of the existing test specs with a single npm command:

```sh
$ cd /home/firstuser/dev/bigbluebutton/bigbluebutton-html5
$ npm run test
```

### Test suites

To make it easier to run a single specific set of tests, we group the specs into test suits. All the suits are defined in `wdio.conf.js`.

To run a single test suite, you need to pass its name to the npm script:
```sh
$ npm run test -- --suite login
```

