package org.bigbluebutton.api;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;

public class ParamsProcessorUtil {
	private String apiVersion;
	private String securitySalt;
	private int minutesElapsedBeforeMeetingExpiration = 60;
	private int defaultMaxUsers = 20;
	private String defaultWelcomeMessage;
	private String defaultDialAccessNumber;
	private String testVoiceBridge;
	private String testConferenceMock;
	private String recordingDir;
	private String recordingFile;
	private String recordStatusDir;
	private String defaultLogoutUrl;
	private String defaultServerUrl;
	private String defaultNumDigitsForTelVoice;
	private String defaultClientUrl;
	private String defaultMeetingDuration;
	
	public String processPassword(String pass) {
		return StringUtils.isEmpty(pass) ? RandomStringUtils.randomAlphanumeric(8) : pass;
	}

	public boolean hasChecksumAndQueryString(String checksum, String queryString) {
		return (! StringUtils.isEmpty(checksum) && StringUtils.isEmpty(queryString));
	}
		
	public String processTelVoice(String telNum) {
		return StringUtils.isEmpty(telNum) ? RandomStringUtils.randomNumeric(Integer.parseInt(defaultNumDigitsForTelVoice)) : telNum;
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
      mDuration = Integer.parseInt(defaultMeetingDuration);
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
	
	/*************************************************
	 * Setters
	 ************************************************/
	
	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}

	public void setSecuritySalt(String securitySalt) {
		this.securitySalt = securitySalt;
	}

	public void setMinutesElapsedBeforeMeetingExpiration(
			int minutesElapsedBeforeMeetingExpiration) {
		this.minutesElapsedBeforeMeetingExpiration = minutesElapsedBeforeMeetingExpiration;
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

	public void setRecordingDir(String recordingDir) {
		this.recordingDir = recordingDir;
	}

	public void setRecordingFile(String recordingFile) {
		this.recordingFile = recordingFile;
	}

	public void setRecordStatusDir(String recordStatusDir) {
		this.recordStatusDir = recordStatusDir;
	}

	public void setDefaultLogoutUrl(String defaultLogoutUrl) {
		this.defaultLogoutUrl = defaultLogoutUrl;
	}

	public void setDefaultServerUrl(String defaultServerUrl) {
		this.defaultServerUrl = defaultServerUrl;
	}

	public void setDefaultNumDigitsForTelVoice(String defaultNumDigitsForTelVoice) {
		this.defaultNumDigitsForTelVoice = defaultNumDigitsForTelVoice;
	}

	public void setDefaultClientUrl(String defaultClientUrl) {
		this.defaultClientUrl = defaultClientUrl;
	}

	public void setDefaultMeetingDuration(String defaultMeetingDuration) {
		this.defaultMeetingDuration = defaultMeetingDuration;
	}
}
