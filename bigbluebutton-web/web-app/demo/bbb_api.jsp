<% 
/*
	BigBlueButton - http://www.bigbluebutton.org
	
	Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
	
	BigBlueButton is free software; you can redistribute it and/or modify it under the 
	terms of the GNU Lesser General Public License as published by the Free Software 
	Foundation; either version 3 of the License, or (at your option) any later 
	version. 
	
	BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
	WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
	PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
	
	You should have received a copy of the GNU Lesser General Public License along 
	with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
	
	Author: Fred Dixon <ffdixon@bigbluebutton.org>
*/
%>
<%@page import="javax.xml.transform.dom.DOMSource"%>
<%@page import="javax.xml.transform.stream.StreamResult"%>
<%@page import="javax.xml.transform.OutputKeys"%>
<%@page import="javax.xml.transform.TransformerFactory"%>
<%@page import="javax.xml.transform.Transformer"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="com.sun.org.apache.xerces.internal.dom.ChildNode"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.NodeList"%>

<%@ page
	import="java.util.*,java.io.*,java.net.*,javax.crypto.*,javax.xml.parsers.*,org.w3c.dom.Document,org.xml.sax.*"
	errorPage="error.jsp" %>

<%@ page import="org.apache.commons.codec.digest.*"%>
<%@ include file="bbb_api_conf.jsp"%>

<%!

