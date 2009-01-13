package org.bigbluebutton;

import org.testng.annotations.*;
import org.apache.commons.lang.StringUtils;

public class StringUtilsTest
{
	@Test
	public void isEmpty()
	{
		assert StringUtils.isBlank(null);
		assert StringUtils.isBlank("");
	}

	@Test
	public void trim()
	{
		assert "foo".equals(StringUtils.trim("  foo   "));
	}
}

