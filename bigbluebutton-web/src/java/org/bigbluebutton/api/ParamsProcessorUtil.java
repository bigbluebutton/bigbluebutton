package org.bigbluebutton.api;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ParamsProcessorUtil {
	private static Logger log = LoggerFactory.getLogger(ParamsProcessorUtil.class);
	
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
		return defaultLogoutUrl;
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
	        if (StringUtils.isEmpty(defaultLogoutUrl)) {          
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
}
