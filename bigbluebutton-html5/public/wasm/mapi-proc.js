// Copyright 2025-2026 Filipe Coelho <falktx@falktx.com>
// SPDX-License-Identifier: ISC

// service.js prepends the emscripten glue (BBBA-mapi.js) to this file when it
// adds the worklet module, so mapi_bbba is in scope here without any eval.

// known constants
const nominalBufferSize = 128;

// One wasm instance per AudioWorkletGlobalScope, which lives as long as its
// AudioContext. Each processor node creates its own plugin handle in it, so a
// stream restart does not instantiate the module and allocate its memory again.
let sharedModule = null;

// wasm is a compiled WebAssembly.Module, or the raw bytes as a fallback
const loadSharedModule = (wasm) => {
    if (sharedModule === null) {
        sharedModule = new Promise((resolve, reject) => {
            mapi_bbba({
                // the module is already fetched and compiled on the main thread,
                // as `fetch` is not allowed in worklets
                instantiateWasm: (imports, successCallback) => {
                    WebAssembly.instantiate(wasm, imports).then(result => {
                        // a Module instantiates to an Instance, bytes to a pair
                        if (result instanceof WebAssembly.Instance)
                            successCallback(result, wasm);
                        else
                            successCallback(result.instance, result.module);
                    }).catch(reject);

                    return {};
                },
                postRun: resolve,
            });
        });
        // allow a later init to try again
        sharedModule.catch(() => { sharedModule = null; });
    }
    return sharedModule;
};

// class that holds a mono audio plugin instance
// see https://github.com/DISTRHO/MAPI for the API used here
class MapiProcessorInstance {
    constructor(module) {
        this.module = module;
        this.handle = module._mapi_create(sampleRate, nominalBufferSize);
        this.enabled = true;

        this.audioData = module._malloc(module.HEAPF32.BYTES_PER_ELEMENT * nominalBufferSize);
        this.audioPtrs = module._malloc(module.HEAPU32.BYTES_PER_ELEMENT);
        module.HEAPU32[this.audioPtrs >> 2] = this.audioData;

        this.view = null;
    }

    // The audio buffer inside wasm memory. The module is built with memory
    // growth, which detaches existing views, so check before every use.
    heapView() {
        if (this.view === null || this.view.buffer !== this.module.HEAPF32.buffer)
            this.view = new Float32Array(this.module.HEAPF32.buffer, this.audioData, nominalBufferSize);
        return this.view;
    }

    // mapi_set_parameter addresses parameters by INDEX. The port message field
    // is named 'index' for that reason: it used to be called 'symbol', which
    // invited callers to pass a name and silently wrote parameter 0 instead.
    param(index, value) {
        this.module._mapi_set_parameter(this.handle, index, value);
    }

    // release the plugin instance and its heap allocations; the shared module stays
    destroy() {
        if (! this.handle)
            return;
        try {
            this.module._mapi_destroy(this.handle);
            this.module._free(this.audioData);
            this.module._free(this.audioPtrs);
        } catch (err) {
            // module may already be gone; nothing useful to do here
        }
        this.handle = 0;
    }

    // input and output have the same length; whole render quanta copy without
    // allocating, as anything allocated here is garbage on the audio thread
    process(input, output) {
        if (! this.enabled || ! this.handle) {
            output.set(input);
            return;
        }

        const view = this.heapView();
        const frames = input.length;

        for (let offset = 0; offset < frames; offset += nominalBufferSize) {
            const count = Math.min(nominalBufferSize, frames - offset);

            if (count === frames)
                view.set(input);
            else
                view.set(input.subarray(offset, offset + count));

            this.module._mapi_process(this.handle, this.audioPtrs, this.audioPtrs, count);

            if (count === nominalBufferSize)
                output.set(view, offset);
            else
                output.set(view.subarray(0, count), offset);
        }
    }
};

// worklet processor implementation
class MapiWorkletProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super(options);

        // validity checks
        if (options.numberOfInputs != options.numberOfOutputs)
            throw Error('Mis-matching IO, number of inputs must match outputs');
        if (options.numberOfInputs != 1)
            throw Error('Invalid IO, must be mono');

        // workaround for Chromium-based browsers, return true in `process` until disconnected
        this.disconnected = false;

        // MAPI processor instance
        this.bbba = null;

        // bi-directional port communication
        this.port.onmessage = event => {
            switch (event.data.type)
            {
            case 'init':
                this.init(event.data);
                break;
            case 'enable':
                this.enable(event.data);
                break;
            case 'param':
                this.param(event.data);
                break;
            case 'destroy':
                this.destroy();
                break;
            }
        };

        // A compiled WebAssembly.Module could not be received here; ask for
        // the bytes instead.
        this.port.onmessageerror = () => {
            this.port.postMessage({ type: 'need-bytes' });
        };
    }

    init(data) {
        loadSharedModule(data.wasm).then(module => {
            // destroyed while loading
            if (this.disconnected)
                return;
            this.bbba = new MapiProcessorInstance(module);
            this.port.postMessage({ type: 'loaded' });
        }).catch(error => {
            this.port.postMessage({ type: 'error', error: String(error) });
        });
    }

    enable(data) {
        if (!this.bbba) {
            console.error('BBBA wasm is not loaded yet!');
            return;
        }

        this.bbba.enabled = !!data.enable;
    }

    param(data) {
        if (!this.bbba) {
            console.error('BBBA wasm is not loaded yet!');
            return;
        }

        this.bbba.param(data.index, data.value);
    }

    destroy() {
        this.disconnected = true;
        if (this.bbba)
            this.bbba.destroy();
        this.bbba = null;
    }

    process(inputs, outputs, parameters) {
        if (this.disconnected)
            return false;
        if (!this.bbba)
            return true;

        const input = inputs[0];
        const output = outputs[0];

        // IO check, can be zero if stream is not connected yet, or if the node
        // has been taken out of the graph
        if (input.length == 0 || output.length == 0 || ! input[0] || ! output[0])
            return true;

        this.bbba.process(input[0], output[0]);

        // reuse mono buffer if stereo
        if (output.length == 2)
            output[1].set(output[0]);

        return true;
    }
};

registerProcessor("mapi-proc", MapiWorkletProcessor);
