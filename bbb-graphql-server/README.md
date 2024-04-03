# Install



Run the script to install all dependencies:
```
cd ~/src/bbb-graphql-server
sudo ./install-hasura.sh
```

#### Update libs
```
cd ~/src/bbb-common-message; 
./deploy.sh; 
cd ~/src/akka-bbb-apps; 
sbt update; 
cd ~/src/bbb-common-web; 
./deploy.sh; 
cd ~/src/bigbluebutton-web/; 
./build.sh; 
```


#### Run Akka from source
```
cd ~/src/akka-bbb-apps/; 
./run-dev.sh
```

#### Run BBB-web from source
```
cd ~/src/bigbluebutton-web/; 
./run-dev.sh;
```

#### Run Html5 from source
```
cd ~/src/bigbluebutton-html5/;
./run-dev.sh;
```



### Hasura Console
http://bbb27.bbbvm.imdt.com.br:8080/console

password: bigbluebutton

### Client for tests:
```
cd  ~/src/bbb-graphql-client-test
npm install
npm start
```

https://bbb27.bbbvm.imdt.com.br/graphql-test

- Join in a meeting, copy the param `?sessionToken=xxx` and append it to the URL above