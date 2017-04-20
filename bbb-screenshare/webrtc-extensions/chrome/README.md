BigBlueButton Screen Sharing Extension for Chrome
===================================

## Customizing your own extension

1. Fork, clone, or download [this repository]()

2. Modify the `manifest.json` file. Add the domain of your server to     `externally_connectable.matches`. For a public/distributed deployment you may want to change the icons, `homepage_url`, `name`, and `author`. For an extension on the Google Web Store you will have to increment the `version` with each release.

For more information, see the [Chrome extension manifest documentation](https://developer.chrome.com/extensions/manifest).

You have 3 options for using the extension

* loading your extension locally
* uploading your extension to the Google Web Store
* packaging your extension locally and manually distributing

## Loading your extension locally

Open [chrome://extensions](chrome://extensions) and drag the extension's directory onto the page, or click 'Load unpacked extension...' and select the extension directory. If these options do not show up you may need to check Developer mode. For more information see [Chrome's documentation on loading unpacked
extensions](https://developer.chrome.com/extensions/getstarted#unpacked)

After loaded into Google Chrome you will see the extension's unique Hash Id which is what allows an application to communicate with the extension and check the extension's status.

## Uploading your extension to the Google Web Store

[Publishing in the Chrome Web Store](https://developer.chrome.com/webstore/publish)

## Packaging your extension locally and manually distributing

[https://developer.chrome.com/extensions/packaging](https://developer.chrome.com/extensions/packaging)

In [chrome://extensions](chrome://extensions) select "Pack extension". This will bundle your extension into a `.CRX` file. When you initially package your extension Google will give you a private key so you can retain the same hash after updates. You can then distribute your extension manually to your users. 
