<%/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="javax.xml.transform.dom.DOMSource"%>
<%@page import="javax.xml.transform.stream.StreamResult"%>
<%@page import="javax.xml.transform.OutputKeys"%>
<%@page import="javax.xml.transform.TransformerFactory"%>
<%@page import="javax.xml.transform.Transformer"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="com.sun.org.apache.xerces.internal.dom.ChildNode"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.NodeList"%>
<%@page import="java.util.*,java.io.*,java.net.*,javax.crypto.*,javax.xml.parsers.*,org.w3c.dom.Document,org.xml.sax.*" errorPage="error.jsp"%>

<%@ page import="org.apache.commons.codec.digest.*"%>
<%@ page import="java.io.*"%>
<%@ page import="java.nio.channels.FileChannel"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>
<%@ include file="bbb_api_conf.jsp"%> 

<%!//
// Create a meeting with specific 
//    - meetingID
//    - welcome message
//    - moderator password
//    - viewer password  
//    - voiceBridge
//    - logoutURL
//
// Added for 0.8
//
//    - metadata
//    - xml (for pre-upload of slides)
//
public String createMeeting(String meetingID, String welcome, String moderatorPassword, String moderatorWelcomeMsg, String viewerPassword, Integer voiceBridge, String logoutURL) {
	String base_url_create = BigBlueButtonURL + "api/create?";

	String welcome_param = "";
	String checksum = "";

	String attendee_password_param = "&attendeePW=ap";
	String moderator_password_param = "&moderatorPW=mp";
	String voice_bridge_param = "";
	String logoutURL_param = "";
	String moderatorWelcomeMsg_param = "";

	if ((welcome != null) && !welcome.equals("")) {
		welcome_param = "&welcome=" + urlEncode(welcome);
	}

	if ((moderatorPassword != null) && !moderatorPassword.equals("")) {
		moderator_password_param = "&moderatorPW=" + urlEncode(moderatorPassword);
	}

	if ((moderatorWelcomeMsg != null) && !moderatorWelcomeMsg.equals("")) {
		moderatorWelcomeMsg_param = "&moderatorOnlyMessage=" + urlEncode(moderatorWelcomeMsg);
	}

	if ((viewerPassword != null) && !viewerPassword.equals("")) {
		attendee_password_param = "&attendeePW=" + urlEncode(viewerPassword);
	}

	if ((voiceBridge != null) && voiceBridge > 0) {
		voice_bridge_param = "&voiceBridge=" + urlEncode(voiceBridge.toString());
	} else {
		// No voice bridge number passed, so we'll generate a random one for this meeting
		Random random = new Random();
		Integer n = 70000 + random.nextInt(9999);
		voice_bridge_param = "&voiceBridge=" + n;
	}

	if ((logoutURL != null) && !logoutURL.equals("")) {
		logoutURL_param = "&logoutURL=" + urlEncode(logoutURL);
	}

	//
	// Now create the URL
	//

	String create_parameters = "name=" + urlEncode(meetingID)
		+ "&meetingID=" + urlEncode(meetingID) + welcome_param
		+ attendee_password_param + moderator_password_param
		+ moderatorWelcomeMsg_param + voice_bridge_param + logoutURL_param;

	Document doc = null;

	try {
		// Attempt to create a meeting using meetingID
		String xml = getURL(base_url_create + create_parameters
			+ "&checksum="
			+ checksum("create" + create_parameters + salt));
		doc = parseXml(xml);
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent().trim().equals("SUCCESS")) {
		return meetingID;
	}

	return "Error "
		+ doc.getElementsByTagName("messageKey").item(0).getTextContent().trim()
		+ ": "
		+ doc.getElementsByTagName("message").item(0).getTextContent()
	.trim();
}

//
// getJoinMeetingURL() -- get join meeting URL for both viewer and moderator
//

public String getJoinMeetingURL(String username, String meetingID, String password, String clientURL) {
	return getJoinMeetingURL(username, meetingID, password, clientURL, false);
}

