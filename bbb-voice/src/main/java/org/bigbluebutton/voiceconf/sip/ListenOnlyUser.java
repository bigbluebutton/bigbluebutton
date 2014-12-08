package org.bigbluebutton.voiceconf.sip;

public class ListenOnlyUser {

	public final String clientId;
	public final String callerIdName;
	public final String voiceConf;
	
	public ListenOnlyUser(String clientId, String callerIdName, String voiceConf) {
	  this.clientId = clientId;
	  this.callerIdName = callerIdName;
	  this.voiceConf = voiceConf;
	}
}
