package org.bigbluebutton.api.domain;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class User {
	private String internalUserId;
	private String externalUserId;
	private String fullname;
	private String role;
	private Map<String,String> status;
	
	public User(String internalUserId, String externalUserId, String fullname, String role) {
		this.internalUserId = internalUserId;
		this.externalUserId = externalUserId;
		this.fullname = fullname;
		this.role = role;
		this.status = new ConcurrentHashMap<String, String>();
	}
	
	public String getInternalUserId() {
		return this.internalUserId;
	}
	public void setInternalUserId(String internalUserId) {
		this.internalUserId = internalUserId;
	}
	
	public String getExternalUserId(){
		return this.externalUserId;
	}
	
	public void setExternalUserId(String externalUserId){
		this.externalUserId = externalUserId;
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
	
	public void setStatus(String key, String value){
		this.status.put(key, value);
	}
	public void removeStatus(String key){
		this.status.remove(key);
	}
	public Map<String,String> getStatus(){
		return this.status;
	}
}
