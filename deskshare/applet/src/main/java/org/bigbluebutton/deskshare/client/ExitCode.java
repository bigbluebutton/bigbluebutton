package org.bigbluebutton.deskshare.client;

public enum ExitCode {
	NORMAL(0),
	BAD_PARAMETERS(400),
	CANNOT_CONNECT_TO_LIFELINE(401),
	ERROR_ON_LIFELINE_CONNECTION(402),
	CONNECTION_TO_DESKSHARE_SERVER_DROPPED(403), 
	CANNOT_BIND_TO_LIFELINE_PORT(404),
	LIFELINE_CONNECTION_CLOSED(405),
	INTERNAL_ERROR(500), 
	DESKSHARE_SERVICE_UNAVAILABLE(503);
	
	private final int exitValue;
	
	ExitCode(int code) { this.exitValue = code; }
	
	public int getExitCode() {return exitValue;}
}
