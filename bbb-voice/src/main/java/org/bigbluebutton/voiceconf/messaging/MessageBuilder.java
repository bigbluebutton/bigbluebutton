package org.bigbluebutton.voiceconf.messaging;

import com.google.gson.Gson;

public class MessageBuilder {
  
  private static java.util.HashMap<String, Object> buildEnvelope(String name, String voiceConf) {
    java.util.HashMap<String, Object> envelope = new java.util.HashMap<String, Object>();
    envelope.put(Constants.NAME, name);
    
    java.util.HashMap<String, Object> routing = new java.util.HashMap<String, Object>();
    routing.put(Constants.VOICE_CONF, voiceConf);
    envelope.put(Constants.ROUTING, routing);
      
    return envelope;
  }
  
  private static java.util.HashMap<String, Object> buildHeader(String name, String voiceConf) {
    java.util.HashMap<String, Object> header = new java.util.HashMap<String, Object>();
    header.put(Constants.NAME, name);
    header.put(Constants.VOICE_CONF, voiceConf);
    
    return header;
  }
  
  public static String buildJson(String name, String voiceConf, java.util.HashMap<String, Object> body) {
    java.util.HashMap<String, Object> message = new java.util.HashMap<String, Object>();
    message.put(Constants.ENVELOPE, buildEnvelope(name, voiceConf));
  
    java.util.HashMap<String, Object> core = new java.util.HashMap<String, Object>();
    core.put(Constants.HEADER, buildHeader(name, voiceConf));
    core.put(Constants.BODY, body);
    message.put(Constants.CORE, core);
    
    Gson gson = new Gson();
    return gson.toJson(message);
  }
}

/*
  {
    "envelope": {
      "name": "UserLeaveReqMsg",
      "routing": {
        "voiceConf": "88823"
      }
    },
    "core": {
      "header": {
        "name": "UserLeaveReqMsg",
        "voiceConf": "88823"
      },
      "body": {
        "userId": "w_rq5kqn319msj",
        "name": "sample"
      }
    }
  }
*/