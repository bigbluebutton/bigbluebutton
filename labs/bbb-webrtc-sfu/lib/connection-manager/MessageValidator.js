const Joi = require('joi');

let instance = null;

module.exports = class MessageParser {
  constructor() {
    if(!instance){
      instance = this;
    }
    return instance;
  }

  static const schema {
    startScreenshare: Joi.object().keys({
      sdpOffer : Joi.string().required(),
      vh: Joi.number().required(),
      vw: Joi.number().required()
    }),

    startVideo: Joi.object().keys({
      internalMeetingId: joi.string().required(),
      callerName : Joi.string().required(),
    }),

    startAudio: Joi.object().keys({
      internalMeetingId: joi.string().required(),
      callerName : Joi.string().required(),
    }),

    playStart: Joi.object().keys({
    }),

    playStop: Joi.object().keys.({
    }),

    stop: Joi.object().keys({
    }),

    onIceCandidate: Joi.object().keys({
      internalMeetingId: joi.string().required(),
      candidate: Joi.object().required(),
    }),
  }

  static const messageTemplate Joi.object().keys({
    id: Joi.string().required(),
    type: joi.string().required(),
    role: joi.string().required(),
  })

  static const validateMessage (msg) {
    let res = Joi.validate(msg, messageTemplate, {allowUnknown: true});

    if (!res.error) {
      res = Joi.validate(msg, schema[msg.id]);
    }

    return res;
  }

  _parse (message) {
    let parsed = { id: '' };

    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.error(e);
    }

    let res = validateMessage(parsed);

    if (res.error) {
      parsed.validMessage = false;
      parsed.errors = res.error;
    } else {
      parsed.validMessage = true;
    }

    return parsed;
  }
}
