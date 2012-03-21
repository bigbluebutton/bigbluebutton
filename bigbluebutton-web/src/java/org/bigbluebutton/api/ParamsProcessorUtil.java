package org.bigbluebutton.api;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.bigbluebutton.api.domain.Meeting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ParamsProcessorUtil {
	private static Logger log = LoggerFactory.getLogger(ParamsProcessorUtil.class);
	
	private final String URLDECODER_SEPARATOR=",";
	
	private String apiVersion;
	private boolean serviceEnabled = false;
	private String securitySalt;
	private int defaultMaxUsers = 20;
	private String defaultWelcomeMessage;
	private String defaultDialAccessNumber;
	private String testVoiceBridge;
	private String testConferenceMock;
	private String defaultLogoutUrl;
	private String defaultServerUrl;
	private int defaultNumDigitsForTelVoice;
	private String defaultClientUrl;
	private int defaultMeetingDuration;

	private String substituteKeywords(String message, String dialNumber, String telVoice, String meetingName) {
	    String welcomeMessage = message;
	    
	    String DIAL_NUM = "%%DIALNUM%%";
	    String CONF_NUM = "%%CONFNUM%%";
	    String CONF_NAME = "%%CONFNAME%%"; 
	    ArrayList<String> keywordList = new ArrayList<String>();
	    keywordList.add(DIAL_NUM);keywordList.add(CONF_NUM);keywordList.add(CONF_NAME);

	    Iterator<String> itr = keywordList.iterator();
	    while(itr.hasNext()) {
	    	String keyword = (String) itr.next();
	    	if (keyword.equals(DIAL_NUM)) {
	          welcomeMessage = welcomeMessage.replaceAll(DIAL_NUM, dialNumber);
	    	} else if (keyword.equals(CONF_NUM)) {
	          welcomeMessage = welcomeMessage.replaceAll(CONF_NUM, telVoice);
	    	} else if (keyword.equals(CONF_NAME)) {
	          welcomeMessage = welcomeMessage.replaceAll(CONF_NAME, meetingName);
	    	}     
	    }	
	    return  welcomeMessage;		
	}

	
	public void processRequiredCreateParams(Map<String, String> params, ApiErrors errors) {
	    // Do we have a checksum? If not, complain.
	    if (StringUtils.isEmpty(params.get("checksum"))) {
	      errors.missingParamError("checksum");
	    }
/*	    
	    // Do we have a meeting name? If not, complain.
	    String meetingName = params.get("name");
	    if (StringUtils.isEmpty(meetingName) ) {
	      errors.missingParamError("name");
	    }
*/	    
	    // Do we have a meeting id? If not, complain.
	    String externalMeetingId = params.get("meetingID");
	    if (StringUtils.isEmpty(externalMeetingId)) {
	      errors.missingParamError("meetingID");
	    }
	}

	public void updateMeeting(Map<String, Object> updateParams, Meeting existing) {
		// TODO: Assign new values to meeting.
/*	    
	    String meetingName = (String) updateParams.get("name");
	    if (meetingName != null) {
	    	existing.setM("name", meetingName);
	    }
	    	    
	    String viewerPass = params.get("attendeePW");
	    if (! StringUtils.isEmpty(viewerPass) ) {
	    	newParams.put("attendeePW", viewerPass);
	    }
	    
	    String modPass = params.get("moderatorPW"); 
	    if (! StringUtils.isEmpty(modPass) ) {
	    	newParams.put("moderatorPW", modPass);
	    }
	    
	    String telVoice = params.get("voiceBridge");
	    if (! StringUtils.isEmpty(telVoice) ) {
	    	newParams.put("voiceBridge", telVoice);
	    }	    
	    
	    String webVoice = params.get("webVoice");
	    if (! StringUtils.isEmpty(webVoice)) {
	    	newParams.put("webVoice", webVoice);
	    }
	    
	    String dialNumber = params.get("dialNumber");
	    if (! StringUtils.isEmpty(dialNumber)) {
	    	newParams.put("dialNumber", dialNumber);
	    }	    
	    
	    String logoutUrl = params.get("logoutURL"); 
	    if (! StringUtils.isEmpty(logoutUrl)) {
	    	newParams.put("logoutURL", logoutUrl);
	    }	
	    
	    String record = params.get("record");
	    if (! StringUtils.isEmpty(record)) {
	    	newParams.put("record", record);
	    }	
	    
	    String maxUsers = params.get("maxParticipants");
	    if (! StringUtils.isEmpty(maxUsers)) {
	    	newParams.put("maxParticipants", maxUsers);
	    }	
	    
	    String meetingDuration = params.get("duration");
	    if (! StringUtils.isEmpty(meetingDuration)) {
	    	newParams.put("duration", meetingDuration);
	    }
	    
	    String welcomeMessage = params.get("welcome");
	    if (! StringUtils.isEmpty(welcomeMessage)) {
	    	newParams.put("welcome", welcomeMessage);
	    }
	    	    	    
	    // Collect metadata for this meeting that the third-party app wants to store if meeting is recorded.
	    Map<String, String> meetingInfo = new HashMap<String, String>();
	    for (String key: params.keySet()) {
	    	if (key.contains("meta")){
	    		String[] meta = key.split("_");
			    if(meta.length == 2){
			    	meetingInfo.put(meta[1], params.get(key));
			    }
			}   
	    }

	    if (! meetingInfo.isEmpty()) {
	    	newParams.put("metadata", meetingInfo);
	    }		
*/
	}
	
	public Map<String, Object> processUpdateCreateParams(Map<String, String> params) {
		Map<String, Object> newParams = new HashMap<String, Object>();
		
	    
	    // Do we have a meeting name? If not, complain.
	    String meetingName = params.get("name");
	    if (! StringUtils.isEmpty(meetingName) ) {
	    	newParams.put("name", meetingName);
	    }
	    	    
	    String viewerPass = params.get("attendeePW");
	    if (! StringUtils.isEmpty(viewerPass) ) {
	    	newParams.put("attendeePW", viewerPass);
	    }
	    
	    String modPass = params.get("moderatorPW"); 
	    if (! StringUtils.isEmpty(modPass) ) {
	    	newParams.put("moderatorPW", modPass);
	    }
	    
	    String telVoice = params.get("voiceBridge");
	    if (! StringUtils.isEmpty(telVoice) ) {
	    	newParams.put("voiceBridge", telVoice);
	    }	    
	    
	    String webVoice = params.get("webVoice");
	    if (! StringUtils.isEmpty(webVoice)) {
	    	newParams.put("webVoice", webVoice);
	    }
	    
	    String dialNumber = params.get("dialNumber");
	    if (! StringUtils.isEmpty(dialNumber)) {
	    	newParams.put("dialNumber", dialNumber);
	    }	    
	    
	    String logoutUrl = params.get("logoutURL"); 
	    if (! StringUtils.isEmpty(logoutUrl)) {
	    	newParams.put("logoutURL", logoutUrl);
	    }	
	    
	    String record = params.get("record");
	    if (! StringUtils.isEmpty(record)) {
	    	newParams.put("record", record);
	    }	
	    
	    String maxUsers = params.get("maxParticipants");
	    if (! StringUtils.isEmpty(maxUsers)) {
	    	newParams.put("maxParticipants", maxUsers);
	    }	
	    
	    String meetingDuration = params.get("duration");
	    if (! StringUtils.isEmpty(meetingDuration)) {
	    	newParams.put("duration", meetingDuration);
	    }
	    
	    String welcomeMessage = params.get("welcome");
	    if (! StringUtils.isEmpty(welcomeMessage)) {
	    	newParams.put("welcome", welcomeMessage);
	    }
	    	    	    
	    // Collect metadata for this meeting that the third-party app wants to store if meeting is recorded.
	    Map<String, String> meetingInfo = new HashMap<String, String>();
	    for (String key: params.keySet()) {
	    	if (key.contains("meta")){
	    		String[] meta = key.split("_");
			    if(meta.length == 2){
			    	meetingInfo.put(meta[1], params.get(key));
			    }
			}   
	    }

	    if (! meetingInfo.isEmpty()) {
	    	newParams.put("metadata", meetingInfo);
	    }
	    
	    return newParams;
	}
	
	public Meeting processCreateParams(Map<String, String> params) {
	    String meetingName = params.get("name");
	    String externalMeetingId = params.get("meetingID");
	    String viewerPass = processPassword(params.get("attendeePW"));
	    String modPass = processPassword(params.get("moderatorPW")); 
	    
	    // Get the digits for voice conference for users joining through the phone.
	    // If none is provided, generate one.
	    String telVoice = processTelVoice(params.get("voiceBridge"));
	    
	    // Get the voice conference digits/chars for users joing through VOIP on the client.
	    // If none is provided, make it the same as the telVoice. If one has been provided,
	    // we expect that the users will be joined in the same voice conference.
	    String webVoice = params.get("webVoice");
	    if (StringUtils.isEmpty(webVoice)) {
	      webVoice = telVoice;
	    }
	    
	    // Get all the other relevant parameters and generate defaults if none has been provided.
	    String dialNumber = processDialNumber(params.get("dialNumber"));
	    String logoutUrl = processLogoutUrl(params.get("logoutURL")); 
	    boolean record = processRecordMeeting(params.get("record"));
	    int maxUsers = processMaxUser(params.get("maxParticipants"));
	    int meetingDuration = processMeetingDuration(params.get("duration"));
	    String welcomeMessage = processWelcomeMessage(params.get("welcome"));
	    welcomeMessage = substituteKeywords(welcomeMessage, dialNumber, telVoice, meetingName);
	    
	    String internalMeetingId = convertToInternalMeetingId(externalMeetingId);
	    
	    // Check if this is a test meeting. NOTE: This should not belong here. Extract this out.				
	    if (isTestMeeting(telVoice)) {
	      internalMeetingId = getIntMeetingIdForTestMeeting(telVoice);
	    }
	    
	    // Collect metadata for this meeting that the third-party app wants to store if meeting is recorded.
	    Map<String, String> meetingInfo = new HashMap<String, String>();
	    for (String key: params.keySet()) {
	    	if (key.contains("meta")&&key.indexOf("meta")==0){
	    		String[] meta = key.split("_");
			    if(meta.length == 2){
			    	log.debug("Got metadata {} = {}", key, params.get(key));
			    	meetingInfo.put(meta[1].toLowerCase(), params.get(key));
			    }
			}   
	    }
	    	    
	    // Create a unique internal id by appending the current time. This way, the 3rd-party
	    // app can reuse the external meeting id.
	    long createTime = System.currentTimeMillis();
	    internalMeetingId = internalMeetingId + '-' + new Long(createTime).toString();
	    
	    // Create the meeting with all passed in parameters.
	    Meeting meeting = new Meeting.Builder(externalMeetingId, internalMeetingId, createTime)
	        .withName(meetingName).withMaxUsers(maxUsers).withModeratorPass(modPass)
	        .withViewerPass(viewerPass).withRecording(record).withDuration(meetingDuration)
	        .withLogoutUrl(logoutUrl).withTelVoice(telVoice).withWebVoice(webVoice).withDialNumber(dialNumber)
	        .withMetadata(meetingInfo).withWelcomeMessage(welcomeMessage).build();
	    
	    return meeting;
	}
	
	
	public String getApiVersion() {
		return apiVersion;
	}
	
	public boolean isServiceEnabled() {
		return serviceEnabled;
	}
	
	public String getDefaultClientUrl() {
		return defaultClientUrl;
	}
	
	public String getDefaultLogoutUrl() {
		 if ((StringUtils.isEmpty(defaultLogoutUrl)) || defaultLogoutUrl.equalsIgnoreCase("default")) {          
     		return defaultServerUrl;
     	} else {
     		return defaultLogoutUrl;
     	}
	}
	
	public String processWelcomeMessage(String message) {
		String welcomeMessage = message;
		if (StringUtils.isEmpty(message)) {
			welcomeMessage = defaultWelcomeMessage;
		}
		return welcomeMessage;
	}

	public String convertToInternalMeetingId(String extMeetingId) {
		return DigestUtils.shaHex(extMeetingId);
	}
	
	public String processPassword(String pass) {
		return StringUtils.isEmpty(pass) ? RandomStringUtils.randomAlphanumeric(8) : pass;
	}

	public boolean hasChecksumAndQueryString(String checksum, String queryString) {
		return (! StringUtils.isEmpty(checksum) && StringUtils.isEmpty(queryString));
	}
		
	public String processTelVoice(String telNum) {
		return StringUtils.isEmpty(telNum) ? RandomStringUtils.randomNumeric(defaultNumDigitsForTelVoice) : telNum;
	}
		
	public String processDialNumber(String dial) {
		return StringUtils.isEmpty(dial) ? defaultDialAccessNumber : dial;	
	}
	
	public String processLogoutUrl(String logoutUrl) {
		if (StringUtils.isEmpty(logoutUrl)) {
	        if ((StringUtils.isEmpty(defaultLogoutUrl)) || defaultLogoutUrl.equalsIgnoreCase("default")) {          
        		return defaultServerUrl;
        	} else {
        		return defaultLogoutUrl;
        	}	
		}
		
		return logoutUrl;
	}
	
	public boolean processRecordMeeting(String record) {
		boolean rec = false;			
		if(! StringUtils.isEmpty(record)){
			try {
				rec = Boolean.parseBoolean(record);
			} catch(Exception ex){ 
				rec = false;
			}
		}
		
		return rec;
	}
		
	public int processMaxUser(String maxUsers) {
		int mUsers = -1;
		
		try {
			mUsers = Integer.parseInt(maxUsers);
		} catch(Exception ex) { 
			mUsers = defaultMaxUsers;
		}		
		
		return mUsers;
	}	

  public int processMeetingDuration(String duration) {
    int mDuration = -1;
    
    try {
      mDuration = Integer.parseInt(duration);
    } catch(Exception ex) { 
      mDuration = defaultMeetingDuration;
    }   
    
    return mDuration;
  } 
  	
	public boolean isTestMeeting(String telVoice) {	
		return ((! StringUtils.isEmpty(telVoice)) && 
				(! StringUtils.isEmpty(testVoiceBridge)) && 
				(telVoice == testVoiceBridge));	
	}
		
	public String getIntMeetingIdForTestMeeting(String telVoice) {		
		if ((testVoiceBridge != null) && (telVoice == testVoiceBridge)) {
			if (StringUtils.isEmpty(testConferenceMock)) 
				return testConferenceMock;
		} 
		
		return "";	
	}
	
	public boolean isChecksumSame(String apiCall, String checksum, String queryString) {
		log.debug("checksum: [{}] ; query string: [{}]", checksum, queryString);
	
		if (StringUtils.isEmpty(securitySalt)) {
			log.warn("Security is disabled in this service. Make sure this is intentional.");
			return true;
		}
		
		// handle either checksum as first or middle / end parameter
		// TODO: this is hackish - should be done better
		queryString = queryString.replace("&checksum=" + checksum, "");
		queryString = queryString.replace("checksum=" + checksum + "&", "");
		queryString = queryString.replace("checksum=" + checksum, "");
		
		log.debug("query string after checksum removed: [{}]", queryString);
		String cs = DigestUtils.shaHex(apiCall + queryString + securitySalt);
		log.debug("our checksum: [{}], client: [{}]", cs, checksum);
		if (cs == null || cs.equals(checksum) == false) {
			log.info("checksumError: request did not pass the checksum security check");
			return false;
		}
		log.debug("checksum ok: request passed the checksum security check");
		return true; 
	}
	
	/*************************************************
	 * Setters
	 ************************************************/
	
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}

	public void setServiceEnabled(boolean e) {
		serviceEnabled = e;
	}
	
	public void setSecuritySalt(String securitySalt) {
		this.securitySalt = securitySalt;
	}

	public void setDefaultMaxUsers(int defaultMaxUsers) {
		this.defaultMaxUsers = defaultMaxUsers;
	}

	public void setDefaultWelcomeMessage(String defaultWelcomeMessage) {
		this.defaultWelcomeMessage = defaultWelcomeMessage;
	}

	public void setDefaultDialAccessNumber(String defaultDialAccessNumber) {
		this.defaultDialAccessNumber = defaultDialAccessNumber;
	}

	public void setTestVoiceBridge(String testVoiceBridge) {
		this.testVoiceBridge = testVoiceBridge;
	}

	public void setTestConferenceMock(String testConferenceMock) {
		this.testConferenceMock = testConferenceMock;
	}

	public void setDefaultLogoutUrl(String defaultLogoutUrl) {
		this.defaultLogoutUrl = defaultLogoutUrl;
	}

	public void setDefaultServerUrl(String defaultServerUrl) {
		this.defaultServerUrl = defaultServerUrl;
	}

	public void setDefaultNumDigitsForTelVoice(int defaultNumDigitsForTelVoice) {
		this.defaultNumDigitsForTelVoice = defaultNumDigitsForTelVoice;
	}

	public void setDefaultClientUrl(String defaultClientUrl) {
		this.defaultClientUrl = defaultClientUrl;
	}

	public void setDefaultMeetingDuration(int defaultMeetingDuration) {
		this.defaultMeetingDuration = defaultMeetingDuration;
	}
	
	public ArrayList<String> decodeIds(String encodeid){
		ArrayList<String> ids=new ArrayList<String>();
		try {
			ids.addAll(Arrays.asList(URLDecoder.decode(encodeid,"UTF-8").split(URLDECODER_SEPARATOR)));
		} catch (UnsupportedEncodingException e) {
			log.error("Couldn't decode the IDs");
		}
		
		return ids;
	}
	
	public ArrayList<String> convertToInternalMeetingId(ArrayList<String> extMeetingIds) {
		ArrayList<String> internalMeetingIds=new ArrayList<String>();
		for(String extid : extMeetingIds){
			internalMeetingIds.add(convertToInternalMeetingId(extid));
		}
		return internalMeetingIds;
	}
}
