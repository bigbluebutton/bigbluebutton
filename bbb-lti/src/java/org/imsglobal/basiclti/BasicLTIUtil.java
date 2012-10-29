/*
 * $URL: https://source.sakaiproject.org/svn/basiclti/trunk/basiclti-util/src/java/org/imsglobal/basiclti/BasicLTIUtil.java $
 * $Id: BasicLTIUtil.java 98512 2011-09-22 17:59:08Z csev@umich.edu $
 *
 * Copyright (c) 2008 IMS GLobal Learning Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

package org.imsglobal.basiclti;

import static org.imsglobal.basiclti.BasicLTIConstants.CUSTOM_PREFIX;
import static org.imsglobal.basiclti.BasicLTIConstants.LTI_MESSAGE_TYPE;
import static org.imsglobal.basiclti.BasicLTIConstants.LTI_VERSION;
import static org.imsglobal.basiclti.BasicLTIConstants.TOOL_CONSUMER_INSTANCE_CONTACT_EMAIL;
import static org.imsglobal.basiclti.BasicLTIConstants.TOOL_CONSUMER_INSTANCE_DESCRIPTION;
import static org.imsglobal.basiclti.BasicLTIConstants.TOOL_CONSUMER_INSTANCE_GUID;
import static org.imsglobal.basiclti.BasicLTIConstants.TOOL_CONSUMER_INSTANCE_NAME;
import static org.imsglobal.basiclti.BasicLTIConstants.TOOL_CONSUMER_INSTANCE_URL;

import net.oauth.OAuthAccessor;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthMessage;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;
import java.util.Map.Entry;
import java.util.logging.Logger;
import java.util.regex.Pattern;

/* Leave out until we have JTidy 0.8 in the repository 
 import org.w3c.tidy.Tidy;
 import java.io.ByteArrayOutputStream;
 */

/**
 * Some Utility code for IMS Basic LTI
 * http://www.anyexample.com/programming/java
 * /java_simple_class_to_compute_sha_1_hash.xml
 * <p>
 * Sample Descriptor
 * 
 * <pre>
 * &lt;?xml&nbsp;version=&quot;1.0&quot;&nbsp;encoding=&quot;UTF-8&quot;?&gt;
 * &lt;basic_lti_link&nbsp;xmlns=&quot;http://www.imsglobal.org/xsd/imsbasiclti_v1p0&quot;&nbsp;xmlns:xsi=&quot;http://www.w3.org/2001/XMLSchema-instance&quot;&gt;
 *   &lt;title&gt;generated&nbsp;by&nbsp;tp+user&lt;/title&gt;
 *   &lt;description&gt;generated&nbsp;by&nbsp;tp+user&lt;/description&gt;
 *   &lt;custom&gt;
 *     &lt;parameter&nbsp;key=&quot;keyname&quot;&gt;value&lt;/parameter&gt;
 *   &lt;/custom&gt;
 *   &lt;extensions&nbsp;platform=&quot;www.lms.com&quot;&gt;
 *     &lt;parameter&nbsp;key=&quot;keyname&quot;&gt;value&lt;/parameter&gt;
 *   &lt;/extensions&gt;
 *   &lt;launch_url&gt;url&nbsp;to&nbsp;the&nbsp;basiclti&nbsp;launch&nbsp;URL&lt;/launch_url&gt;
 *   &lt;secure_launch_url&gt;url&nbsp;to&nbsp;the&nbsp;basiclti&nbsp;launch&nbsp;URL&lt;/secure_launch_url&gt;
 *   &lt;icon&gt;url&nbsp;to&nbsp;an&nbsp;icon&nbsp;for&nbsp;this&nbsp;tool&nbsp;(optional)&lt;/icon&gt;
 *   &lt;secure_icon&gt;url&nbsp;to&nbsp;an&nbsp;icon&nbsp;for&nbsp;this&nbsp;tool&nbsp;(optional)&lt;/secure_icon&gt;
 *   &lt;cartridge_icon&nbsp;identifierref=&quot;BLTI001_Icon&quot;/&gt;
 *   &lt;vendor&gt;
 *     &lt;code&gt;vendor.com&lt;/code&gt;
 *     &lt;name&gt;Vendor&nbsp;Name&lt;/name&gt;
 *     &lt;description&gt;
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This&nbsp;is&nbsp;a&nbsp;Grade&nbsp;Book&nbsp;that&nbsp;supports&nbsp;many&nbsp;column&nbsp;types.
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/description&gt;
 *     &lt;contact&gt;
 *       &lt;email&gt;support@vendor.com&lt;/email&gt;
 *     &lt;/contact&gt;
 *     &lt;url&gt;http://www.vendor.com/product&lt;/url&gt;
 *   &lt;/vendor&gt;
 * &lt;/basic_lti_link&gt;
 * </pre>
 */
