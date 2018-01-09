/*
 * (C) Copyright 2016 Mconf Tecnologia (http://mconf.com/)
 */

/**
 * @classdesc
 * Base class for output messages sent to BBB
 * @constructor
 */
function OutMessage(messageName) {
    /**
     * The header template of the message
     * @type {Object}
     */
    this.header = {
        version: "0.0.1",
        name: messageName
    };

    /**
     * The payload of the message
     * @type {Object}
     */
    this.payload = null;

    /**
     * Generates the JSON representation of the message
     * @return {String} The JSON string of this message
     */
    this.toJson = function () {
        return JSON.stringify(this);
    }
};

module.exports = OutMessage;
