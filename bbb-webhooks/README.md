bbb-webhooks
============

This is a node.js application that listens for all events on BigBlueButton and sends POST requests with details about these events to hooks registered via an API. A hook is any external URL that can receive HTTP POST requests.

You can read the full documentation at: http://docs.bigbluebutton.org/labs/webhooks.html


Development
-----------

1. Install node. You can use [NVM](https://github.com/creationix/nvm) if you need multiple versions of node or install it from source. To install from source, first check the exact version you need on `package.json` and replace the all `vX.X.X` by the correct version when running the commands below.

~~~
wget http://nodejs.org/dist/vX.X.X/node-vX.X.X.tar.gz
tar -xvf node-vX.X.X.tar.gz
cd node-vX.X.X/
./configure
make
sudo make install
~~~

2. Install the dependencies: `npm install`

3. Copy and edit the configuration file: `cp config_local.coffee.example config_local.coffee`

4. Run the application with:

~~~
node app.js
~~~

5. To test it you can use the test application `post_catcher.js`. It starts a node app that
  registers a hook on the webhooks app and prints all the events it receives. Open the file
  at `extra/post_catcher.js` and edit the salt and domain/IP of your server and then run it
  with `node extra/post_catcher.js`. Create meetings and do things on your BigBlueButton server
  and the events should be shown in the post_catcher.

  Another option is to create hooks with the [API Mate](http://mconf.github.io/api-mate/) and
  catch the callbacks with [PostCatcher](http://postcatcher.in/).

Production
----------

1. Install node. First check the exact version you need on `package.json` and replace the all `vX.X.X` by the correct version in the commands below.

~~~
wget http://nodejs.org/dist/vX.X.X/node-vX.X.X.tar.gz
tar -xvf node-vX.X.X.tar.gz
cd node-vX.X.X/
./configure
make
sudo make install
~~~

2. Copy the entire webhooks directory to `/usr/local/bigbluebutton/bbb-webhooks` and cd into it.

3. Install the dependencies: `npm install`

4. Copy and edit the configuration file to adapt to your server: `cp config_local.coffee.example config_local.coffee`.

5. Drop the nginx configuration file in its place: `cp config/webhooks.nginx /etc/bigbluebutton/nginx/`.
   If you changed the port of the web server on your configuration file, you will have to edit it in `webhooks.nginx` as well.

6. Copy upstart's configuration file and make sure its permissions are ok:

~~~
sudo cp config/upstart-bbb-webhooks.conf /etc/init/bbb-webhooks.conf
sudo chown root:root /etc/init/bbb-webhooks.conf
~~~

    Open the file and edit it. You might need to change things like the user used to run the application.

7. Copy monit's configuration file and make sure its permissions are ok:

~~~
sudo cp config/monit-bbb-webhooks /etc/monit/conf.d/bbb-webhooks
sudo chown root:root /etc/monit/conf.d/bbb-webhooks
~~~

    Open the file and edit it. You might need to change things like the port used by the application.

8. Copy logrotate's configuration file and install it:

~~~
sudo cp config/bbb-webhooks.logrotate /etc/logrotate.d/bbb-webhooks
sudo chown root:root /etc/logrotate.d/bbb-webhooks
sudo chmod 644 /etc/logrotate.d/bbb-webhooks
sudo logrotate -s /var/lib/logrotate/status /etc/logrotate.d/bbb-webhooks
~~~

9. Start the application:

~~~
sudo service bbb-webhooks start
sudo service bbb-webhooks stop
~~~