public class BasicLTIUtil {

	// We use the built-in Java logger because this code needs to be very generic
	private static Logger M_log = Logger.getLogger(BasicLTIUtil.class.toString());

	/** To turn on really verbose debugging */
	private static boolean verbosePrint = false;

	public static final String BASICLTI_SUBMIT = "ext_basiclti_submit";

	private static final Pattern CUSTOM_REGEX = Pattern.compile("[^A-Za-z0-9]");
	private static final String UNDERSCORE = "_";

	// Simple Debug Print Mechanism
	public static void dPrint(String str) {
		if (verbosePrint)
			System.out.println(str);
		M_log.fine(str);
	}

	public static String validateDescriptor(String descriptor) {
		if (descriptor == null)
			return null;
		if (descriptor.indexOf("<basic_lti_link") < 0)
			return null;

		Map<String, Object> tm = XMLMap.getFullMap(descriptor.trim());
		if (tm == null)
			return null;

		// We demand at least an endpoint
		String ltiSecureLaunch = XMLMap.getString(tm,
				"/basic_lti_link/secure_launch_url");
		// We demand at least an endpoint
		if (ltiSecureLaunch != null && ltiSecureLaunch.trim().length() > 0)
			return ltiSecureLaunch;
		String ltiLaunch = XMLMap.getString(tm, "/basic_lti_link/launch_url");
		if (ltiLaunch != null && ltiLaunch.trim().length() > 0)
			return ltiLaunch;
		return null;
	}

	/**
	 * Any properties which are not well known (i.e. in
	 * {@link BasicLTIConstants#validPropertyNames}) will be mapped to custom
	 * properties per the specified semantics. NOTE: no blacklisting of keys is
	 * performed.
	 * 
	 * @param rawProperties
	 *          A set of properties that will be cleaned.
	 * @return A cleansed version of rawProperties.
	 */
	public static Map<String, String> cleanupProperties(
			final Map<String, String> rawProperties) {
		return cleanupProperties(rawProperties, null);
	}

	/**
	 * Any properties which are not well known (i.e. in
	 * {@link BasicLTIConstants#validPropertyNames}) will be mapped to custom
	 * properties per the specified semantics.
	 * 
	 * @param rawProperties
	 *          A set of properties that will be cleaned.
	 * @param blackList
	 *          An array of {@link String}s which are considered unsafe to be
	 *          included in launch data. Any matches will be removed from the
	 *          return.
	 * @return A cleansed version of rawProperties.
	 */
	public static Map<String, String> cleanupProperties(
			final Map<String, String> rawProperties, final String[] blackList) {
		final Map<String, String> newProp = new HashMap<String, String>(
				rawProperties.size()); // roughly the same size
		for (String okey : rawProperties.keySet()) {
			final String key = okey.trim();
			if (blackList != null) {
				boolean blackListed = false;
				for (String blackKey : blackList) {
					if (blackKey.equals(key)) {
						blackListed = true;
						break;
					}
				}
				if (blackListed) {
					continue;
				}
			}
			final String value = rawProperties.get(key);
			if (value == null || "".equals(value)) {
				// remove null or empty values
				continue;
			}
			if (isSpecifiedPropertyName(key)) {
				// a well known property name
				newProp.put(key, value);
			} else {
				// convert to a custom property name
				newProp.put(adaptToCustomPropertyName(key), value);
			}
		}
		return newProp;
	}

