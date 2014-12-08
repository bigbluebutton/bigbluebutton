package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.VersionCheckUtil;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class VersionCheckUtilTest {
	@BeforeMethod 
	public void setUp() {
		
	}
	
	@Test
	public void testJava8Version() {
    boolean passed = VersionCheckUtil.validateMinJREVersion("1.8.0_11", "1.7.0_51");
		Assert.assertTrue(passed, "The version check should pass.");
	}
	
	@Test
	public void testJava7u65Version() {
    boolean passed = VersionCheckUtil.validateMinJREVersion("1.7.0_65", "1.7.0_51");
		Assert.assertTrue(passed, "The version check should pass.");
	}
	
	@Test
	public void testJava7u65BetaVersion() {
    boolean fail = VersionCheckUtil.validateMinJREVersion("1.7.0_65-b19", "1.7.0_51");
		Assert.assertFalse(fail, "Non GS release is unsupported.");
	}
}
