package org.red5.app.sip;

import org.zoolu.sip.call.*;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.message.*;
import org.zoolu.sdp.*;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.CodecUtils;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.zoolu.tools.Parser;
import java.util.Enumeration;
import java.util.Vector;

public class SipUserAgent extends CallListenerAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(SipUserAgent.class, "sip");
    
    private SipUserAgentProfile userProfile;
    private SipProvider sipProvider;
    private ExtendedCall call;
    private ExtendedCall callTransfer;
    private CallStream callStream;    
    private String localSession = null;
    private SipUserAgentListener listener = null;
    private Codec sipCodec = null;    
    private final ScopeProvider scopeProvider;
    
    private static final String UA_IDLE = "IDLE"; 					/** UA_IDLE=0 */    
    private static final String UA_INCOMING_CALL = "INCOMING_CALL"; /** UA_INCOMING_CALL=1 */    
    private static final String UA_OUTGOING_CALL = "OUTGOING_CALL"; /** UA_OUTGOING_CALL=2 */    
    private static final String UA_ONCALL = "ONCALL"; 				/** UA_ONCALL=3 */

    /**
     * Call state
     * <P>
     * UA_IDLE=0, <BR>
     * UA_INCOMING_CALL=1, <BR>
     * UA_OUTGOING_CALL=2, <BR>
     * UA_ONCALL=3
     */
    String call_state = UA_IDLE;

    protected void changeStatus(String state) {
        call_state = state;
    }

    protected boolean statusIs(String state) {
        return call_state.equals(state);
    }

    protected String getStatus() {
        return call_state;
    }


    /**
     * Sets the automatic answer time (default is -1 that means no auto accept
     * mode)
     */
    public void setAcceptTime(int accept_time) {
        userProfile.acceptTime = accept_time;
    }


    /**
     * Sets the automatic hangup time (default is 0, that corresponds to manual
     * hangup mode)
     */
    public void setHangupTime(int time) {
        userProfile.hangupTime = time;
    }


    /** Sets the redirection url (default is null, that is no redircetion) */
    public void setRedirection(String url) {
        userProfile.redirectTo = url;
    }

    /** Sets the no offer mode for the invite (default is false) */
    public void setNoOfferMode(boolean nooffer) {
        userProfile.noOffer = nooffer;
    }

    public void setAudio(boolean enable) {
        userProfile.audio = enable;
    }

    public void setVideo(boolean enable) {
        userProfile.video = enable;
    }

    public void setReceiveOnlyMode(boolean r_only) {
        userProfile.recvOnly = r_only;
    }

    public void setSendOnlyMode(boolean s_only) {
        userProfile.sendOnly = s_only;
    }

    public void setSendToneMode(boolean s_tone) {
        userProfile.sendTone = s_tone;
    }

    public void setSendFile(String file_name) {
        userProfile.sendFile = file_name;
    }

    public void setRecvFile(String file_name) {
        userProfile.recvFile = file_name;
    }

    public String getSessionDescriptor() {
        return localSession;
    }

    public void setSessionDescriptor(String sdp) {
        localSession = sdp;
    }

