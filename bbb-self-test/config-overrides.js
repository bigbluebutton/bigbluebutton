const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.alias = {
        ...config.resolve.alias,
        process: "process/browser",
    };
    config.resolve.fallback = {
        ...config.resolve.fallback,
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),

        fs: false,
        path: false,
        child_process: false,
        os: false,
        zlib: require.resolve('browserify-zlib'),
        crypto: require.resolve("crypto-browserify"),
        net: require.resolve('net'),
        tls: require.resolve('tls'),
        async_hooks: require.resolve('async_hooks'),
        constants: false,
        'aws-sdk': false,

        'stream/web': false,
        'util/types': false,
        worker_threads: false,
        perf_hooks: false,
        console: false,
        diagnostics_channel: false,
        dns: false,
        timers: false,

        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser"),
        buffer: require.resolve("buffer"),
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin({
            'process.versions.node': JSON.stringify('14.21.3'),
        }),
    ];

    return config;
}