	/**
	 * Any properties which are not well known (i.e. in
	 * {@link BasicLTIConstants#validPropertyNames}) will be mapped to custom
	 * properties per the specified semantics.
	 * 
	 * @deprecated See {@link #cleanupProperties(Map)}
	 * @param rawProperties
	 *          A set of {@link Properties} that will be cleaned. Keys must be of
	 *          type {@link String}.
	 * @return A cleansed version of {@link Properties}.
	 */
	public static Properties cleanupProperties(final Properties rawProperties) {
		final Map<String, String> map = cleanupProperties(
				convertToMap(rawProperties), null);
		return convertToProperties(map);
	}

	/**
	 * Checks to see if the passed propertyName is equal to one of the Strings
	 * contained in {@link BasicLTIConstants#validPropertyNames}. String matching
	 * is case sensitive.
	 * 
	 * @param propertyName
	 * @return true if propertyName is equal to one of the Strings contained in
	 *         {@link BasicLTIConstants#validPropertyNames} 
	 *         or is a custom parameter oe extension parameter ;
	 *         else return false.
	 */
	public static boolean isSpecifiedPropertyName(final String propertyName) {
		boolean found = false;
		if ( propertyName.startsWith(BasicLTIConstants.CUSTOM_PREFIX) ) return true;
		if ( propertyName.startsWith(BasicLTIConstants.EXTENSION_PREFIX) ) return true;
		if ( propertyName.startsWith(BasicLTIConstants.OAUTH_PREFIX) ) return true;
		for (String key : BasicLTIConstants.validPropertyNames) {
			if (key.equals(propertyName)) {
				found = true;
				break;
			}
		}
		return found;
	}

	/**
	 * A simple utility method which implements the specified semantics of custom
	 * properties.
	 * <p>
	 * i.e. The parameter names are mapped to lower case and any character that is
	 * neither a number nor letter in a parameter name is replaced with an
	 * "underscore".
	 * <p>
	 * e.g. Review:Chapter=1.2.56 would map to custom_review_chapter=1.2.56.
	 * 
	 * @param propertyName
	 * @return
	 */
	public static String adaptToCustomPropertyName(final String propertyName) {
		if (propertyName == null || "".equals(propertyName)) {
			throw new IllegalArgumentException("propertyName cannot be null");
		}
		String customName = propertyName.toLowerCase();
		customName = CUSTOM_REGEX.matcher(customName).replaceAll(UNDERSCORE);
		if (!customName.startsWith(CUSTOM_PREFIX)) {
			customName = CUSTOM_PREFIX + customName;
		}
		return customName;
	}

	/**
	 * Add the necessary fields and sign.
	 * 
	 * @deprecated See:
	 *             {@link BasicLTIUtil#signProperties(Map, String, String, String, String, String, String, String, String, String)}
	 * 
	 * @param postProp
	 * @param url
	 * @param method
	 * @param oauth_consumer_key
	 * @param oauth_consumer_secret
	 * @param org_id
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_GUID}
	 * @param org_desc
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_DESCRIPTION}
	 * @param org_url
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_URL}
	 * @return
	 */
	public static Properties signProperties(Properties postProp, String url,
			String method, String oauth_consumer_key, String oauth_consumer_secret,
			String org_id, String org_desc, String org_url) {
		final Map<String, String> signedMap = signProperties(
				convertToMap(postProp), url, method, oauth_consumer_key,
				oauth_consumer_secret, org_id, org_desc, org_url, null, null);
		return convertToProperties(signedMap);
	}

