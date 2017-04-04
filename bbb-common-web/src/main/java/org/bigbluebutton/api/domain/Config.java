package org.bigbluebutton.api.domain;

public class Config {
	
	public final String token;
	public final long createdOn;
	public final String config;
	
	public Config(String token, long timestamp, String config) {
		this.token = token;
		this.createdOn = timestamp;
		this.config = config;
	}
}
