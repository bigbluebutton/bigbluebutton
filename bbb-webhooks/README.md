# bbb-webhooks

This is a node.js application that listens for all events on BigBlueButton and sends POST requests with details about these events to hooks registered via an API. A hook is any external URL that can receive HTTP POST requests.

You can read the full documentation at: http://docs.bigbluebutton.org/labs/webhooks.html


## Development

With a [working development](https://docs.bigbluebutton.org/2.2/dev.html#setup-a-development-environment) environment, follow the commands below from within the `bigbluebutton/bbb-webhooks` directory.

1. Install the node dependencies:
    - `npm install`

2. Copy the configuration file:
    - `cp config/default.example.yml config/default.yml`
    - Update the `serverDomain` and `sharedSecret` values to match your BBB server configuration in the newly copied `config/default.yml`.

3. Stop the bbb-webhook service:
    - `sudo service bbb-webhooks stop`

4. Run the application:
    - `node app.js`
    - **Note:** If the `node app.js` script stops, it's likely an issue with the configuration, or the `bbb-webhooks` service may have not been terminated.


### Persistent Hooks

If you want all webhooks from a BBB server to post to your 3rd party application/s, you can modify the configuration file to include `permanentURLs` and define one or more server urls which you would like the webhooks to post back to.

To add these permanent urls, do the follow:
 - `sudo nano config/default.yml`
 - Add the configuration similar to this example:
    - ```
        permanentURLs: [
            {
                url: 'https://staging.example.com/webhook-post-route',
                getRaw: false
            },
            {
                url: 'https://app.example.com/webhook-post-route',
                getRaw: false
            }
        ]
      ```

Once you have adjusted your configuration file, you will need to restart your development/app server to adapt to the new configuration.

If you are editing these permanent urls after they have already been committed to the application once, you may need to flush the redis database in order for adjustments to these permanent hooks to get picked up by your application. Use the following command to do so:
 - `redis-cli flushall`


## Production

Follow the commands below starting within the `bigbluebutton/bbb-webhooks` directory.

1. Copy the entire webhooks directory: 
    - `sudo cp -r . /usr/local/bigbluebutton/bbb-webhooks`
 
2. Move into the directory we just copied the files to: 
    - `cd /usr/local/bigbluebutton/bbb-webhooks`

3. Install the dependencies:
    - `npm install`

4. Copy the configuration file:
    - `sudo cp config/default.example.yml config/default.yml`
    - Update the `serverDomain` and `sharedSecret` values to match your BBB server configuration:
        - `sudo nano config/default.yml`

9. Start the bbb-webhooks service:
    - `sudo service bbb-webhooks restart`