	/**
	 * Add the necessary fields and sign.
	 * 
	 * @param postProp
	 * @param url
	 * @param method
	 * @param oauth_consumer_key
	 * @param oauth_consumer_secret
	 * @param tool_consumer_instance_guid
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_GUID}
	 * @param tool_consumer_instance_description
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_DESCRIPTION}
	 * @param tool_consumer_instance_url
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_URL}
	 * @param tool_consumer_instance_name
	 *          See: {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_NAME}
	 * @param tool_consumer_instance_contact_email
	 *          See:
	 *          {@link BasicLTIConstants#TOOL_CONSUMER_INSTANCE_CONTACT_EMAIL}
	 * @return
	 */
	public static Map<String, String> signProperties(
			Map<String, String> postProp, String url, String method,
			String oauth_consumer_key, String oauth_consumer_secret,
			String tool_consumer_instance_guid,
			String tool_consumer_instance_description,
			String tool_consumer_instance_url, String tool_consumer_instance_name,
			String tool_consumer_instance_contact_email) {
		postProp = BasicLTIUtil.cleanupProperties(postProp);
		postProp.put(LTI_VERSION, "LTI-1p0");
		postProp.put(LTI_MESSAGE_TYPE, "basic-lti-launch-request");
		// Allow caller to internationalize this for us...
		if (postProp.get(BASICLTI_SUBMIT) == null) {
			postProp.put(BASICLTI_SUBMIT, "Launch Endpoint with BasicLTI Data");
		}
		if (tool_consumer_instance_guid != null)
			postProp.put(TOOL_CONSUMER_INSTANCE_GUID, tool_consumer_instance_guid);
		if (tool_consumer_instance_description != null)
			postProp.put(TOOL_CONSUMER_INSTANCE_DESCRIPTION,
					tool_consumer_instance_description);
		if (tool_consumer_instance_url != null)
			postProp.put(TOOL_CONSUMER_INSTANCE_URL, tool_consumer_instance_url);
		if (tool_consumer_instance_name != null)
			postProp.put(TOOL_CONSUMER_INSTANCE_NAME, tool_consumer_instance_name);
		if (tool_consumer_instance_contact_email != null)
			postProp.put(TOOL_CONSUMER_INSTANCE_CONTACT_EMAIL,
					tool_consumer_instance_contact_email);

		if (postProp.get("oauth_callback") == null)
			postProp.put("oauth_callback", "about:blank");

		if (oauth_consumer_key == null || oauth_consumer_secret == null) {
			dPrint("No signature generated in signProperties");
			return postProp;
		}

		OAuthMessage oam = new OAuthMessage(method, url, postProp.entrySet());
		OAuthConsumer cons = new OAuthConsumer("about:blank", oauth_consumer_key,
				oauth_consumer_secret, null);
		OAuthAccessor acc = new OAuthAccessor(cons);
		try {
			oam.addRequiredParameters(acc);
			// System.out.println("Base Message String\n"+OAuthSignatureMethod.getBaseString(oam)+"\n");

			List<Map.Entry<String, String>> params = oam.getParameters();

			Map<String, String> nextProp = new HashMap<String, String>();
			// Convert to Map<String, String>
			for (final Map.Entry<String, String> entry : params) {
				nextProp.put(entry.getKey(), entry.getValue());
			}
			return nextProp;
		} catch (net.oauth.OAuthException e) {
			M_log.warning("BasicLTIUtil.signProperties OAuth Exception "
					+ e.getMessage());
			throw new Error(e);
		} catch (java.io.IOException e) {
			M_log.warning("BasicLTIUtil.signProperties IO Exception "
					+ e.getMessage());
			throw new Error(e);
		} catch (java.net.URISyntaxException e) {
			M_log.warning("BasicLTIUtil.signProperties URI Syntax Exception "
					+ e.getMessage());
			throw new Error(e);
		}

	}

