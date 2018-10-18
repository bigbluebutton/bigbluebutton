package org.bigbluebutton.common.messages;

import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;

import com.google.gson.Gson;

public class MessageBuilder {
  public final static String VERSION = "version";
  public static final String NAME                            = "name";
  public static final String HEADER                          = "header";
  public static final String PAYLOAD                         = "payload";
  public static final String TIMESTAMP                       = "timestamp";
  public static final String REPLY_TO                        = "reply_to";
  
  public static long generateTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
  
  public static java.util.HashMap<String, Object> buildHeader(String name, String version, String replyTo) {
  	java.util.HashMap<String, Object> header = new java.util.HashMap<String, Object>();
    header.put(NAME, name);
    header.put(VERSION, version);
    header.put(TIMESTAMP, generateTimestamp());
    if (!StringUtils.isEmpty(replyTo))
      header.put(REPLY_TO, replyTo);
    
    return header;
  }
  
  
  public static String buildJson(java.util.HashMap<String, Object> header, 
  		java.util.HashMap<String, Object> payload) {
    
  	java.util.HashMap<String, java.util.HashMap<String, Object>> message = new java.util.HashMap<String, java.util.HashMap<String, Object>>();
    message.put(HEADER, header);
    message.put(PAYLOAD, payload);
    
    Gson gson = new Gson();
    return gson.toJson(message);
  }
}
