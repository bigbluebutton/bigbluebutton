package org.bigbluebutton.api.domain;

import java.util.Map;
import java.util.TreeMap;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "meta")
public class Metadata {
  private Map<String,String> map = new TreeMap<String,String>();

  @JsonAnyGetter
  public Map<String, String> get() {
    return map;
  }

  @JsonAnySetter
  public void set(String name, String value) {
    map.put(name, value);
  }

  public void remove(String key) {
    map.remove(key);
  }

  public boolean containsKey(String key) {
    return map.containsKey(key);
  }
}
