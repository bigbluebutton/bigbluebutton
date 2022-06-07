package org.imsglobal.json;

import java.io.Reader;
import java.io.ByteArrayInputStream;

import java.net.URLDecoder;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Iterator;
import java.util.ArrayList;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Logger;

import java.lang.IllegalArgumentException;

import javax.servlet.http.HttpServletRequest;

import net.oauth.OAuth;
import net.oauth.OAuthMessage;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthAccessor;
import net.oauth.OAuthValidator;
import net.oauth.SimpleOAuthValidator;
import net.oauth.signature.OAuthSignatureMethod;
import net.oauth.server.HttpRequestMessage;
import net.oauth.server.OAuthServlet;
import net.oauth.signature.OAuthSignatureMethod;
import org.imsglobal.basiclti.Base64;

import java.security.MessageDigest;

import org.apache.commons.lang.StringEscapeUtils;

public class IMSJSONRequest {

	private final static Logger Log = Logger.getLogger(IMSJSONRequest.class .getName());

    public final static String STATUS = "status";
    public final static String STATUS_CODE = "code";
    public final static String STATUS_DESCRIPTION = "description";

	public final static String CODE_MAJOR_SUCCESS = "success";
	public final static String CODE_MAJOR_FAILURE = "failure";
	public final static String CODE_MAJOR_UNSUPPORTED = "unsupported";

	public String postBody = null;
	private String header = null;
	private String oauth_body_hash = null;
	private String oauth_consumer_key = null;

	public boolean valid = false;
	public String errorMessage = null;
	public String base_string = null;

	public String getOAuthConsumerKey()
	{
		return oauth_consumer_key;
	}

	public String getPostBody()
	{
		return postBody;
	}

	// Normal Constructor
	public IMSJSONRequest(String oauth_consumer_key, String oauth_secret, HttpServletRequest request) 
	{
		loadFromRequest(request);
		if ( ! valid ) return;
		validateRequest(oauth_consumer_key, oauth_secret, request);
	}

	// Constructor for delayed validation
	public IMSJSONRequest(HttpServletRequest request) 
	{
		loadFromRequest(request);
	}

	// Constructor for testing...
	public IMSJSONRequest(String bodyString)
	{
		postBody = bodyString;
	}

	// Load but do not check the authentication
	public void loadFromRequest(HttpServletRequest request) 
	{
		String contentType = request.getContentType();
		if ( ! "application/json".equals(contentType) ) {
			errorMessage = "Content Type must be application/json";
			Log.info(errorMessage+"\n"+contentType);
			return;
		}

		header = request.getHeader("Authorization");
		System.out.println("Header: "+header);
		oauth_body_hash = null;
		if ( header != null ) {
			if (header.startsWith("OAuth ")) header = header.substring(5);
			String [] parms = header.split(",");
			for ( String parm : parms ) {
				parm = parm.trim();
				if ( parm.startsWith("oauth_body_hash=") ) {
					String [] pieces = parm.split("\"");
					oauth_body_hash = URLDecoder.decode(pieces[1]);
				}
				if ( parm.startsWith("oauth_consumer_key=") ) {
					String [] pieces = parm.split("\"");
					oauth_consumer_key = URLDecoder.decode(pieces[1]);
				}
			}
		}		

		if ( oauth_body_hash == null ) {
			errorMessage = "Did not find oauth_body_hash";
			Log.info(errorMessage+"\n"+header);
			return;
		}

		System.out.println("OBH="+oauth_body_hash);
		final char[] buffer = new char[0x10000];
		try {
			StringBuilder out = new StringBuilder();
			Reader in = request.getReader();
			int read;
			do {
				read = in.read(buffer, 0, buffer.length);
				if (read>0) {
					out.append(buffer, 0, read);
				}
			} while (read>=0);
			postBody = out.toString();
		} catch(Exception e) {
			errorMessage = "Could not read message body:"+e.getMessage();
			return;
		}

		try {
			MessageDigest md = MessageDigest.getInstance("SHA1");
			md.update(postBody.getBytes()); 
			byte[] output = Base64.encode(md.digest());
			String hash = new String(output);
			System.out.println("HASH="+hash);
			if ( ! hash.equals(oauth_body_hash) ) {
				errorMessage = "Body hash does not match header";
				return;
			}
		} catch (Exception e) {
			errorMessage = "Could not compute body hash";
			return;
		}
		valid = true;  // So far we are valid
	}

	// Assumes data is all loaded
	public void validateRequest(String oauth_consumer_key, String oauth_secret, HttpServletRequest request) 
	{
		valid = false;
		OAuthMessage oam = OAuthServlet.getMessage(request, null);
		OAuthValidator oav = new SimpleOAuthValidator();
		OAuthConsumer cons = new OAuthConsumer("about:blank#OAuth+CallBack+NotUsed", 
				oauth_consumer_key, oauth_secret, null);

		OAuthAccessor acc = new OAuthAccessor(cons);

		try {
			base_string = OAuthSignatureMethod.getBaseString(oam);
		} catch (Exception e) {
			base_string = null;
		}

		try {
			oav.validateMessage(oam,acc);
		} catch(Exception e) {
			errorMessage = "Launch fails OAuth validation: "+e.getMessage();
			return;
		}
		valid = true;
	}

	public boolean inArray(final String [] theArray, final String theString)
	{
		if ( theString == null ) return false;
		for ( String str : theArray ) {
			if ( theString.equals(str) ) return true;
		}
		return false;
	}

	public static Map getStatusUnsupported(String desc)
	{
		return getStatus(desc, CODE_MAJOR_UNSUPPORTED);
	}