	/**
	 * Create the HTML to render a POST form and then automatically submit it.
	 * Make sure to call {@link #cleanupProperties(Properties)} before signing.
	 * 
	 * @deprecated Moved to {@link #postLaunchHTML(Map, String, boolean)}
	 * @param cleanProperties
	 *          Assumes you have called {@link #cleanupProperties(Properties)}
	 *          beforehand.
	 * @param endpoint
	 *          The LTI launch url.
	 * @param debug
	 *          Useful for viewing the HTML before posting to end point.
	 * @return the HTML ready for IFRAME src = inclusion.
	 */
	public static String postLaunchHTML(final Properties cleanProperties,
			String endpoint, boolean debug) {
		Map<String, String> map = convertToMap(cleanProperties);
		return postLaunchHTML(map, endpoint, debug);
	}

	/**
	 * Create the HTML to render a POST form and then automatically submit it.
	 * Make sure to call {@link #cleanupProperties(Properties)} before signing.
	 * 
	 * @param cleanProperties
	 *          Assumes you have called {@link #cleanupProperties(Properties)}
	 *          beforehand.
	 * @param endpoint
	 *          The LTI launch url.
	 * @param debug
	 *          Useful for viewing the HTML before posting to end point.
	 * @return the HTML ready for IFRAME src = inclusion.
	 */
	public static String postLaunchHTML(
			final Map<String, String> cleanProperties, String endpoint, boolean debug) {
		if (cleanProperties == null || cleanProperties.isEmpty()) {
			throw new IllegalArgumentException(
					"cleanProperties == null || cleanProperties.isEmpty()");
		}
		if (endpoint == null) {
			throw new IllegalArgumentException("endpoint == null");
		}
		Map<String, String> newMap = null;
		if (debug) {
			// sort the properties for readability
			newMap = new TreeMap<String, String>(cleanProperties);
		} else {
			newMap = cleanProperties;
		}
		StringBuilder text = new StringBuilder();
		// paint form
		text.append("<div id=\"ltiLaunchFormSubmitArea\">\n");
		text.append("<form action=\"");
		text.append(endpoint);
		text.append("\" name=\"ltiLaunchForm\" id=\"ltiLaunchForm\" method=\"post\" ");
		text.append(" encType=\"application/x-www-form-urlencoded\" accept-charset=\"utf-8\">\n");
		for (Entry<String, String> entry : newMap.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue();
			if (value == null)
				continue;
			// This will escape the contents pretty much - at least
			// we will be safe and not generate dangerous HTML
			key = htmlspecialchars(key);
			value = htmlspecialchars(value);
			if (key.equals(BASICLTI_SUBMIT)) {
				text.append("<input type=\"submit\" name=\"");
			} else {
				text.append("<input type=\"hidden\" name=\"");
			}
			text.append(key);
			text.append("\" value=\"");
			text.append(value);
			text.append("\"/>\n");
		}
		text.append("</form>\n");
		text.append("</div>\n");
		// paint debug output
		if (debug) {
			text.append("<pre>\n");
			text.append("<b>BasicLTI Endpoint</b>\n");
			text.append(endpoint);
			text.append("\n\n");
			text.append("<b>BasicLTI Parameters:</b>\n");
			for (Entry<String, String> entry : newMap.entrySet()) {
				String key = entry.getKey();
				String value = entry.getValue();
				if (value == null)
					continue;
				text.append(key);
				text.append("=");
				text.append(value);
				text.append("\n");
			}
			text.append("</pre>\n");
		} else {
			// paint auto submit script
			text
				.append(" <script language=\"javascript\"> \n"
						+ "    document.getElementById(\"ltiLaunchFormSubmitArea\").style.display = \"none\";\n"
						+ "    nei = document.createElement('input');\n"
						+ "    nei.setAttribute('type', 'hidden');\n"
						+ "    nei.setAttribute('name', '"
						+ BASICLTI_SUBMIT
						+ "');\n"
						+ "    nei.setAttribute('value', '"
						+ newMap.get(BASICLTI_SUBMIT)
						+ "');\n"
						+ "    document.getElementById(\"ltiLaunchForm\").appendChild(nei);\n"
						+ "    document.ltiLaunchForm.submit(); \n" + " </script> \n");
		}

		String htmltext = text.toString();
		return htmltext;
	}

