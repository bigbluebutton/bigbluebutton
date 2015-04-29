package org.red5.app.sip;

public interface SipUserAgentListener {
    public void onCallConnected(String talkStreamName, String listenStreamName);
	public void onNewIncomingCall(String source, String sourceName, String destination, String destinationName);	
	public void onOutgoingCallRemoteRinging();	
    public void onOutgoingCallAccepted();
    public void onCallTrasferred();
    public void onIncomingCallCancelled();
    public void onOutgoingCallFailed();
    public void onCallClosed();
}
