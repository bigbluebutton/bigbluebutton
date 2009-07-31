package org.red5.server.webapp.sip;


import org.zoolu.sip.address.NameAddress;


/** Listener of SIPUserAgent */
public interface SIPUserAgentListener {

    /** When a new call is incoming */
    public void onUaCallIncoming( SIPUserAgent ua, NameAddress callee, NameAddress caller );


    /** When an incoming call is cancelled */
    public void onUaCallCancelled( SIPUserAgent ua );


    /** When an ougoing call is remotly ringing */
    public void onUaCallRinging( SIPUserAgent ua );


    /** When an ougoing call has been accepted */
    public void onUaCallAccepted( SIPUserAgent ua );


    /** When a call has been trasferred */
    public void onUaCallTrasferred( SIPUserAgent ua );


    /** When an ougoing call has been refused or timeout */
    public void onUaCallFailed( SIPUserAgent ua );


    /** When a call has been locally or remotly closed */
    public void onUaCallClosed( SIPUserAgent ua );


    /** When a call has media connected */
    public void onUaCallConnected( SIPUserAgent ua );

}