	/**
	 * @deprecated See: {@link #parseDescriptor(Map, Map, String)}
	 * @param launch_info
	 *          Variable is mutated by this method.
	 * @param postProp
	 *          Variable is mutated by this method.
	 * @param descriptor
	 * @return
	 */
	public static boolean parseDescriptor(Properties launch_info,
			Properties postProp, String descriptor) {
		// this is an ugly copy/paste of the non-@deprecated method
		// could not convert data types as they variables get mutated (ugh)
		Map<String, Object> tm = null;
		try {
			tm = XMLMap.getFullMap(descriptor.trim());
		} catch (Exception e) {
			M_log.warning("BasicLTIUtil exception parsing BasicLTI descriptor: "
					+ e.getMessage());
			return false;
		}
		if (tm == null) {
			M_log.warning("Unable to parse XML in parseDescriptor");
			return false;
		}

		String launch_url = toNull(XMLMap.getString(tm,
					"/basic_lti_link/launch_url"));
		String secure_launch_url = toNull(XMLMap.getString(tm,
					"/basic_lti_link/secure_launch_url"));
		if (launch_url == null && secure_launch_url == null)
			return false;

		setProperty(launch_info, "launch_url", launch_url);
		setProperty(launch_info, "secure_launch_url", secure_launch_url);

		// Extensions for hand-authored placements - The export process should scrub
		// these
		setProperty(launch_info, "key", toNull(XMLMap.getString(tm,
						"/basic_lti_link/x-secure/launch_key")));
		setProperty(launch_info, "secret", toNull(XMLMap.getString(tm,
						"/basic_lti_link/x-secure/launch_secret")));

		List<Map<String, Object>> theList = XMLMap.getList(tm,
				"/basic_lti_link/custom/parameter");
		for (Map<String, Object> setting : theList) {
			dPrint("Setting=" + setting);
			String key = XMLMap.getString(setting, "/!key"); // Get the key attribute
			String value = XMLMap.getString(setting, "/"); // Get the value
			if (key == null || value == null)
				continue;
			key = "custom_" + mapKeyName(key);
			dPrint("key=" + key + " val=" + value);
			postProp.setProperty(key, value);
		}
		return true;
	}

	/**
	 * 
	 * @param launch_info
	 *          Variable is mutated by this method.
	 * @param postProp
	 *          Variable is mutated by this method.
	 * @param descriptor
	 * @return
	 */
	public static boolean parseDescriptor(Map<String, String> launch_info,
			Map<String, String> postProp, String descriptor) {
		Map<String, Object> tm = null;
		try {
			tm = XMLMap.getFullMap(descriptor.trim());
		} catch (Exception e) {
			M_log.warning("BasicLTIUtil exception parsing BasicLTI descriptor: "
					+ e.getMessage());
			return false;
		}
		if (tm == null) {
			M_log.warning("Unable to parse XML in parseDescriptor");
			return false;
		}

		String launch_url = toNull(XMLMap.getString(tm,
					"/basic_lti_link/launch_url"));
		String secure_launch_url = toNull(XMLMap.getString(tm,
					"/basic_lti_link/secure_launch_url"));
		if (launch_url == null && secure_launch_url == null)
			return false;

		setProperty(launch_info, "launch_url", launch_url);
		setProperty(launch_info, "secure_launch_url", secure_launch_url);

		// Extensions for hand-authored placements - The export process should scrub
		// these
		setProperty(launch_info, "key", toNull(XMLMap.getString(tm,
						"/basic_lti_link/x-secure/launch_key")));
		setProperty(launch_info, "secret", toNull(XMLMap.getString(tm,
						"/basic_lti_link/x-secure/launch_secret")));

		List<Map<String, Object>> theList = XMLMap.getList(tm,
				"/basic_lti_link/custom/parameter");
		for (Map<String, Object> setting : theList) {
			dPrint("Setting=" + setting);
			String key = XMLMap.getString(setting, "/!key"); // Get the key attribute
			String value = XMLMap.getString(setting, "/"); // Get the value
			if (key == null || value == null)
				continue;
			key = "custom_" + mapKeyName(key);
			dPrint("key=" + key + " val=" + value);
			postProp.put(key, value);
		}
		return true;
	}