//    public boolean isReceiverRunning() {
//    	return callStream.isReceiverRunning();
//    }
    
    public void queueSipDtmfDigits(String digits) {
    	callStream.queueSipDtmfDigits(digits);
    }
    
    public void initSessionDescriptor() {        
        log.debug("initSessionDescriptor");        
        SessionDescriptor newSdp = SdpUtils.createInitialSdp(
                userProfile.username, sipProvider.getViaAddress(), 
                userProfile.audioPort, userProfile.videoPort, 
                userProfile.audioCodecsPrecedence );        
        localSession = newSdp.toString();        
        log.debug("localSession Descriptor = " + localSession );
    }

    public SipUserAgent(SipProvider sipProvider, SipUserAgentProfile userProfile,
    		SipUserAgentListener listener, ScopeProvider scopeProvider) {
        this.scopeProvider = scopeProvider;
        this.sipProvider = sipProvider;
        this.listener = listener;
        this.userProfile = userProfile;
        
        // If no contact_url and/or from_url has been set, create it now.
        userProfile.initContactAddress( sipProvider );        
        // Set local sdp.
        initSessionDescriptor();
    }

    public void call(String targetUrl) {    	
    	log.debug( "call", "Init..." );        
        changeStatus( UA_OUTGOING_CALL );
        
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);  
        
        // In case of incomplete url (e.g. only 'user' is present), try to
        // complete it.       
        targetUrl = sipProvider.completeNameAddress(targetUrl).toString();

        if (userProfile.noOffer) {
            call.call(targetUrl);
        } else {
            call.call( targetUrl, localSession );
        }
    }

    /** Call Transfer test by Lior */
    public void transfer( String transferTo ){
	   log.debug("REFER/TRANSFER", "Init..." );
	   if (call != null && call.isOnCall()) {
  		   call.transfer(transferTo);
	   }
  	}
    /** end of transfer test code */


    /** Waits for an incoming call (acting as UAS). */
    public void waitForIncomingCalls() {
    	log.debug("waitForIncomingCalls..." );       
        changeStatus( UA_IDLE );
        
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);        
        call.listen();
    }


    /** Closes an ongoing, incoming, or pending call */
    public void hangup() {
    	log.debug("hangup");
             
        closeMediaApplication();        
        if (call != null) {
            call.hangup();
        }        
        changeStatus(UA_IDLE);
    }


    /** Closes an ongoing, incoming, or pending call */
    public void accept() {        
    	log.debug("accept", "Init...");

        if (call != null) {
            call.accept(localSession);
        }
    }


    /** Redirects an incoming call */
    public void redirect(String redirection) {    	
    	log.debug( "redirect", "Init..." );
    	
        if (call != null) {
            call.redirect(redirection);
        }
    }

    protected void launchMediaApplication() {
        // Exit if the Media Application is already running.
        if (callStream != null) {            
        	log.debug("launchMediaApplication", "Media application is already running.");
            return;
        }
        
        SessionDescriptor localSdp = new SessionDescriptor( call.getLocalSessionDescriptor() );        
        SessionDescriptor remoteSdp = new SessionDescriptor( call.getRemoteSessionDescriptor() );
        String remoteMediaAddress = (new Parser(remoteSdp.getConnection().toString())).skipString().skipString().getString();
        int remoteAudioPort = getRemoteAudioPort(remoteSdp);
        int localAudioPort = getLocalAudioPort(localSdp);
        
        log.debug("[localAudioPort=" + localAudioPort + ",remoteAudioPort=" + remoteAudioPort + "]");

        if (userProfile.audio && localAudioPort != 0 && remoteAudioPort != 0) {
            if ((callStream == null) && (sipCodec != null)) {   
            	SipConnectInfo connInfo = new SipConnectInfo(localAudioPort, remoteMediaAddress, remoteAudioPort);
            	
            	try {
					callStream = new CallStream(sipCodec, connInfo, scopeProvider);
					if (listener != null) {
	                	listener.onUaCallConnected(this, callStream.getListenStreamName(), callStream.getTalkStreamName());
	                }
				} catch (Exception e) {
					log.error("Failed to create Call Stream.");
				}                
            }
        }
    }

    private int getLocalAudioPort(SessionDescriptor localSdp) {
        int localAudioPort = 0;
        int localVideoPort = 0;

        // parse local sdp
        for ( Enumeration e = localSdp.getMediaDescriptors().elements(); e.hasMoreElements(); ) {
            MediaField media = ( (MediaDescriptor) e.nextElement() ).getMedia();
            if ( media.getMedia().equals( "audio" ) ) {
                localAudioPort = media.getPort();
            }
            if ( media.getMedia().equals( "video" ) ) {
                localVideoPort = media.getPort();
            }
        }
        
        return localAudioPort;
    }
    
    private int getRemoteAudioPort(SessionDescriptor remoteSdp) {
    	int remoteAudioPort = 0;
        int remoteVideoPort = 0;

        for ( Enumeration e = remoteSdp.getMediaDescriptors().elements(); e.hasMoreElements(); ) {
            MediaDescriptor descriptor = (MediaDescriptor) e.nextElement();
            MediaField media = descriptor.getMedia();

            if ( media.getMedia().equals( "audio" ) ) {
                remoteAudioPort = media.getPort();
            }

            if ( media.getMedia().equals( "video" ) ) {
                remoteVideoPort = media.getPort();
            }
        }
        
        return remoteAudioPort;
    }
    
    public void startTalkStream() {
    	callStream.startMedia();   	
    }
    
    protected void closeMediaApplication() {        
    	log.debug( "closeMediaApplication", "Init..." );
        
        if (callStream != null) {
        	callStream.stopMedia();
        	callStream = null;
        }
    }


    // ********************** Call callback functions **********************

    /**
     * Callback function called when arriving a new INVITE method (incoming call)
     */
    public void onCallIncoming(Call call, NameAddress callee, NameAddress caller, String sdp, Message invite) {        
    	log.debug("onCallIncoming");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("Inside SIPUserAgent.onCallIncoming(): sdp=\n" + sdp);
        
        changeStatus(UA_INCOMING_CALL);
        call.ring();

        if (sdp != null) {
            SessionDescriptor remoteSdp = new SessionDescriptor(sdp);
            SessionDescriptor localSdp = new SessionDescriptor(localSession);
            
            log.debug("localSdp = " + localSdp.toString() + ".");
            log.debug("remoteSdp = " + remoteSdp.toString() + ".");
            
            // First we need to make payloads negotiation so the related 
            // attributes can be then matched.
            SessionDescriptor newSdp = SdpUtils.makeMediaPayloadsNegotiation(localSdp, remoteSdp);
            
            // After we can create the correct audio codec considering 
            // audio negotiation made above.
            sipCodec = SdpUtils.getNegotiatedAudioCodec(newSdp);
            
            // Now we complete the SDP negotiation informing the selected 
            // codec, so it can be internally updated during the process.
            SdpUtils.completeSdpNegotiation(newSdp, localSdp, remoteSdp);

            localSession = newSdp.toString();
            
            log.debug("newSdp = " + localSession + "." );
            
            // Finally, we use the "newSdp" and "remoteSdp" to initialize 
            // the lasting codec informations.
            CodecUtils.initSipAudioCodec(sipCodec, userProfile.audioDefaultPacketization, 
                    userProfile.audioDefaultPacketization, newSdp, remoteSdp);
        }

        if (listener != null) {
            listener.onUaCallIncoming(this, callee, caller);
        }
    }


    /**
     * Callback function called when arriving a new Re-INVITE method
     * (re-inviting/call modify)
     */
    public void onCallModifying(Call call, String sdp, Message invite) {
    	log.debug("onCallModifying");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("RE-INVITE/MODIFY.");
        
        // to be implemented.
        // currently it simply accepts the session changes (see method
        // onCallModifying() in CallListenerAdapter)
        super.onCallModifying( call, sdp, invite );
    }


    /**
     * Callback function that may be overloaded (extended). Called when arriving
     * a 180 Ringing
     */
    public void onCallRinging(Call call, Message resp) {        
    	log.debug("onCallRinging");
        
        if (call != this.call && call != callTransfer) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("RINGING." );
        
        // Play "on" sound.
        if (listener != null) {
            listener.onUaCallRinging(this);
        }
    }


    /** Callback function called when arriving a 2xx (call accepted) */
    public void onCallAccepted(Call call, String sdp, Message resp) {        
    	log.debug( "onCallAccepted");
        
        if (call != this.call && call != callTransfer) {
        	log.debug("NOT the current call." );
            return;
        }
        
        log.debug("ACCEPTED/CALL.");
        
        changeStatus(UA_ONCALL);

        SessionDescriptor remoteSdp = new SessionDescriptor(sdp);
        SessionDescriptor localSdp = new SessionDescriptor(localSession);
        
        log.debug("localSdp = " + localSdp.toString() + ".");
        log.debug("remoteSdp = " + remoteSdp.toString() + ".");
        
        // First we need to make payloads negotiation so the related 
        // attributes can be then matched.
        SessionDescriptor newSdp = SdpUtils.makeMediaPayloadsNegotiation(localSdp, remoteSdp);
        
        // After we can create the correct audio codec considering 
        // audio negotiation made above.
        sipCodec = SdpUtils.getNegotiatedAudioCodec(newSdp);
        
        // Now we complete the SDP negotiation informing the selected 
        // codec, so it can be internally updated during the process.
        SdpUtils.completeSdpNegotiation(newSdp, localSdp, remoteSdp);

        localSession = newSdp.toString();
        
        log.debug("newSdp = " + localSession + ".");
        
        // Finally, we use the "newSdp" and "remoteSdp" to initialize 
        // the lasting codec informations.
        CodecUtils.initSipAudioCodec(sipCodec, userProfile.audioDefaultPacketization, 
                userProfile.audioDefaultPacketization, newSdp, remoteSdp);

        if (userProfile.noOffer) {
            // Answer with the local sdp.
            call.ackWithAnswer(localSession);
        }

        launchMediaApplication();

        if (call == callTransfer) {
            StatusLine statusLine = resp.getStatusLine();
            int code = statusLine.getCode();
            String reason = statusLine.getReason();
            this.call.notify(code, reason);
        }

        if (listener != null) {
            listener.onUaCallAccepted(this);
        }
    }


    /** Callback function called when arriving an ACK method (call confirmed) */
    public void onCallConfirmed(Call call, String sdp, Message ack) {
    	log.debug("onCallConfirmed");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("CONFIRMED/CALL.");
        
        changeStatus(UA_ONCALL);
        launchMediaApplication();
    }


    /** Callback function called when arriving a 2xx (re-invite/modify accepted) */
    public void onCallReInviteAccepted(Call call, String sdp, Message resp) {
    	log.debug( "onCallReInviteAccepted");
        
        if (call != this.call) {
        	log.debug("NOT the current call." );
            return;
        }
        
        log.debug("RE-INVITE-ACCEPTED/CALL." );
    }


    /** Callback function called when arriving a 4xx (re-invite/modify failure) */
    public void onCallReInviteRefused(Call call, String reason, Message resp) {
    	log.debug("onCallReInviteRefused");
        
        if (call != this.call) {
        	log.debug("NOT the current call");
            return;
        }
        
        log.debug("RE-INVITE-REFUSED (" + reason + ")/CALL.");
        
        if (listener != null) {
            listener.onUaCallFailed(this);
        }
    }

    /** Callback function called when arriving a 4xx (call failure) */
    public void onCallRefused(Call call, String reason, Message resp) {        
    	log.debug("onCallRefused");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("REFUSED (" + reason + ").");
        
        changeStatus(UA_IDLE);

        if (call == callTransfer) {
            StatusLine status_line = resp.getStatusLine();
            int code = status_line.getCode();
            // String reason=status_line.getReason();
            this.call.notify(code, reason);
            callTransfer = null;
        }

        if (listener != null) {
            listener.onUaCallFailed(this);
        }
    }


    /** Callback function called when arriving a 3xx (call redirection) */
    public void onCallRedirection(Call call, String reason, Vector contact_list, Message resp) {        
    	log.debug("onCallRedirection");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("REDIRECTION (" + reason + ")." );
        
        call.call(((String) contact_list.elementAt(0)));
    }


    /**
     * Callback function that may be overloaded (extended). Called when arriving
     * a CANCEL request
     */
    public void onCallCanceling(Call call, Message cancel) {
    	log.debug("onCallCanceling");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("CANCEL.");
        
        changeStatus(UA_IDLE);

        if (listener != null) {
            listener.onUaCallCancelled(this);
        }
    }


    /** Callback function called when arriving a BYE request */
    public void onCallClosing(Call call, Message bye) {
    	log.debug("onCallClosing");
        
        if (call != this.call && call != callTransfer) {
        	log.debug("NOT the current call.");
            return;
        }

        if (call != callTransfer && callTransfer != null) {
        	log.debug("CLOSE PREVIOUS CALL.");
            this.call = callTransfer;
            callTransfer = null;
            return;
        }
        
        log.debug("CLOSE.");
        
        closeMediaApplication();

        if (listener != null) {
            listener.onUaCallClosed(this);
        }

        changeStatus(UA_IDLE);

        // Reset local sdp for next call.
        initSessionDescriptor();
    }


    /**
     * Callback function called when arriving a response after a BYE request
     * (call closed)
     */
    public void onCallClosed(Call call, Message resp) {
    	log.debug("onCallClosed");
        
        if (call != this.call) {
        	log.debug("NOT the current call." );
            return;
        }
        
        log.debug("CLOSE/OK.");
        
        if (listener != null) {
            listener.onUaCallClosed(this);
        }

        changeStatus(UA_IDLE);
    }


    /** Callback function called when the invite expires */
    public void onCallTimeout(Call call) {        
    	log.debug("onCallTimeout");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("NOT FOUND/TIMEOUT.");
        
        changeStatus(UA_IDLE);

        if (call == callTransfer) {
            int code = 408;
            String reason = "Request Timeout";
            this.call.notify( code, reason );
            callTransfer = null;
        }

        if (listener != null) {
            listener.onUaCallFailed(this);
        }
    }


    // ****************** ExtendedCall callback functions ******************

    /**
     * Callback function called when arriving a new REFER method (transfer request)
     */
    public void onCallTransfer(ExtendedCall call, NameAddress refer_to, NameAddress refered_by, Message refer) {
    	log.debug("onCallTransfer");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("Transfer to " + refer_to.toString() + ".");
        
        call.acceptTransfer();

        callTransfer = new ExtendedCall(sipProvider, userProfile.fromUrl, userProfile.contactUrl, this);
        callTransfer.call(refer_to.toString(), localSession);
    }


    /** Callback function called when a call transfer is accepted. */
    public void onCallTransferAccepted(ExtendedCall call, Message resp) {
    	log.debug("onCallTransferAccepted");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug("Transfer accepted.");
    }


    /** Callback function called when a call transfer is refused. */
    public void onCallTransferRefused(ExtendedCall call, String reason, Message resp) {
    	log.debug("onCallTransferRefused");
        
        if (call != this.call) {
        	log.debug("NOT the current call.");
            return;
        }
        
        log.debug( "onCallTransferRefused", "Transfer refused." );
    }


    /** Callback function called when a call transfer is successfully completed */
    public void onCallTransferSuccess(ExtendedCall call, Message notify) {
    	log.debug( "onCallTransferSuccess", "Init..." );
        
        if (call != this.call) {
        	log.debug("onCallTransferSuccess", "NOT the current call.");
            return;
        }
        
        log.debug( "onCallTransferSuccess", "Transfer successed." );
        
        call.hangup();

        if ( listener != null ) {
            listener.onUaCallTrasferred( this );
        }
    }


    /**
     * Callback function called when a call transfer is NOT sucessfully
     * completed
     */
    public void onCallTransferFailure(ExtendedCall call, String reason, Message notify) {
    	log.debug( "onCallTransferFailure", "Init..." );
        
        if ( call != this.call ) {
        	log.debug( "onCallTransferFailure", "NOT the current call." );
            return;
        }
        
        log.debug( "onCallTransferFailure", "Transfer failed." );
    }
}
