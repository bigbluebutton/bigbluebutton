package org.bigbluebutton.api.domain;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DynamicConferenceParticipant {
	private String userid;
	private String fullname;
	private String role;
	private String externUserID;
	private Map status;
	
	public DynamicConferenceParticipant(String userid, String fullname,
			String role,String externUserID, Map<String, String> status) {
		this.userid = userid;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;
		this.status = new ConcurrentHashMap<String, Object>(status);
	}
	
	public String getUserid() {
		return userid;
	}
	public void setUserid(String userid) {
		this.userid = userid;
	}
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}

	public boolean isModerator() {
		return this.role.equalsIgnoreCase("MODERATOR");
	}
	
	public Map getStatus() {
		return status;
	}

	public void setStatus(String statusName, Object value) {
		status.put(statusName, value);
	}

	public void removeStatus(String statusName) {
		status.remove(statusName);
	}
	
}