	// Remove fields that should not be exported
	public static String prepareForExport(String descriptor) {
		Map<String, Object> tm = null;
		try {
			tm = XMLMap.getFullMap(descriptor.trim());
		} catch (Exception e) {
			M_log.warning("BasicLTIUtil exception parsing BasicLTI descriptor"
					+ e.getMessage());
			return null;
		}
		if (tm == null) {
			M_log.warning("Unable to parse XML in prepareForExport");
			return null;
		}
		XMLMap.removeSubMap(tm, "/basic_lti_link/x-secure");
		String retval = XMLMap.getXML(tm, true);
		return retval;
	}

	/**
	 * The parameter name is mapped to lower case and any character that is
	 * neither a number or letter is replaced with an "underscore". So if a custom
	 * entry was as follows:
	 * 
	 * <parameter name="Vendor:Chapter">1.2.56</parameter>
	 * 
	 * Would map to: custom_vendor_chapter=1.2.56
	 */
	public static String mapKeyName(String keyname) {
		StringBuffer sb = new StringBuffer();
		if (keyname == null)
			return null;
		keyname = keyname.trim();
		if (keyname.length() < 1)
			return null;
		for (int i = 0; i < keyname.length(); i++) {
			Character ch = Character.toLowerCase(keyname.charAt(i));
			if (Character.isLetter(ch) || Character.isDigit(ch)) {
				sb.append(ch);
			} else {
				sb.append('_');
			}
		}
		return sb.toString();
	}

	public static String toNull(String str) {
		if (str == null)
			return null;
		if (str.trim().length() < 1)
			return null;
		return str;
	}

	/**
	 * Mutates the passed Map<String, String> map variable. Puts the key,value
	 * into the Map if the value is not null and is not empty.
	 * 
	 * @param map
	 *          Variable is mutated by this method.
	 * @param key
	 * @param value
	 */
	public static void setProperty(final Map<String, String> map,
			final String key, final String value) {
		if (value != null && !"".equals(value)) {
			map.put(key, value);
		}
	}

	/**
	 * Mutates the passed Properties props variable. Puts the key,value into the
	 * Map if the value is not null and is not empty.
	 * 
	 * @deprecated See: {@link #setProperty(Map, String, String)}
	 * @param props
	 *          Variable is mutated by this method.
	 * @param key
	 * @param value
	 */
	public static void setProperty(Properties props, String key, String value) {
		if (value == null)
			return;
		if (value.trim().length() < 1)
			return;
		props.setProperty(key, value);
	}

	// Basic utility to encode form text - handle the "safe cases"
	public static String htmlspecialchars(String input) {
		if (input == null)
			return null;
		String retval = input.replace("&", "&amp;");
		retval = retval.replace("\"", "&quot;");
		retval = retval.replace("<", "&lt;");
		retval = retval.replace(">", "&gt;");
		retval = retval.replace(">", "&gt;");
		retval = retval.replace("=", "&#61;");
		return retval;
	}

	/**
	 * Simple utility method to help with the migration from Properties to
	 * Map<String, String>.
	 * 
	 * @param properties
	 * @return
	 */
	@SuppressWarnings("unchecked")
		public static Map<String, String> convertToMap(final Properties properties) {
			final Map<String, String> map = new HashMap(properties);
			return map;
		}

	/**
	 * Simple utility method to help with the migration from Map<String, String>
	 * to Properties.
	 * 
	 * @deprecated Should migrate to Map<String, String> signatures.
	 * @param map
	 * @return
	 */
	public static Properties convertToProperties(final Map<String, String> map) {
		final Properties properties = new Properties();
		if (map != null) {
			for (Entry<String, String> entry : map.entrySet()) {
				properties.setProperty(entry.getKey(), entry.getValue());
			}
		}
		return properties;
	}

