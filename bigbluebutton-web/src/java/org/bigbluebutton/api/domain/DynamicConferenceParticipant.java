package org.bigbluebutton.api.domain;

public class DynamicConferenceParticipant {
	private String userid;
	private String fullname;
	private String role;
	
	public DynamicConferenceParticipant(String userid, String fullname,
			String role) {
		this.userid = userid;
		this.fullname = fullname;
		this.role = role;
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
	
	
}
