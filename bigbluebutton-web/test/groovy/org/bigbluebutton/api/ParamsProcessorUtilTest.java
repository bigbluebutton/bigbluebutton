package org.bigbluebutton.api;

import java.util.HashMap;
import java.util.Map;

import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class ParamsProcessorUtilTest {
	@BeforeMethod 
	public void setUp() {
		
	}
	
	@Test
	public void testMetaParameter() {
    boolean passed = ParamsProcessorUtil.isMetaValid("meta_foo");
		Assert.assertTrue(passed, "The meta check should pass.");
	}
	
	@Test
	public void testInvalidMetaParameterUndescore() {
    boolean failed = ParamsProcessorUtil.isMetaValid("meta_foo-bar_");
		Assert.assertFalse(failed, "The meta check should fail due to underscore (_).");
	}

	@Test
	public void testInvalidMetaParameterWrongStartsWith() {
    boolean failed = ParamsProcessorUtil.isMetaValid("notmeta_foo");
		Assert.assertFalse(failed, "The meta check should fail due to not starting with 'meta'.");
	}
	
	@Test
	public void testInvalidMetaParameterNonAlphaNumChar() {
    boolean failed = ParamsProcessorUtil.isMetaValid("meta_foo-bar_&");
		Assert.assertFalse(failed, "The meta check should fail due to & char.");
	}
	
	@Test
	public void testInvalidMetaParameterNonAlphaAfterMeta() {
    boolean failed = ParamsProcessorUtil.isMetaValid("meta_1");
		Assert.assertFalse(failed, "The meta check should fail due to 1 char.");
	}
	
	@Test
	public void testStringMetaFromParameter() {
    String result = ParamsProcessorUtil.removeMetaString("meta_foo");
		Assert.assertEquals(result, "foo");
	}
	
	@Test
	public void testStringMetaFromParameterWithDash() {
    String result = ParamsProcessorUtil.removeMetaString("meta_foo-bar");
		Assert.assertEquals(result, "foo-bar");
	}
	
	@Test
	public void testProcessMetaParameters() {
		Map<String, String> params = new HashMap<String, String>();
		params.put("meta_foo", "foo");
		params.put("meta_bar", "bar");
    Map<String, String> metas = ParamsProcessorUtil.processMetaParam(params);
		Assert.assertEquals(metas.size(), 2);
	}	
	
	@Test
	public void testProcessMetaParametersSkippingInvalid() {
		Map<String, String> params = new HashMap<String, String>();
		params.put("meta_foo", "foo");
		params.put("meta_bar", "bar");
		params.put("invalid_meta", "discarded");
    Map<String, String> metas = ParamsProcessorUtil.processMetaParam(params);
		Assert.assertEquals(metas.size(), 2);
	}	
}
