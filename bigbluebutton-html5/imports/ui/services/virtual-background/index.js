/* NOTICE: This file is a Derivative Work of the original component in Jitsi Meet
 * See https://github.com/jitsi/jitsi-meet/tree/master/react/features/stream-effects/virtual-background/vendor.
 * It is partially copied under the Apache Public License 2.0 (see https://www.apache.org/licenses/LICENSE-2.0).
 */

import * as wasmcheck from 'wasm-check';
import {
    CLEAR_TIMEOUT,
    TIMEOUT_TICK,
    SET_TIMEOUT,
    timerWorkerScript
} from './TimeWorker';
import {
  BASE_PATH,
  MODELS,
  getVirtualBgImagePath,
} from '/imports/ui/services/virtual-background/service'

const blurValue = '25px';

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // Default offset is center
    offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
    offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

    // Keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    const iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih);

    let nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

    // Decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    // Calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);
    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // Make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

class VirtualBackgroundService {

    _model;
    _options;
    _segmentationMask;
    _inputVideoElement;
    _outputCanvasElement;
    _segmentationMask;
    _segmentationPixelCount;
    _segmentationMaskCanvas;
    _segmentationMaskCtx;
    _virtualImage;
    _maskFrameTimerWorker;

    constructor(model, options) {
        this._model = model;
        this._options = options;
        if (this._options.virtualBackground.backgroundType === 'image') {
            this._virtualImage = document.createElement('img');
            this._virtualImage.crossOrigin = 'anonymous';
            this._virtualImage.src = this._options.virtualBackground.virtualSource;
        }

        this._segmentationPixelCount = this._options.width * this._options.height;

        // Bind event handler so it is only bound once for every instance.
        this._onMaskFrameTimer = this._onMaskFrameTimer.bind(this);

        this._outputCanvasElement = document.createElement('canvas');
        this._outputCanvasElement.getContext('2d');
        this._inputVideoElement = document.createElement('video');
    }

    /**
     * EventHandler onmessage for the maskFrameTimerWorker WebWorker.
     * @param {EventHandler} response - The onmessage EventHandler parameter.
     * @returns {void}
     */
    _onMaskFrameTimer(response) {
        if (response.data.id === TIMEOUT_TICK) {
            this._renderMask();
        }
    }

