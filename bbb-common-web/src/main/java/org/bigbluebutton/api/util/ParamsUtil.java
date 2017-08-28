package org.bigbluebutton.api.util;

import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;

public class ParamsUtil {
  private static final Pattern VALID_ID_PATTERN = Pattern.compile("[a-zA-Z][a-zA-Z0-9- ]*$");

  public static final String invalidChars = ",";

  public static String stripControlChars(String text) {
    return text.replaceAll("\\p{Cc}", "");
  }

  public static boolean isValidMeetingId(String meetingId) {
    //return  VALID_ID_PATTERN.matcher(meetingId).matches();
    return !containsChar(meetingId, invalidChars);
  }

  public static boolean containsChar(String text, String chars) {
    return StringUtils.containsAny(text, chars);
  }
}
