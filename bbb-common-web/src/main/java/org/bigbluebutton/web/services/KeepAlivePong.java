package org.bigbluebutton.web.services;

public class KeepAlivePong implements KeepAliveMessage {

	public final String system;
	public final Long bbbWebTimestamp;
	public final Long akkaAppsTimestamp;

	public KeepAlivePong(String system, Long bbbWebTimestamp, Long akkaAppsTimestamp) {
		this.system = system;
		this.bbbWebTimestamp = bbbWebTimestamp;
		this.akkaAppsTimestamp = akkaAppsTimestamp;
	}
}
