# Virtual Backgrounds for BBB

> Inspired from https://ai.googleblog.com/2020/10/background-features-in-google-meet.html, https://github.com/Volcomix/virtual-background.git and https://github.com/jitsi/jitsi-meet/tree/master/react/features/stream-effects/virtual-background/vendor

## iOS and macOS

The feature works on macOS, however Safari is not supported. Due to limitations on iOS, it is currently not possible to enable virtual backgrounds feature on iPhones and iPads. The reason behind is documented on [Apple Developer Documentation website](https://developer.apple.com/documentation/webkitjs/canvasrenderingcontext2d/1630282-drawimage).

> The image object can be an img element, a canvas element, or a video element. **Use of the video element is not supported in Safari on iOS, however.**

## Settings

Virtual backgrounds feature for BBB is turned on by default as long as the version you have comes with the feature included. In case your `settings.yml` doesn't include the virtual background settings, it will fall back to the default settings, which are identical to having the following parameters in your `settings.yml` file.


    virtualBackgrounds:
     enabled: true
     storedOnBBB: true
     showThumbnails: true
     imagesPath: /resources/images/virtual-backgrounds/
     thumbnailsPath: /resources/images/virtual-backgrounds/thumbnails/
     fileNames:
      - home.jpg
      - coffeeshop.jpg
      - board.jpg

In case you don't have the virtual background settings in your `settings.yml`, add the above lines under `public.app` namespace, so it looks like the following.

    public:
     app:
      ...
      ...
      virtualBackgrounds:
       (your settings here)

### Explanation of settings

| Setting | Description | Type |
| --- | --- | --- |
| `enabled` | Enables or disables virtual background feature | `boolean` |
| `storedOnBBB` | Determines where the images and thumbnails are stored. If set to true, virtual backgrounds and thumbnails will be fetched from `/resources/images/virtual-backgrounds/`.  | `boolean` |
| `showThumbnails`| Determines whether to show or hide thumbnails. If set to `false`, a dropdown of `fileNames` will be shown. | `boolean` |
| `imagesPath` | Location of virtual background images. If `storedOnBBB` is set to false, it is possible to give an external location. **IMPORTANT: File names must be given explicitly under `fileNames` if using non-default images.** | `string` |
| `thumbnailsPath` | Location of virtual background image thumbnails. If `storedOnBBB` is set to false, it is possible to give an external location. **IMPORTANT: Thumbnail file names and extensions must match their corresponding virtual background images. If `showThumbnails` is set to false, this can be ignored.** | `string` |
| `fileNames` | List of file names that will be used as virtual backgrounds. File extensions must also be given. The same values are used for images and thumbnails. | `array` |



## Canvas 2D + CPU

This rendering pipeline is pretty much the same as for BodyPix. It relies on Canvas compositing properties to blend rendering layers according to the segmentation mask.

Interactions with TFLite inference tool are executed on CPU to convert from UInt8 to Float32 for the model input and to apply softmax on the model output.

The framerate is higher and the quality looks better than BodyPix

## SIMD and non-SIMD

How to test on SIMD:
1. Go to chrome://flags/
2. Search for SIMD flag
3. Enable WebAssembly SIMD support(Enables support for the WebAssembly SIMD proposal).
4. Reopen Google Chrome

More details:
- [WebAssembly](https://webassembly.org/)
- [WebAssembly SIMD](https://github.com/WebAssembly/simd)
- [TFLite](https://blog.tensorflow.org/2020/07/accelerating-tensorflow-lite-xnnpack-integration.html)

## LICENSE

The models vendored here were downloaded early January (they were available as early as the 4th), before Google switched the license away from Apache 2. Thus we understand they are not covered by the new license which according to the [model card](https://github.com/tensorflow/tfjs/files/6466044/Model.Card-Meet.Segmentation.pdf) dates from the 21st of January.

We are not lawyers so do get legal advise if in doubt.

References:

- Model license discussion: https://github.com/tensorflow/tfjs/issues/4177
- Current vendored model is discovered: https://github.com/tensorflow/tfjs/issues/4177#issuecomment-753934631
- License change is noticed: https://github.com/tensorflow/tfjs/issues/4177#issuecomment-771536641
