package org.bigbluebutton.core.util;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;

public class WebApiUtil {

  private final String securitySalt = "changeme";
      
  //
  //checksum() -- Return a checksum based on SHA-1 digest
  //
  public String checksum(String s) {
   String checksum = "";
   try {
     checksum = DigestUtils.shaHex(s);
   } catch (Exception e) {
     e.printStackTrace();
   }
   return checksum;
  }

  //From the list of parameters we want to pass. Creates a base string with parameters
  //sorted in alphabetical order for us to sign.
  public String createBaseString(Map<String, String[]> params) {
   StringBuffer csbuf = new StringBuffer();
   SortedSet<String> keys = new TreeSet<String>(params.keySet());
  
   boolean first = true;
   for (String key: keys) {
     for (String value: params.get(key)) {
       if (first) {
         first = false;
       } else {
         csbuf.append("&");
       }
       csbuf.append(key);
       csbuf.append("=");
       csbuf.append(value);
     }
   }
  
   return csbuf.toString();
  }
  
  public boolean isChecksumSame(String apiCall, String checksum, String queryString) {
    if (StringUtils.isEmpty(securitySalt)) {
      return true;
    }

    if( queryString == null ) {
        queryString = "";
    } else {
        // handle either checksum as first or middle / end parameter
        // TODO: this is hackish - should be done better
        queryString = queryString.replace("&checksum=" + checksum, "");
        queryString = queryString.replace("checksum=" + checksum + "&", "");
        queryString = queryString.replace("checksum=" + checksum, "");
    }

    String cs = DigestUtils.shaHex(apiCall + queryString + securitySalt);

    if (cs == null || cs.equals(checksum) == false) {
      return false;
    }

    return true; 
  }
  
  //
  //encodeURIComponent() -- Java encoding similiar to JavaScript encodeURIComponent
  //
  public String encodeURIComponent(String component)   {     
    String result = null;      
    
    try {       
      result = URLEncoder.encode(component, "UTF-8")   
           .replaceAll("\\%28", "(")                          
           .replaceAll("\\%29", ")")      
           .replaceAll("\\+", "%20")                          
           .replaceAll("\\%27", "'")           
           .replaceAll("\\%21", "!")
           .replaceAll("\\%7E", "~");     
    } catch (UnsupportedEncodingException e) {       
      result = component;     
    }      
    
    return result;   
  } 
}
