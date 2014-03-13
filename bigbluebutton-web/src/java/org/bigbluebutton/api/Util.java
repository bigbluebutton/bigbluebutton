package org.bigbluebutton.api;

import java.util.regex.Pattern;

public final class Util {

	public static String cleanPresentationFilename(String name) {
		String cleanFilename = Pattern.compile("[^0-9a-zA-Z_.]").matcher(name).replaceAll("-");
		if (cleanFilename.startsWith(".")) {
			return cleanFilename.substring(1);
		} else {
			return cleanFilename;
		}
	}
}
