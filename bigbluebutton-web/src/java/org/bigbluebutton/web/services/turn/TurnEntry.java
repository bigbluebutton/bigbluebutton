package org.bigbluebutton.web.services.turn;

public class TurnEntry {

  public final String username;
  public final String url;
  public final String password;
  public final int ttl;
  
  public TurnEntry(String username, String password, int ttl, String url) {
    this.username = username;
    this.url = url;
    this.password = password;
    this.ttl = ttl;
  }
/*  
  public String getUsername() {
    return username;
  }
  
  public String getUrl() {
    return url;
  }
  
  public String getPassord() {
    return password;
  }
  
  public int getTtl() {
    return ttl;
  }
  */
}