	public static Map getStatusFailure(String desc)
	{
		return getStatus(desc, CODE_MAJOR_FAILURE);
	}

	public static Map getStatusSuccess(String desc)
	{
		return getStatus(desc, CODE_MAJOR_SUCCESS);
	}

	public static Map getStatus(String description, String major)
	{
		Map retval = new LinkedHashMap();
		retval.put(STATUS_CODE,major);
		retval.put(STATUS_DESCRIPTION,description);
		return retval;
	}

	/** Unit Tests */
	static final String inputTestData = "<?xml version = \"1.0\" encoding = \"UTF-8\"?>\n" +  
		"<imsx_POXEnvelopeRequest xmlns = \"http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0\">\n" + 
		"<imsx_POXHeader>\n" + 
		"<imsx_POXRequestHeaderInfo>\n" + 
		"<imsx_version>V1.0</imsx_version>\n" + 
		"<imsx_messageIdentifier>999999123</imsx_messageIdentifier>\n" + 
		"</imsx_POXRequestHeaderInfo>\n" + 
		"</imsx_POXHeader>\n" + 
		"<imsx_POXBody>\n" + 
		"<replaceResultRequest>\n" + 
		"<resultRecord>\n" + 
		"<sourcedGUID>\n" + 
		"<sourcedId>3124567</sourcedId>\n" + 
		"</sourcedGUID>\n" + 
		"<result>\n" + 
		"<resultScore>\n" + 
		"<language>en-us</language>\n" + 
		"<textString>A</textString>\n" + 
		"</resultScore>\n" + 
		"</result>\n" + 
		"</resultRecord>\n" + 
		"</replaceResultRequest>\n" + 
		"</imsx_POXBody>\n" + 
		"</imsx_POXEnvelopeRequest>";

	public static void runTest() {
/*
		System.out.println("Runnig test.");
		IMSJSONRequest pox = new IMSJSONRequest(inputTestData);
		System.out.println("Version = "+pox.getHeaderVersion());
		System.out.println("Operation = "+pox.getOperation());
		Map<String,String> bodyMap = pox.getBodyMap();
		String guid = bodyMap.get("/resultRecord/sourcedGUID/sourcedId");
		System.out.println("guid="+guid);
		String grade = bodyMap.get("/resultRecord/result/resultScore/textString");
		System.out.println("grade="+grade);

		String desc = "Message received and validated operation="+pox.getOperation()+
			" guid="+guid+" grade="+grade;

		String output = pox.getResponseUnsupported(desc);
		System.out.println("---- Unsupported ----");
		System.out.println(output);

		Properties props = new Properties();
		props.setProperty("fred","zap");
		props.setProperty("sam",IMSPOXRequest.MINOR_IDALLOC);
		System.out.println("---- Generate Log Error ----");
		output = pox.getResponseFailure(desc,props);
		System.out.println("---- Failure ----");
		System.out.println(output);



		Map<String, Object> theMap = new TreeMap<String, Object> ();
		theMap.put("/readMembershipResponse/membershipRecord/sourcedId", "123course456");

		List<Map<String,String>> lm = new ArrayList<Map<String,String>>();
		Map<String,String> mm = new TreeMap<String,String>();
		mm.put("/personSourcedId","123user456");
		mm.put("/role/roleType","Learner");
		lm.add(mm);

		mm = new TreeMap<String,String>();
		mm.put("/personSourcedId","789user123");
		mm.put("/role/roleType","Instructor");
		lm.add(mm);
		theMap.put("/readMembershipResponse/membershipRecord/membership/member", lm);

		String theXml = XMLMap.getXMLFragment(theMap, true);
		// System.out.println("th="+theXml);
		output = pox.getResponseSuccess(desc,theXml);
		System.out.println("---- Success String ----");
		System.out.println(output);
*/
	}

	/*

roleType:
Learner
Instructor
ContentDeveloper
Member
Manager
Mentor
Administrator
TeachingAssistant

fieldType:
Boolean
Integer
Real
String

<readMembershipResponse
xmlns="http://www.imsglobal.org/services/lis/mms2p0/wsdl11/sync/imsmms_v2p0">
<membershipRecord>
<sourcedId>GUID.TYPE</sourcedId>
<membership>
<collectionSourcedId>GUID.TYPE</collectionSourcedId>
<membershipIdType>MEMBERSHIPIDTYPE.TYPE</membershipIdType>
<member>
<personSourcedId>GUID.TYPE</personSourcedId>
<role>
<roleType>STRING</roleType>
<subRole>STRING</subRole>
<timeFrame>
<begin>DATETIME</begin>
<end>DATETIME</end>
<restrict>BOOLEAN</restrict>
<adminPeriod>
<language>LANGUAGESET.TYPE</language>
<textString>STRING</textString>
</adminPeriod>
</timeFrame>
<status>STATUS.TYPE</status>
<dateTime>DATETIME</dateTime>
<dataSource>GUID.TYPE</dataSource>
<recordInfo>
<extensionField>
<fieldName>STRING</fieldName>
<fieldType>FIELDTYPE.TYPE</fieldType>
<fieldValue>STRING</fieldValue>
</extensionField>
</recordInfo>
<extension>
<extensionField>
<fieldName>STRING</fieldName>
<fieldType>FIELDTYPE.TYPE</fieldType>
<fieldValue>STRING</fieldValue>
</extensionField>
</extension>
</role>
</member>
<creditHours>INTEGER</creditHours>
<dataSource>GUID.TYPE</dataSource>
</membership>
</membershipRecord>
</readMembershipResponse>
	 */
}
