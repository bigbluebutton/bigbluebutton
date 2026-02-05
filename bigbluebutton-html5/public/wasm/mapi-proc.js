// Copyright 2025-2026 Filipe Coelho <falktx@falktx.com>
// SPDX-License-Identifier: ISC

// known constants
const nominalBufferSize = 128;

// function to setup wasm + emscripten module options for offline fetch
const createWasmOpts = (wasmBlob, postRunCallback, errorCallback) => {
    return {
        // override to use previously retrieved blob data, as `fetch` is not allowed in worklets
        instantiateWasm: (imports, successCallback) => {
            WebAssembly.instantiate(wasmBlob, imports).then(output => {
                successCallback(output.instance, output.module);
            }).catch(error => {
                errorCallback(error);
            });

            return {};
        },
        postRun: postRunCallback,
    };
};

// class that holds a mono audio plugin instance
// see https://github.com/DISTRHO/MAPI for the API used here
class MapiProcessorInstance {
    constructor(port, module) {
        this.port = port;
        this.module = module;
        this.handle = module._mapi_create(sampleRate);
        this.enabled = true;
        this.monitor_param = -1;
        this.monitor_value = null;

        this.audioData = module._malloc(module.HEAPF32.BYTES_PER_ELEMENT * nominalBufferSize);
        this.audioPtrs = module._malloc(module.HEAPU32.BYTES_PER_ELEMENT);
        module.HEAPU32[this.audioPtrs + (0 << 2) >> 2] = this.audioData;
    }

    param(index, value) {
        this.module._mapi_set_parameter(this.handle, index, value);
    }

    monitor(index) {
        this.monitor_param = index;
        this.monitor_value = this.module._mapi_get_parameter(this.handle, index);
    }

    process(buffer, bufferSize, bufferOffset) {
        if (! this.enabled)
            return;

        for (let i = 0; i < bufferSize; ++i)
            this.module.HEAPF32[this.audioData + (i << 2) >> 2] = buffer[bufferOffset + i];

        this.module._mapi_process(this.handle, this.audioPtrs, this.audioPtrs, bufferSize);

        for (let i = 0; i < bufferSize; ++i)
            buffer[bufferOffset + i] = this.module.HEAPF32[this.audioData + (i << 2) >> 2];

        if (this.monitor_param != -1) {
            const value = this.module._mapi_get_parameter(this.handle, this.monitor_param);
            if (this.monitor_value != value) {
                this.monitor_value = value;
                this.port.postMessage({ type: 'monitor', value: value });
            }
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
            case 'monitor':
                this.monitor(event.data);
                break;
            case 'param':
                this.param(event.data);
                break;
            case 'destroy':
                this.destroy();
                break;
            }
        };
    }

    init(data) {
        // execute JS to expose the emscripten load module function
        const jsfn_bbba = new Function(data.js + 'return mapi_bbba;');
        const create_module_bbba = jsfn_bbba.call();

        // create wasm opts for offline loading
        const opts = createWasmOpts(data.wasm,
            (module) => {
                this.bbba = new MapiProcessorInstance(this.port, module);
                this.port.postMessage({ type: 'loaded' });
            },
            (error) => {
                this.port.postMessage({ type: 'error', error: error });
            },
        );

        // create the wasm module and instance
        create_module_bbba(opts);
    }

    enable(data) {
        if (!this.bbba) {
            console.error('BBBA wasm is not loaded yet!');
            return;
        }

        this.bbba.enabled = !!data.enable;
    }

    monitor(data) {
        if (!this.bbba) {
            console.error('BBBA wasm is not loaded yet!');
            return;
        }

        this.bbba.monitor(data.index);
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
        this.bbba = null;
    }

    process(inputs, outputs, parameters) {
        if (this.disconnected)
            return false;
        if (!this.bbba)
            return true;

        const input = inputs[0];
        const output = outputs[0];

        // IO check, can be zero if stream is not connected yet
        if (input.length == 0 || output.length == 0)
            return true;

        // use in-place processing
        const buffer = output[0];
        buffer.set(input[0]);

        for (let offset = 0; offset < buffer.length; offset += nominalBufferSize)
            this.bbba.process(buffer, Math.min(nominalBufferSize, buffer.length - offset), offset);

        // reuse mono buffer if stereo
        if (output.length == 2)
            output[1].set(buffer);

        return true;
    }
};

registerProcessor("mapi-proc", MapiWorkletProcessor);
