package org.bigbluebutton.voiceconf.util;

import java.io.*;

public final class StackTraceUtil {
	public static String getStackTrace(Throwable aThrowable) {
	    final Writer result = new StringWriter();
	    final PrintWriter printWriter = new PrintWriter(result);
	    aThrowable.printStackTrace(printWriter);
	    return result.toString();
	  }
}
