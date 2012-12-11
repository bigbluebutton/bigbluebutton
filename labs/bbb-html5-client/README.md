BBB-HTML5-Client
================

## 1. Install [Node.js](http://www.nodejs.org)

## 2. Clone this repo
```
git clone https://github.com/ryanseys/bbb-html5-client.git
```
## 3. Install node dependencies
```
cd bbb-html5-client
npm install
```

## 4. Clean Redis database
```
redis-cli
> flushdb
```

## 5. Do a clean restart of BigBlueButton
```
bbb-conf --clean
```

## 6. Run the BBB server
```
cd bbb-html5-client
node app.js
```
