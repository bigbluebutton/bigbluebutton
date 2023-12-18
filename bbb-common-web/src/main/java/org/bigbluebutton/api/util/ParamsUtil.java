package org.bigbluebutton.api.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;

public class ParamsUtil {
  private static Logger log = LoggerFactory.getLogger(ParamsUtil.class);

  private static final Pattern VALID_ID_PATTERN = Pattern.compile("[a-zA-Z][a-zA-Z0-9- ]*$");

  public static final String INVALID_CHARS = ",";

  public static String stripControlChars(String text) {
    return text.replaceAll("\\p{Cc}", "").trim();
  }

  public static String escapeHTMLTags(String value) {
    return StringEscapeUtils.escapeHtml4(value);
  }

  public static boolean isValidMeetingId(String meetingId) {
    //return  VALID_ID_PATTERN.matcher(meetingId).matches();
    return !containsChar(meetingId, INVALID_CHARS);
  }

  public static boolean containsChar(String text, String chars) {
    return StringUtils.containsAny(text, chars);
  }

  public static String getSessionToken(String url) {
    String token = "undefined";
    try {
      String decodedURL = URLDecoder.decode(url, "UTF-8");
      String[] splitURL = decodedURL.split("\\?");
      if (splitURL.length == 2) {
        String params = splitURL[1];
        for (String param : params.split("\\&")) {
          if (param.startsWith("sessionToken=")) {
            token = param.split("\\=")[1];
          }
        }
      }
    } catch (UnsupportedEncodingException e) {
      log.error(e.toString());
    }
    return token;
  }

  public static String sanitizeString(String inputString) {
    if(inputString == null) {
      return "";
    }

    String sanitizedString = stripControlChars(inputString);
    String trimmedString = sanitizedString.trim();
    return trimmedString;
  }
}