	/**
	 * <p>
	 * Checks if a String is whitespace, empty ("") or null.
	 * </p>
	 * 
	 * <pre>
	 * StringUtils.isBlank(null)      = true
	 * StringUtils.isBlank("")        = true
	 * StringUtils.isBlank(" ")       = true
	 * StringUtils.isBlank("bob")     = false
	 * StringUtils.isBlank("  bob  ") = false
	 * </pre>
	 * 
	 * @param str
	 *          the String to check, may be null
	 * @return <code>true</code> if the String is null, empty or whitespace
	 * @since 2.0
	 */
	public static boolean isBlank(String str) {
		int strLen;
		if (str == null || (strLen = str.length()) == 0) {
			return true;
		}
		for (int i = 0; i < strLen; i++) {
			if ((Character.isWhitespace(str.charAt(i)) == false)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * <p>
	 * Checks if a String is not empty (""), not null and not whitespace only.
	 * </p>
	 * 
	 * <pre>
	 * StringUtils.isNotBlank(null)      = false
	 * StringUtils.isNotBlank("")        = false
	 * StringUtils.isNotBlank(" ")       = false
	 * StringUtils.isNotBlank("bob")     = true
	 * StringUtils.isNotBlank("  bob  ") = true
	 * </pre>
	 * 
	 * @param str
	 *          the String to check, may be null
	 * @return <code>true</code> if the String is not empty and not null and not
	 *         whitespace
	 * @since 2.0
	 */
	public static boolean isNotBlank(String str) {
		return !isBlank(str);
	}

	/**
	 * <p>
	 * Compares two Strings, returning <code>true</code> if they are equal.
	 * </p>
	 * 
	 * <p>
	 * <code>null</code>s are handled without exceptions. Two <code>null</code>
	 * references are considered to be equal. The comparison is case sensitive.
	 * </p>
	 * 
	 * <pre>
	 * StringUtils.equals(null, null)   = true
	 * StringUtils.equals(null, "abc")  = false
	 * StringUtils.equals("abc", null)  = false
	 * StringUtils.equals("abc", "abc") = true
	 * StringUtils.equals("abc", "ABC") = false
	 * </pre>
	 * 
	 * @see java.lang.String#equals(Object)
	 * @param str1
	 *          the first String, may be null
	 * @param str2
	 *          the second String, may be null
	 * @return <code>true</code> if the Strings are equal, case sensitive, or both
	 *         <code>null</code>
	 */
	public static boolean equals(String str1, String str2) {
		return str1 == null ? str2 == null : str1.equals(str2);
	}

	/**
	 * <p>
	 * Compares two Strings, returning <code>true</code> if they are equal
	 * ignoring the case.
	 * </p>
	 * 
	 * <p>
	 * <code>null</code>s are handled without exceptions. Two <code>null</code>
	 * references are considered equal. Comparison is case insensitive.
	 * </p>
	 * 
	 * <pre>
	 * StringUtils.equalsIgnoreCase(null, null)   = true
	 * StringUtils.equalsIgnoreCase(null, "abc")  = false
	 * StringUtils.equalsIgnoreCase("abc", null)  = false
	 * StringUtils.equalsIgnoreCase("abc", "abc") = true
	 * StringUtils.equalsIgnoreCase("abc", "ABC") = true
	 * </pre>
	 * 
	 * @see java.lang.String#equalsIgnoreCase(String)
	 * @param str1
	 *          the first String, may be null
	 * @param str2
	 *          the second String, may be null
	 * @return <code>true</code> if the Strings are equal, case insensitive, or
	 *         both <code>null</code>
	 */
	public static boolean equalsIgnoreCase(String str1, String str2) {
		return str1 == null ? str2 == null : str1.equalsIgnoreCase(str2);
	}
}
