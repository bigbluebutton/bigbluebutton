package org.bigbluebutton.api;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;

public class ParamsProcessorUtil {
	public String processPassword(String pass) {
		return StringUtils.isEmpty(pass) ? RandomStringUtils.randomAlphanumeric(8) : pass;
	}
}