//
// getJoinMeetingURL() -- get join meeting URL for both viewer and moderator
//
public String getJoinMeetingURL(String username, String meetingID, String password, String clientURL, Boolean guest) {
	String base_url_join = BigBlueButtonURL + "api/join?";
        String clientURL_param = "";

	if ((clientURL != null) && !clientURL.equals("")) {
		clientURL_param = "&redirectClient=true&clientURL=" + urlEncode( clientURL );
	}


	String join_parameters = "meetingID=" + urlEncode(meetingID)
		+ "&fullName=" + urlEncode(username) + "&password="
		+ urlEncode(password) + "&guest=" + urlEncode(guest.toString()) +  clientURL_param;

	return base_url_join + join_parameters + "&checksum="
		+ checksum("join" + join_parameters + salt);
} 



	
// 
// Create a meeting and return a URL to join it as moderator.  This is used for the API demos.
//
// Passed
//	- username
//  - meetingID
//  - record ["true", "false"]
//  - welcome message (null causes BigBlueButton to use the default welcome message
//  - metadata (passed through when record="true"
//  - xml (used for pre-upload of slides)_
//
// Returned
//  - valid join URL using the username
//
//  Note this meeting will use username for meetingID

public String getJoinURL(String username, String meetingID, String record, String welcome, Map<String, String> metadata, String xml) {

	String base_url_create = BigBlueButtonURL + "api/create?";
	String base_url_join = BigBlueButtonURL + "api/join?";

	String welcome_param = "";
	if ((welcome != null) && !welcome.equals("")) {
		welcome_param = "&welcome=" + urlEncode(welcome);
	}

	String xml_param = "";
	if ((xml != null) && !xml.equals("")) {
		xml_param = xml;
	}
	
	Random random = new Random();
	String voiceBridge_param = "&voiceBridge=" + (70000 + random.nextInt(9999));
	
	//
	// When creating a meeting, the 'name' parameter is the name of the meeting (not to be confused with
	// the username).  For example, the name could be "Fred's meeting" and the meetingID could be "ID-1234312".
	//
	// While name and meetingID should be different, we'll keep them the same.  Why?  Because calling api/create? 
	// with a previously used meetingID will return same meetingToken (regardless if the meeting is running or not).
	//
	// This means the first person to call getJoinURL with meetingID="Demo Meeting" will actually create the
	// meeting.  Subsequent calls will return the same meetingToken and thus subsequent users will join the same
	// meeting.
	//
	// Note: We're hard-coding the password for moderator and attendee (viewer) for purposes of demo.
	//

	String create_parameters = "name=" + urlEncode(meetingID)
		+ "&meetingID=" + urlEncode(meetingID) + welcome_param + voiceBridge_param
		+ "&attendeePW=ap&moderatorPW=mp"
		+ "&isBreakoutRoom=false"
		+ "&record=" + record + getMetaData( metadata );


	// Attempt to create a meeting using meetingID
	Document doc = null;
	try {
		String url = base_url_create + create_parameters
			+ "&checksum="
			+ checksum("create" + create_parameters + salt); 
		doc = parseXml( postURL( url, xml_param ) );

	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {

		//
		// Looks good, now return a URL to join that meeting
		//  

		String join_parameters = "meetingID=" + urlEncode(meetingID)
			+ "&fullName=" + urlEncode(username) + "&password=mp";

		return base_url_join + join_parameters + "&checksum="
			+ checksum("join" + join_parameters + salt);
	}
	
	return doc.getElementsByTagName("messageKey").item(0).getTextContent()
		.trim()
		+ ": " 
		+ doc.getElementsByTagName("message").item(0).getTextContent()
		.trim();
}


/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
public String getJoinURLwithDynamicConfigXML(String username, String meetingID, String configXML) {
    
    String base_url_create = BigBlueButtonURL + "api/create?";
    String base_url_join = BigBlueButtonURL + "api/join?";
    String base_url_setConfigXML = BigBlueButtonURL + "api/setConfigXML.xml?";

    Random random = new Random();
    String voiceBridge_param = "&voiceBridge=" + (70000 + random.nextInt(9999));
    
    String url;
    //
    // When creating a meeting, the 'name' parameter is the name of the meeting (not to be confused with
    // the username).  For example, the name could be "Fred's meeting" and the meetingID could be "ID-1234312".
    //
    // While name and meetingID should be different, we'll keep them the same.  Why?  Because calling api/create? 
    // with a previously used meetingID will return same meetingToken (regardless if the meeting is running or not).
    //
    // This means the first person to call getJoinURL with meetingID="Demo Meeting" will actually create the
    // meeting.  Subsequent calls will return the same meetingToken and thus subsequent users will join the same
    // meeting.
    //
    // Note: We're hard-coding the password for moderator and attendee (viewer) for purposes of demo.
    //

    String create_parameters = "name=" + urlEncode(meetingID)
        + "&meetingID=" + urlEncode(meetingID) + voiceBridge_param
        + "&attendeePW=ap&moderatorPW=mp";


    // Attempt to create a meeting using meetingID
    Document doc = null;
    url = "";
    try {
        url = base_url_create + create_parameters
            + "&checksum="
            + checksum("create" + create_parameters + salt); 
        doc = parseXml( postURL( url, "" ) );
    } catch (Exception e) {
        e.printStackTrace();
    }

    if (!doc.getElementsByTagName("returncode").item(0).getTextContent().trim().equals("SUCCESS")) {
        //
        // Someting went wrong, return the error 
        //  
        return " " + url + "<br>" + doc.getElementsByTagName("messageKey").item(0).getTextContent()
                .trim()
                + ": " 
                + doc.getElementsByTagName("message").item(0).getTextContent()
                .trim();
    }

    
    //
    // Looks good, now Attempt to send the ConfigXML file and get the token 
    //  
    
    String xml_param = "";
    if ((configXML != null) && !configXML.equals("")) {
        xml_param = configXML;
        xml_param = xml_param.replace("\n", "");
        xml_param = xml_param.replace("\t", "");
        xml_param = xml_param.replace(">  <", "><");
        xml_param = xml_param.replace(">    <", "><");
    }

    // Create the parameters we want to send to the server. 
    Map<String, String[]> paramsMap = new HashMap<String, String[]>();
    paramsMap.put("meetingID", new String[]{urlEncode(meetingID)});
    paramsMap.put("configXML", new String[]{urlEncode(xml_param)});

    String baseString = createBaseString(paramsMap);

    String setConfigXML_parameters = baseString + "&checksum=" + checksum("setConfigXML" + baseString + salt);
    
    try {
        doc = parseXml( postURL( base_url_setConfigXML, setConfigXML_parameters, "application/x-www-form-urlencoded" ) );
    } catch (Exception e) {
        e.printStackTrace();
    }

    String configToken = "";
    if (!doc.getElementsByTagName("returncode").item(0).getTextContent().trim().equals("SUCCESS")) {
        //
        // Someting went wrong, return the error 
        //  
        return " " + base_url_setConfigXML + "<br>" + doc.getElementsByTagName("messageKey").item(0).getTextContent().trim()
                + ": " 
                + doc.getElementsByTagName("message").item(0).getTextContent().trim() + "<br>" + encodeURIComponent(xml_param);
    } else {
        configToken = doc.getElementsByTagName("configToken").item(0).getTextContent().trim();
    }
    
    //
    // And finally return a URL to join that meeting using the specific config.xml
    //  
    String join_parameters = "meetingID=" + urlEncode(meetingID) + "&fullName=" + urlEncode(username) + "&password=mp&configToken=" + configToken;

    return base_url_join + join_parameters + "&checksum=" + checksum("join" + join_parameters + salt);

}

// From the list of parameters we want to pass. Creates a base string with parameters
// sorted in alphabetical order for us to sign.
public String createBaseString(Map<String, String[]> params) {
	StringBuffer csbuf = new StringBuffer();
	SortedSet<String> keys = new TreeSet<String>(params.keySet());
 
	boolean first = true;
	String checksum = null;
	for (String key: keys) {
		for (String value: params.get(key)) {
			if (first) {
				first = false;
			} else {
				csbuf.append("&");
			}
			csbuf.append(key);
			csbuf.append("=");
			csbuf.append(value);
		}
	}

	return csbuf.toString();
}


//
// Create a meeting and return a URL to join it as moderator
//
public String getJoinURLXML(String username, String meetingID, String welcome, String xml) {
	String base_url_create = BigBlueButtonURL + "api/create?";
	String base_url_join = BigBlueButtonURL + "api/join?";

	String welcome_param = "";

	Random random = new Random();
	Integer voiceBridge = 70000 + random.nextInt(9999);

	if ((welcome != null) && !welcome.equals("")) {
		welcome_param = "&welcome=" + urlEncode(welcome);
	}

        String xml_param = "";
        if ((xml != null) && !xml.equals("")) {
                xml_param = xml;
        }

	String create_parameters = "name=" + urlEncode(meetingID)
		+ "&meetingID=" + urlEncode(meetingID) + welcome_param
		+ "&attendeePW=ap&moderatorPW=mp&voiceBridge=" + voiceBridge;

	Document doc = null;

	try {
		// Attempt to create a meeting using meetingID
		String params = postURL(base_url_create + create_parameters
			+ "&checksum="
			+ checksum("create" + create_parameters + salt), xml_param);
		doc = parseXml(params);
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {

		String join_parameters = "meetingID=" + urlEncode(meetingID)
			+ "&fullName=" + urlEncode(username) + "&password=mp";

		return base_url_join + join_parameters + "&checksum="
			+ checksum("join" + join_parameters + salt);
	}
	
	return doc.getElementsByTagName("messageKey").item(0).getTextContent()
	.trim()
	+ ": "
	+ doc.getElementsByTagName("message").item(0).getTextContent()
	.trim();
}

//
// getJoinURLViewer() -- Get the URL to join a meeting as viewer
//
public String getJoinURLViewer(String username, String meetingID) {
	String base_url_join = BigBlueButtonURL + "api/join?";
	String join_parameters = "meetingID=" + urlEncode(meetingID)
		+ "&fullName=" + urlEncode(username) + "&password=ap";

	return base_url_join + join_parameters + "&checksum="
		+ checksum("join" + join_parameters + salt);
}


//
// getURLisMeetingRunning() -- return a URL that the client can use to poll for whether the given meeting is running
//
public String getURLisMeetingRunning(String meetingID) {
	String meetingParameters = "meetingID=" + urlEncode(meetingID);
	return BigBlueButtonURL + "api/isMeetingRunning?" + meetingParameters
		+ "&checksum="
		+ checksum("isMeetingRunning" + meetingParameters + salt);	
}

//
// isMeetingRunning() -- check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
//
public String isMeetingRunning(String meetingID) {
	Document doc = null;
	try {
		doc = parseXml( getURL( getURLisMeetingRunning(meetingID) ));
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {
		return doc.getElementsByTagName("running").item(0).getTextContent()
		.trim();
	}

	return "Error "
		+ doc.getElementsByTagName("messageKey").item(0)
		.getTextContent().trim()
		+ ": "
		+ doc.getElementsByTagName("message").item(0).getTextContent()
		.trim();
}

public String getMeetingInfoURL(String meetingID, String password) {
	String meetingParameters = "meetingID=" + urlEncode(meetingID)
		+ "&password=" + password;
	return BigBlueButtonURL + "api/getMeetingInfo?" + meetingParameters
		+ "&checksum="
		+ checksum("getMeetingInfo" + meetingParameters + salt);
}

public String getMeetingInfo(String meetingID, String password) {
	try {
		return getURL( getMeetingInfoURL(meetingID, password));
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return null;
	}
}

public String getDefaultConfigXML() {
	try {
		 return getURL( getDefaultConfigXMLURL() );
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return null;
	}
}

public String getDefaultConfigXMLURL() {
	String meetingParameters = "";
	return BigBlueButtonURL + "api/getDefaultConfigXML?" + meetingParameters
		+ "&checksum="
		+ checksum("getDefaultConfigXML" + meetingParameters + salt);
}

public String getMeetingsURL() {
	String meetingParameters = "random=" + new Random().nextInt(9999);
	return BigBlueButtonURL + "api/getMeetings?" + meetingParameters
		+ "&checksum="
		+ checksum("getMeetings" + meetingParameters + salt);
}

//
// Calls getMeetings to obtain the list of meetings, then calls getMeetingInfo for each meeting
// and concatenates the result.
//
public String getMeetings() {
	try {
        Document doc = parseXml( getURL( getMeetingsURL() ));
		
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
			
			String data = getURL( getMeetingInfoURL(meetingID, password) );

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



public String getendMeetingURL(String meetingID, String moderatorPassword) {
	String end_parameters = "meetingID=" + urlEncode(meetingID) + "&password="
		+ urlEncode(moderatorPassword);
	return BigBlueButtonURL + "api/end?" + end_parameters + "&checksum="
		+ checksum("end" + end_parameters + salt);
}

public String endMeeting(String meetingID, String moderatorPassword) {

	Document doc = null;
	try {
		String xml = getURL(getendMeetingURL(meetingID, moderatorPassword));
		doc = parseXml(xml);
	} catch (Exception e) {
		e.printStackTrace();
	}

	if (doc.getElementsByTagName("returncode").item(0).getTextContent()
			.trim().equals("SUCCESS")) {
		return "true";
	}

	return "Error "
		+ doc.getElementsByTagName("messageKey").item(0)
		.getTextContent().trim()
		+ ": "
		+ doc.getElementsByTagName("message").item(0).getTextContent()
		.trim();
}


//////////////////////////////////////////////////////////////////////////////
//
// Added for BigBlueButton 0.8
//
//////////////////////////////////////////////////////////////////////////////

public String getRecordingsURL(String meetingID) {
	String record_parameters = "meetingID=" + urlEncode(meetingID);
	return BigBlueButtonURL + "api/getRecordings?" + record_parameters + "&checksum="
		+ checksum("getRecordings" + record_parameters + salt);
}

public String getRecordings(String meetingID) {
	//recordID,name,description,starttime,published,playback,length
	String newXMLdoc = "<recordings>";
	
	try {
		Document doc = null;
		String url = getRecordingsURL(meetingID); 
		doc = parseXml( getURL(url) );
		
		// if the request succeeded, then calculate the checksum of each meeting and insert it into the document
		NodeList recordingList = doc.getElementsByTagName("recording");
		
		
		for (int i = 0; i < recordingList.getLength(); i++) {
			Element recording = (Element) recordingList.item(i);
			
			if(recording.getElementsByTagName("recordID").getLength()>0){
			
				String recordID = recording.getElementsByTagName("recordID").item(0).getTextContent();
				String name = recording.getElementsByTagName("name").item(0).getTextContent();
				String description = "";
				NodeList metadata = recording.getElementsByTagName("metadata");
				if(metadata.getLength()>0){
					Element metadataElem = (Element) metadata.item(0);
					if(metadataElem.getElementsByTagName("description").getLength() > 0){
						description = metadataElem.getElementsByTagName("description").item(0).getTextContent();
					}
				}
				
				String starttime = recording.getElementsByTagName("startTime").item(0).getTextContent();
				try{
					SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
					Date resultdate = new Date(Long.parseLong(starttime));
					starttime = sdf.format(resultdate);
				}catch(Exception e){
					
				}
				String published = recording.getElementsByTagName("published").item(0).getTextContent();
				String playback = "";
				String length = "";
				NodeList formats = recording.getElementsByTagName("format");
				for (int j = 0; j < formats.getLength(); j++){
					Element format = (Element) formats.item(j);
					
					String typeP = format.getElementsByTagName("type").item(0).getTextContent();
					String urlP = format.getElementsByTagName("url").item(0).getTextContent();
					String lengthP = format.getElementsByTagName("length").item(0).getTextContent();
					
					if (j != 0){
						playback +=", ";
					} 
					playback += StringEscapeUtils.escapeXml("<a href='" + urlP + "' target='_blank'>" + typeP + "</a>");
					
					if(typeP.equalsIgnoreCase("slides") || typeP.equalsIgnoreCase("presentation")){
						length = lengthP;
					}
				}
				
				newXMLdoc += "<recording>";
				
				newXMLdoc += "<recordID>" + recordID + "</recordID>";
				newXMLdoc += "<name><![CDATA[" + name + "]]></name>";
				newXMLdoc += "<description><![CDATA[" + description + "]]></description>";
				newXMLdoc += "<startTime>" + starttime + "</startTime>";
				newXMLdoc += "<published>" + published + "</published>";
				newXMLdoc += "<playback>" + playback + "</playback>";
				newXMLdoc += "<length>" + length + "</length>";
				
				newXMLdoc += "</recording>";
			}
		}
	}catch (Exception e) {
		e.printStackTrace(System.out);
		return "error: "+e.getMessage();
	}
	newXMLdoc += "</recordings>";
	return newXMLdoc;
}

public String getPublishRecordingsURL(boolean publish, String recordID) {
	String publish_parameters = "recordID=" + urlEncode(recordID)
		+ "&publish=" + publish;
	return BigBlueButtonURL + "api/publishRecordings?" + publish_parameters + "&checksum="
		+ checksum("publishRecordings" + publish_parameters + salt);
}

public String setPublishRecordings(boolean publish, String recordID){
	try {
		return getURL( getPublishRecordingsURL(publish,recordID));
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return null;
	}
}

public String getDeleteRecordingsURL(String recordID) {
	String delete_parameters = "recordID=" + urlEncode(recordID);
	return BigBlueButtonURL + "api/deleteRecordings?" + delete_parameters + "&checksum="
		+ checksum("deleteRecordings" + delete_parameters + salt);
}

public String deleteRecordings(String recordID){
	try {
		return getURL( getDeleteRecordingsURL(recordID));
	} catch (Exception e) {
		e.printStackTrace(System.out);
		return null;
	}
}



//////////////////////////////////////////////////////////////////////////////
//
// Helper Routines
//
//////////////////////////////////////////////////////////////////////////////

public String getMetaData( Map<String, String> metadata ) {
	String metadata_params = "";
	
	if ( metadata!=null ){
		for(String metakey : metadata.keySet()){
			metadata_params = metadata_params + "&meta_" + urlEncode(metakey) + "=" + urlEncode(metadata.get(metakey));
		}
	}
	
	return metadata_params;
}

//
// checksum() -- Return a checksum based on SHA-1 digest
//
public static String checksum(String s) {
	String checksum = "";
	try {
		checksum = org.apache.commons.codec.digest.DigestUtils.sha256Hex(s);
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
		HttpURLConnection httpConnection = (HttpURLConnection) u.openConnection();

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

public static String postURL(String targetURL, String urlParameters)
{
	return postURL(targetURL, urlParameters, "text/xml");
}

public static String postURL(String targetURL, String urlParameters, String contentType)
{
	URL url;
	HttpURLConnection connection = null;  
	int responseCode = 0;
	try {
		//Create connection
		url = new URL(targetURL);
		connection = (HttpURLConnection)url.openConnection();
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", contentType);
		
		connection.setRequestProperty("Content-Length", "" + 
		Integer.toString(urlParameters.getBytes().length));
		connection.setRequestProperty("Content-Language", "en-US");  
		
		connection.setUseCaches (false);
		connection.setDoInput(true);
		connection.setDoOutput(true);

		//Send request
		DataOutputStream wr = new DataOutputStream (
		connection.getOutputStream ());
		wr.writeBytes (urlParameters);
		wr.flush ();
		wr.close ();

		//Get Response	
		InputStream is = connection.getInputStream();
		BufferedReader rd = new BufferedReader(new InputStreamReader(is));
		String line;
		StringBuffer response = new StringBuffer(); 
		while((line = rd.readLine()) != null) {
			response.append(line);
			response.append('\r');
		}
		rd.close();
		return response.toString();
		
	} catch (Exception e) {
		
		e.printStackTrace();
		return null;
		
	} finally {
		
		if(connection != null) {
			connection.disconnect(); 
		}
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

//
//encodeURIComponent() -- Java encoding similiar to JavaScript encodeURIComponent
//
public static String encodeURIComponent(String component)   {     
	String result = null;      
	
	try {       
		result = URLEncoder.encode(component, "UTF-8")   
			   .replaceAll("\\%28", "(")                          
			   .replaceAll("\\%29", ")")   		
			   .replaceAll("\\+", "%20")                          
			   .replaceAll("\\%27", "'")   			   
			   .replaceAll("\\%21", "!")
			   .replaceAll("\\%7E", "~");     
	} catch (UnsupportedEncodingException e) {       
		result = component;     
	}      
	
	return result;   
}  

public String getMeetingsWithoutPasswords() {
	try {
        Document doc = parseXml( getURL( getMeetingsURL() ));
		
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
			
			String data = getURL( getMeetingInfoURL(meetingID, password) );

			if (data.indexOf("<response>") != -1) {
				data = removeTag(data, "<attendeePW>", "</attendeePW>");
				data = removeTag(data, "<moderatorPW>", "</moderatorPW>"); 
				
				int startIndex = data.indexOf(startResponse) + startResponse.length();
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

public static String removeTag(String data, String startTag, String endTag){
	int startIndex = data.indexOf(startTag);
	int endIndex = data.indexOf(endTag) + endTag.length();
	String tagStr = data.substring(startIndex, endIndex);
	return data.replace(tagStr,"");
}

public String getBigBlueButtonIP()
{
    try {
        URL url = new URL(BigBlueButtonURL);
        String bbbIP = url.getHost();
        return bbbIP;
    } catch (Exception e) {
        e.printStackTrace();
        return "localhost";
    }
}

public static Element getElementWithAttribute(Node root, String attrName, String attrValue)
{
      NodeList nl = root.getChildNodes();
      for (int i = 0; i < nl.getLength(); i++) {
          Node n = nl.item(i);
          if (n instanceof Element) {
              Element el = (Element) n;
              if (el.getAttribute(attrName).equals(attrValue)) {
                  return el;
              }else{
         el =  getElementWithAttribute(n, attrName, attrValue); //search recursively
         if(el != null){
          return el;
         }
      }
          }
      }
      return null;
}

%>
