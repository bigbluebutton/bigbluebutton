# Bigblubutton HTML5 Plugins

## Implementation

In order to test it out, it is necessary to make a bundle out of the plugin you ar trying to make, and then put it into the right place to use it. Then in the `settings.yml` file you are going to create the plugin directive as well as its properties, see example:

To bundle the sample-whiteboard-toolbar run:
```bash
cd sample-whiteboard-toolbar
npm run build-bundle
```

It will generate the `dist` folder which contains the bundled js file (in this case called `WhiteboardToolbarButton.js`, but you can change this in `webpack.config.js`)
In our case, we want to place it right into our project's server, but it is configurable. So to do that, we are going to create a directory `/var/www/bigbluebutton-default/assets/plugins` and move the the plugin there, as follows:

```bash
mkdir /var/www/bigbluebutton-default/assets/plugins
sudo cp ~/src/bigbluebutton-html5-plugins/sample-whiteboard-toolbar/dist/WhiteboardToolbarButton.js /var/www/bigbluebutton-default/assets/plugins
```

Next we will change the file `settings.yml` from bbb-html5, and insert the following lines:

```yaml
plugins:
    - name: myCustomWhiteboardToolbarButton
      url: https://<your-host>/plugins/WhiteboardToolbarButton.js
```

alongside with the app directive:

```yaml
public:
    app:
    ... // All app configs
    plugins:
        - name: myCustomWhiteboardToolbarButton
          url: https://<your-host>/plugins/WhiteboardToolbarButton.js
    ... // All other configs

```

And there you go, it is already possible to use.

To create a custom Plugin yourself, just follow the general structure of the sample-whiteboard-toolbar

Places where it accepts the plugins:
 - Whiteboard toolbar button;
