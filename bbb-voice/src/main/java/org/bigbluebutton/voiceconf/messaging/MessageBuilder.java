package org.bigbluebutton.voiceconf.messaging;

import java.util.concurrent.TimeUnit;

import com.google.gson.Gson;

public class MessageBuilder {
  public final static String VERSION = "version";

  public static long generateTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
  
  public static java.util.HashMap<String, Object> buildHeader(String name, String version, String replyTo) {
  	java.util.HashMap<String, Object> header = new java.util.HashMap<String, Object>();
    header.put(Constants.NAME, name);
    header.put(VERSION, version);
    header.put(Constants.TIMESTAMP, generateTimestamp());
    if (replyTo != null && replyTo != "")
      header.put(Constants.REPLY_TO, replyTo);
    
    return header;
  }
  
  
  public static String buildJson(java.util.HashMap<String, Object> header, 
  		java.util.HashMap<String, Object> payload) {
    
  	java.util.HashMap<String, java.util.HashMap<String, Object>> message = new java.util.HashMap<String, java.util.HashMap<String, Object>>();
    message.put(Constants.HEADER, header);
    message.put(Constants.PAYLOAD, payload);
    
    Gson gson = new Gson();
    return gson.toJson(message);
  }
}
