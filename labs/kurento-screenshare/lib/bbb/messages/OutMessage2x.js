/*
 * (C) Copyright 2016 Mconf Tecnologia (http://mconf.com/)
 */

/**
 * @classdesc
 * Base class for output messages sent to BBB
 * 2x model
 * @constructor
 */
function OutMessage2x(messageName, routing, headerFields) {


    this.envelope = {
      name: messageName,
      routing: routing 
    }
    /**
     * The header template of the message
     * @type {Object}
     */
    this.core = {
      header : {
        name: messageName
      }
    }

    // Copy header fiels to the header object
    var keys1 = Object.keys(headerFields);
    for (var k=0; k < keys1.length; k++) {
      var key = keys1[k];
      if (typeof this.core.header[key] === 'undefined') {
        this.core.header[key] = headerFields[key];
      }
    }

    /**
     * The body of the message
     * @type {Object}
     */
    this.core.body = null;

    /**
     * Generates the JSON representation of the message
     * @return {String} The JSON string of this message
     */
    this.toJson = function () {
        return JSON.stringify(this);
    }
};

module.exports = OutMessage2x;
