BBB-HTML5-Client
================

## 1. Install [Node.js](http://www.nodejs.org)

## 2. Install node dependencies
```
cd bbb-html5-client
npm install
```

## 3. Clean Redis database
```
redis-cli
> flushdb
```

## 4. Do a clean restart of BigBlueButton
```
bbb-conf --clean
```

## 5. Run the BBB server
```
cd bbb-html5-client
node app.js
```
