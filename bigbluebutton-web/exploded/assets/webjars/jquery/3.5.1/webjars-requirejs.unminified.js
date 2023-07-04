var process = process || {env: {NODE_ENV: "development"}};
/*global requirejs */

// Ensure any request for this webjar brings in jQuery.
requirejs.config({
    paths: { "jquery": webjars.path("jquery", "jquery") },
    shim: { "jquery": { "exports": "$" } }
});

