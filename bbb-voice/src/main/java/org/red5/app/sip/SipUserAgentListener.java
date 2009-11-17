package org.red5.app.sip;

import org.zoolu.sip.address.NameAddress;

/** Listener of SIPUserAgent */
public interface SipUserAgentListener {
    /** When a new call is incoming */
    public void onUaCallIncoming( SipUserAgent ua, NameAddress callee, NameAddress caller );

    /** When an incoming call is cancelled */
    public void onUaCallCancelled( SipUserAgent ua );

    /** When an ougoing call is remotly ringing */
    public void onUaCallRinging( SipUserAgent ua );

    /** When an ougoing call has been accepted */
    public void onUaCallAccepted( SipUserAgent ua );

    /** When a call has been trasferred */
    public void onUaCallTrasferred( SipUserAgent ua );

    /** When an ougoing call has been refused or timeout */
    public void onUaCallFailed( SipUserAgent ua );


    /** When a call has been locally or remotely closed */
    public void onUaCallClosed(SipUserAgent ua);


    /** When a call has media connected */
    public void onUaCallConnected(SipUserAgent ua, String talkStreamName, String listenStreamName);

}
