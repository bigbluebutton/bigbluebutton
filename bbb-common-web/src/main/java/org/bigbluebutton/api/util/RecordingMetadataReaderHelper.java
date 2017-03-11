package org.bigbluebutton.api.util;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class RecordingMetadataReaderHelper {

  public static String inputStreamToString(InputStream is) throws IOException {
    StringBuilder sb = new StringBuilder();
    String line;
    BufferedReader br = new BufferedReader(new InputStreamReader(is));
    while ((line = br.readLine()) != null) {
      sb.append(line);
    }
    br.close();
    return sb.toString();
  }
}
