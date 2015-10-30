package org.bigbluebutton.messages;


public class Header {
  public enum MessageType {
    SYSTEM, BROADCAST, DIRECT
  }

  public final String name;

  public Header(String name) {
    this.name = name;
  }
}
