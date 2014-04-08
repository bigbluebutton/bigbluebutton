BBB-HTML5-Client
================

# Development

## Setting up the environment

### 1. Install [Node.js](http://www.nodejs.org)

Here's a quick how-to for installing it from source code (replace `X.X.X` by the required node version that you can
find on [`package.json`](https://github.com/bigbluebutton/bigbluebutton/blob/html5-bridge/labs/bbb-html5-client/package.json)):

```bash
wget http://nodejs.org/dist/vX.X.X/node-vX.X.X.tar.gz
tar -xvf node-vX.X.X.tar.gz
cd node-vX.X.X/
./configure
make
sudo make install
```

### 2. Install node dependencies

```bash
cd bbb-html5-client
npm install
```

### 3. Clean Redis database

```bash
redis-cli flushdb
```

### 4. Do a clean restart of BigBlueButton

```bash
bbb-conf --clean
```

### 5. Run the BBB server

```bash
cd bbb-html5-client
node app.js
```

## Generating the documentation

This application uses [codo](https://github.com/netzpirat/codo/) to generate HTML pages with the documentation
for the HTML5 client and server. This documentation is targeted for developers.

To generate the documentation pages, use:

```bash
cake docs
```

The files will be output to the folder `docs/`.

## Testing

Run:

```bash
cake test
```

To run tests for a single file:

```bash
cake -f test/lib/modules-test.coffee test
```

To stop immediately in case a test fails:

```bash
cake -b test
```