//
// Create a meeting with specific 
//    - meetingID
//    - welcome message
//    - moderator password
//    - viewer password
//    - voiceBridge
//    - logoutURL
//
public String createMeeting(String meetingID, String welcome, String moderatorPassword, String viewerPassword, Integer voiceBridge, String logoutURL) {
	String base_url_create = BigBlueButtonURL + "api/create?";
	String base_url_join = BigBlueButtonURL + "api/join?";
	
	String welcome_param = "";
	String checksum = "";
	
	String attendee_password_param = "&attendeePW=ap";
	String moderator_password_param = "&moderatorPW=mp";
	String voice_bridge_param = "";
	String logoutURL_param = "";
	
	if ( (welcome != null) && ! welcome.equals("")) {
		welcome_param = "&welcome=" + urlEncode(welcome);
	}
	
	if ( (moderatorPassword != null) && ! moderatorPassword.equals("")) {
		moderator_password_param = "&moderatorPW=" + urlEncode(moderatorPassword);
	} 
	
	if ( (viewerPassword != null) && ! viewerPassword.equals("")) {
		attendee_password_param = "&attendeePW=" + urlEncode(viewerPassword);
	}
	
	if ( (voiceBridge != null) && voiceBridge > 0 ) {
		voice_bridge_param = "&voiceBridge=" + urlEncode(voiceBridge.toString());
	} else {
		// No voice bridge number passed, so we'll generate a random one for this meeting
		Random random = new Random();
		Integer n = 70000 + random.nextInt(9999);	
		voice_bridge_param = "&voiceBridge=" + n;
	}	

	if ( (logoutURL != null) && ! logoutURL.equals("")) {
		logoutURL_param = "&logoutURL=" + urlEncode(logoutURL);
	}
	
	//
	// Now create the URL
	//

	String create_parameters = "name=" + urlEncode(meetingID) + "&meetingID=" + urlEncode(meetingID)
	+ welcome_param + attendee_password_param + moderator_password_param + voice_bridge_param + logoutURL_param;

	Document doc = null;

	try {
		// Attempt to create a meeting using meetingID
		String xml = getURL(base_url_create + create_parameters + "&checksum=" + checksum("create" + create_parameters + salt) );
		doc = parseXml(xml);		
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {

			
		return meetingID;
	}
	
	return "Error " + doc.getElementsByTagName("messageKey").item(0).getTextContent().trim() 
	+ ": " + doc.getElementsByTagName("message").item(0).getTextContent().trim();
}



//
// getJoinMeetingURL() -- get join meeting URL for both viewer and moderator
//
public String getJoinMeetingURL(String username, String meetingID, String password) {
	String base_url_join = BigBlueButtonURL + "api/join?";
	String join_parameters = "meetingID=" + urlEncode(meetingID) + "&fullName=" + urlEncode(username)
	+ "&password=" + urlEncode(password);

	return base_url_join + join_parameters + "&checksum=" + checksum("join" + join_parameters + salt);
}



// 
// Create a meeting and return a URL to join it as moderator
//
public String getJoinURL(String username, String meetingID, String welcome) {
	String base_url_create = BigBlueButtonURL + "api/create?";
	String base_url_join = BigBlueButtonURL + "api/join?";
	
	String welcome_param = "";
	
	Random random = new Random();
	Integer voiceBridge = 70000 + random.nextInt(9999);
	
	if ( (welcome != null) && ! welcome.equals("")) {
		welcome_param = "&welcome=" + urlEncode(welcome);
	}
	
	//
	// When creating a meeting, the 'name' parameter is the name of the meeting (not to be confused with
	// the username).  For example, the name could be "Fred's meeting" and the meetingID could be "ID-1234312".
	//
	// While name and meetinID could be different, we'll keep them the same.  Why?  Because calling api/create? 
	// with a previously used meetingID will return same meetingToken (regardless if the meeting is running or not).
	//
	// This means the first person to call getJoinURL with meetingID="Demo Meeting" will actually create the
	// meeting.  Subsequent calls will return the same meetingToken and thus subsequent users will join the same
	// meeting.
	//
	// Note: We're hard-coding the password for moderator and attendee (viewer) for purposes of demo.
	//

	String create_parameters = "name=" + urlEncode(meetingID) + "&meetingID=" + urlEncode(meetingID)
	+ welcome_param + "&attendeePW=ap&moderatorPW=mp&voiceBridge="+voiceBridge;

	Document doc = null;

	try {
		// Attempt to create a meeting using meetingID
		String xml = getURL(base_url_create + create_parameters + "&checksum=" + checksum("create" + create_parameters + salt) );
		doc = parseXml(xml);		
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {

		
		//
		// Now create a URL to join that meeting
		//
		
		String join_parameters = "meetingID=" + urlEncode(meetingID) + "&fullName=" + urlEncode(username)
		+ "&password=mp";

		return base_url_join + join_parameters + "&checksum=" + checksum("join" + join_parameters + salt);

	}
	return doc.getElementsByTagName("messageKey").item(0).getTextContent().trim() 
	+ ": " + doc.getElementsByTagName("message").item(0).getTextContent().trim();
}


//
// getJoinURLViewer() -- Get the URL to join a meeting as viewer
//
public String getJoinURLViewer(String username, String meetingID) {

	String base_url_join = BigBlueButtonURL + "api/join?";
	String join_parameters = "meetingID=" + urlEncode(meetingID) + "&fullName=" + urlEncode(username)
	+ "&password=ap";

	return base_url_join + join_parameters + "&checksum=" + checksum("join" + join_parameters + salt);
}

//
// checksum() -- create a hash based on the shared salt (located in bbb_api_conf.jsp)
//
public static String checksum(String s) {
	String checksum = "";
	try {
		checksum = org.apache.commons.codec.digest.DigestUtils.shaHex(s);
	} catch (Exception e) {
		e.printStackTrace();
	}
	return checksum;
}

//
// getURL() -- fetch a URL and return its contents as a String
//
public static String getURL(String url) {
	StringBuffer response = null;

	try {
		URL u = new URL(url);
		HttpURLConnection httpConnection = (HttpURLConnection) u
				.openConnection();

		httpConnection.setUseCaches(false);
		httpConnection.setDoOutput(true);
		httpConnection.setRequestMethod("GET");

		httpConnection.connect();
		int responseCode = httpConnection.getResponseCode();
		if (responseCode == HttpURLConnection.HTTP_OK) {
			InputStream input = httpConnection.getInputStream();

			// Read server's response.
			response = new StringBuffer();
			Reader reader = new InputStreamReader(input, "UTF-8");
			reader = new BufferedReader(reader);
			char[] buffer = new char[1024];
			for (int n = 0; n >= 0;) {
				n = reader.read(buffer, 0, buffer.length);
				if (n > 0)
					response.append(buffer, 0, n);
			}

			input.close();
			httpConnection.disconnect();
		}
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (response != null) {
		return response.toString();
	} else {
		return "";
	}
}

//
// getURLisMeetingRunning() -- return a URL that the client can use to poll for whether the given meeting is running
//
public String getURLisMeetingRunning(String meetingID) {
	String base_main = "&meetingID=" + urlEncode(meetingID);
	String base_url = BigBlueButtonURL + "api/isMeetingRunning?";
	String checksum ="";
	
	try {
		checksum = DigestUtils.shaHex("isMeetingRunning" + base_main + salt);
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	
	return base_url + base_main + "&checksum=" + checksum;
}

//
// isMeetingRunning() -- check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
//
public String isMeetingRunning(String meetingID) {
	String base_main = "&meetingID=" + urlEncode(meetingID);
	String base_url = BigBlueButtonURL + "api/isMeetingRunning?";
	String checksum ="";
	
	try {
		checksum = DigestUtils.shaHex("isMeetingRunning" + base_main + salt);
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	
	String xml = getURL(base_url + base_main + "&checksum=" + checksum);

	Document doc = null;
	try {
		doc = parseXml(xml);
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {
		return doc.getElementsByTagName("running").item(0).getTextContent().trim();
	}
	
	return  "false";
	
}

public String getMeetingInfoURL(String meetingID, String password) {
	String meetingParameters = "meetingID=" + urlEncode(meetingID) + "&password=" + password;
	return BigBlueButtonURL + "api/getMeetingInfo?" + meetingParameters + "&checksum=" + checksum("getMeetingInfo" + meetingParameters + salt);
}

public String getMeetingInfo(String meetingID, String password) {
	try {
		URLConnection hpCon = new URL(getMeetingInfoURL(meetingID, password)).openConnection();

		InputStreamReader isr = new InputStreamReader(hpCon.getInputStream());
		BufferedReader br = new BufferedReader(isr);
		String data = br.readLine();
		return data;
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return "";
	}
}

public String getMeetingsURL() {
	String meetingParameters = "random=" + new Random().nextInt(9999);
	return BigBlueButtonURL + "api/getMeetings?" + meetingParameters + "&checksum=" + checksum("getMeetings" + meetingParameters + salt);
}

//
// Calls getMeetings to obtain the list of meetings, then calls getMeetingInfo for each meeting
// and concatenates the result.
//
public String getMeetings() {
	try {
		
		// Call the API and get the result
		URLConnection hpCon = new URL(getMeetingsURL()).openConnection();
		InputStreamReader isr = new InputStreamReader(hpCon.getInputStream());
		BufferedReader br = new BufferedReader(isr);
		String data = br.readLine();
		Document doc = parseXml(data);
		
		// tags needed for parsing xml documents
		final String startTag = "<meetings>";
		final String endTag = "</meetings>";
		final String startResponse = "<response>";
		final String endResponse = "</response>";
		
		// if the request succeeded, then calculate the checksum of each meeting and insert it into the document
		NodeList meetingsList = doc.getElementsByTagName("meeting");
		
		String newXMldocument = startTag;
		for (int i = 0; i < meetingsList.getLength(); i++) {
			Element meeting = (Element) meetingsList.item(i);
			String meetingID = meeting.getElementsByTagName("meetingID").item(0).getTextContent();
			String password = meeting.getElementsByTagName("moderatorPW").item(0).getTextContent();
			
			data = getMeetingInfo(meetingID, password);
			
			if (data.indexOf("<response>") != -1) {
				int startIndex = data.indexOf(startResponse) + startTag.length();
				int endIndex = data.indexOf(endResponse);
				newXMldocument +=  "<meeting>" + data.substring(startIndex, endIndex) + "</meeting>";
			}
		}
		newXMldocument += endTag;

		return newXMldocument;
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return null;
	}
}

//
// parseXml() -- return a DOM of the XML
//
public static Document parseXml(String xml)
		throws ParserConfigurationException, IOException, SAXException {
	DocumentBuilderFactory docFactory = DocumentBuilderFactory
			.newInstance();
	DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
	Document doc = docBuilder.parse(new InputSource(new StringReader(xml)));
	return doc;
}

//
// urlEncode() -- URL encode the string
//
public static String urlEncode(String s) {	
	try {
		return URLEncoder.encode(s, "UTF-8");
	} catch (Exception e) {
		e.printStackTrace();
	}
	return "";
}
%>
