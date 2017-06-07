package org.bigbluebutton.api.messaging;


import org.bigbluebutton.api2.IBbbWebApiGWApp;

public class MessageSender {
	private IBbbWebApiGWApp gw;

	public void send(String channel, String message) {
		gw.send(channel, message);
	}

	public void setGw(IBbbWebApiGWApp gw) {
		this.gw = gw;
	}
}