    /**
     * Represents the run post processing.
     *
     * @returns {void}
     */
     runPostProcessing() {
        this._outputCanvasCtx.globalCompositeOperation = 'copy';

        // Draw segmentation mask.
        //

        // Smooth out the edges.
        if (this._options.virtualBackground.isVirtualBackground) {
            this._outputCanvasCtx.filter = 'blur(4px)';
        } else {
            this._outputCanvasCtx.filter = 'blur(8px)';
        }

        this._outputCanvasCtx.drawImage(
            this._segmentationMaskCanvas,
            0,
            0,
            this._options.width,
            this._options.height,
            0,
            0,
            this._inputVideoElement.width,
            this._inputVideoElement.height
        );
        this._outputCanvasCtx.globalCompositeOperation = 'source-in';
        this._outputCanvasCtx.filter = 'none';

        // Draw the foreground video.
        //

        this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

        // Draw the background.
        //

        this._outputCanvasCtx.globalCompositeOperation = 'destination-over';
        if (this._options.virtualBackground.isVirtualBackground) {
            drawImageProp(
                this._outputCanvasCtx,
                this._virtualImage,
                0,
                0,
                this._inputVideoElement.width,
                this._inputVideoElement.height,
                0.5,
                0.5,
            );
        } else {
            this._outputCanvasCtx.filter = `blur(${blurValue})`;
            this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);
        }
    }

    /**
     * Represents the run Tensorflow Interference.
     *
     * @returns {void}
     */
    runInference() {
        this._model._runInference();
        const outputMemoryOffset = this._model._getOutputMemoryOffset() / 4;

        for (let i = 0; i < this._segmentationPixelCount; i++) {
            const background = this._model.HEAPF32[outputMemoryOffset + (i * 2)];
            const person = this._model.HEAPF32[outputMemoryOffset + (i * 2) + 1];
            const shift = Math.max(background, person);
            const backgroundExp = Math.exp(background - shift);
            const personExp = Math.exp(person - shift);

            // Sets only the alpha component of each pixel.
            this._segmentationMask.data[(i * 4) + 3] = (255 * personExp) / (backgroundExp + personExp);
        }
        this._segmentationMaskCtx.putImageData(this._segmentationMask, 0, 0);
    }

    /**
     * Loop function to render the background mask.
     *
     * @private
     * @returns {void}
     */
    _renderMask() {
        this.resizeSource();
        this.runInference();
        this.runPostProcessing();

        this._maskFrameTimerWorker.postMessage({
            id: SET_TIMEOUT,
            timeMs: 1000 / 30
        });
    }

    /**
     * Represents the resize source process.
     *
     * @returns {void}
     */
    resizeSource() {
        this._segmentationMaskCtx.drawImage(
            this._inputVideoElement,
            0,
            0,
            this._inputVideoElement.width,
            this._inputVideoElement.height,
            0,
            0,
            this._options.width,
            this._options.height
        );

        const imageData = this._segmentationMaskCtx.getImageData(
            0,
            0,
            this._options.width,
            this._options.height
        );
        const inputMemoryOffset = this._model._getInputMemoryOffset() / 4;

        for (let i = 0; i < this._segmentationPixelCount; i++) {
            this._model.HEAPF32[inputMemoryOffset + (i * 3)] = imageData.data[i * 4] / 255;
            this._model.HEAPF32[inputMemoryOffset + (i * 3) + 1] = imageData.data[(i * 4) + 1] / 255;
            this._model.HEAPF32[inputMemoryOffset + (i * 3) + 2] = imageData.data[(i * 4) + 2] / 255;
        }
    }

    changeBackgroundImage(parameters = null) {
        const virtualBackgroundImagePath = getVirtualBgImagePath();
        let name = '';
        let type = 'blur';
        let isVirtualBackground = false;
        if (parameters != null && Object.keys(parameters).length > 0) {
            name = parameters.name;
            type = parameters.type;
            isVirtualBackground = parameters.isVirtualBackground;
        }
        this._options.virtualBackground.virtualSource = virtualBackgroundImagePath + name;
        this._options.virtualBackground.backgroundType = type;
        this._options.virtualBackground.isVirtualBackground = isVirtualBackground;
        if (this._options.virtualBackground.backgroundType === 'image') {
            this._virtualImage = document.createElement('img');
            this._virtualImage.crossOrigin = 'anonymous';
            this._virtualImage.src = virtualBackgroundImagePath + name;
        }
    }

    /**
     * Starts loop to capture video frame and render the segmentation mask.
     *
     * @param {MediaStream} stream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(stream) {
        this._maskFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Blur effect worker' });
        this._maskFrameTimerWorker.onmessage = this._onMaskFrameTimer;

        const firstVideoTrack = stream.getVideoTracks()[0];

        const { height, frameRate, width }
            = firstVideoTrack.getSettings ? firstVideoTrack.getSettings() : firstVideoTrack.getConstraints();

        this._segmentationMask = new ImageData(this._options.width, this._options.height);
        this._segmentationMaskCanvas = document.createElement('canvas');
        this._segmentationMaskCanvas.width = this._options.width;
        this._segmentationMaskCanvas.height = this._options.height;
        this._segmentationMaskCtx = this._segmentationMaskCanvas.getContext('2d');

        this._outputCanvasElement.width = parseInt(width, 10);
        this._outputCanvasElement.height = parseInt(height, 10);
        this._outputCanvasCtx = this._outputCanvasElement.getContext('2d');
        this._inputVideoElement.width = parseInt(width, 10);
        this._inputVideoElement.height = parseInt(height, 10);
        this._inputVideoElement.autoplay = true;
        this._inputVideoElement.srcObject = stream;
        this._inputVideoElement.onloadeddata = () => {
            this._maskFrameTimerWorker.postMessage({
                id: SET_TIMEOUT,
                timeMs: 1000 / 30
            });
        };

        return this._outputCanvasElement.captureStream(parseInt(frameRate, 15));
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
         stopEffect() {
            this._maskFrameTimerWorker.postMessage({
                id: CLEAR_TIMEOUT
            });

            this._maskFrameTimerWorker.terminate();
        }

}

    /**
     * Creates VirtualBackgroundService. If parameters are empty, the default
     * effect is blur. Parameters (if given) must contain the following:
     * isVirtualBackground (boolean) - false for blur, true for image
     * backgroundType (string) - 'image' for image, anything else for blur
     * backgroundFilename (string) - File name that is stored in /public/resources/images/virtual-backgrounds/
     * @param {Object} parameters
     * @returns {VirtualBackgroundService}
     */
export async function createVirtualBackgroundService(parameters = null) {
    let tflite;
    let modelResponse;

    if (wasmcheck.feature.simd) {
        tflite = await window.createTFLiteSIMDModule();
        modelResponse = await fetch(BASE_PATH+MODELS.model144.path);
    } else {
        tflite = await window.createTFLiteModule();
        modelResponse = await fetch(BASE_PATH+MODELS.model96.path);
    }

    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    const virtualBackgroundImagePath = getVirtualBgImagePath();

    if (parameters == null) {
        parameters = {};
        parameters.virtualSource = virtualBackgroundImagePath + '';
        parameters.backgroundType = 'blur';
        parameters.isVirtualBackground = false;
    } else {
        parameters.virtualSource = virtualBackgroundImagePath + parameters.backgroundFilename;
    }

    if (!modelResponse.ok) {
        throw new Error('Failed to download tflite model!');
    }

    const model = await modelResponse.arrayBuffer();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);

    const options = {
        ...wasmcheck.feature.simd ? MODELS.model144.segmentationDimensions : MODELS.model96.segmentationDimensions,
        virtualBackground: parameters
    };

    return new VirtualBackgroundService(tflite, options);
}

export default VirtualBackgroundService;
