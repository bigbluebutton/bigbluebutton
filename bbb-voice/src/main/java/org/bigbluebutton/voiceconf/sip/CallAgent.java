/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.sip;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.zoolu.sip.call.*;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.message.*;
import org.zoolu.sdp.*;
import org.bigbluebutton.voiceconf.messaging.IMessagingService;
import org.bigbluebutton.voiceconf.red5.CallStreamFactory;
import org.bigbluebutton.voiceconf.red5.ClientConnectionManager;
import org.bigbluebutton.voiceconf.red5.media.CallStream;
import org.bigbluebutton.voiceconf.red5.media.CallStreamObserver;
import org.bigbluebutton.voiceconf.red5.media.StreamException;
import org.bigbluebutton.voiceconf.util.StackTraceUtil;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.CodecUtils;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Vector;

public class CallAgent extends CallListenerAdapter implements CallStreamObserver  {
    private static Logger log = Red5LoggerFactory.getLogger(CallAgent.class, "sip");
    
    private final SipPeerProfile userProfile;
    private final SipProvider sipProvider;
    private final String clientRtpIp;
    private ExtendedCall call;
    private CallStream callStream;    
    private String localSession = null;
    private Codec sipCodec = null;    
    private CallStreamFactory callStreamFactory;
    private ClientConnectionManager clientConnManager; 
    private final String clientId;
    private final AudioConferenceProvider portProvider;
    private DatagramSocket localSocket = null;
    private String _callerName;
    private String _destination;
    private Boolean listeningToGlobal = false;
    private IMessagingService messagingService;
    private ForceHangupGlobalAudioUsersListener forceHangupGlobalAudioUsersListener;

    private enum CallState {
    	UA_IDLE(0), UA_INCOMING_CALL(1), UA_OUTGOING_CALL(2), UA_ONCALL(3);    	
    	private final int state;
    	CallState(int state) {this.state = state;}
    	private int getState() {return state;}
    }

    private CallState callState;

    public String getDestination() {
        return _destination;
    }

    public CallAgent(String sipClientRtpIp, SipProvider sipProvider, SipPeerProfile userProfile, 
    		AudioConferenceProvider portProvider, String clientId, IMessagingService messagingService) {
        this.sipProvider = sipProvider;
        this.clientRtpIp = sipClientRtpIp;
        this.userProfile = userProfile;
        this.portProvider = portProvider;
        this.clientId = clientId;
        this.messagingService = messagingService;
    }
    
    public String getCallId() {
    	return clientId;
    }
    
    private void initSessionDescriptor() {        
        log.debug("initSessionDescriptor");
        SessionDescriptor newSdp = SdpUtils.createInitialSdp(userProfile.username, 
        		this.clientRtpIp, userProfile.audioPort, 
        		userProfile.videoPort, userProfile.audioCodecsPrecedence );
        localSession = newSdp.toString();        
        log.debug("localSession Descriptor = " + localSession );
    }

    public Boolean isListeningToGlobal() {
        return listeningToGlobal;
    }

    public void call(String callerName, String destination) {
    	_callerName = callerName;
    	_destination = destination;
    	log.debug("{} making a call to {}", callerName, destination);  
    	try {
			localSocket = getLocalAudioSocket();
			userProfile.audioPort = localSocket.getLocalPort();	    	
		} catch (Exception e) {
			log.debug("{} failed to allocate local port for call to {}. Notifying client that call failed.", callerName, destination); 
			notifyListenersOnOutgoingCallFailed();
			return;
		}    	
    	
		setupCallerDisplayName(callerName, destination);	
    	userProfile.initContactAddress(sipProvider);        
        initSessionDescriptor();
        
    	callState = CallState.UA_OUTGOING_CALL;
    	
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);  
        
        // In case of incomplete url (e.g. only 'user' is present), 
        // try to complete it.       
        destination = sipProvider.completeNameAddress(destination).toString();
        log.debug("call {}", destination);  
        if (userProfile.noOffer) {
            call.call(destination);
        } else {
            call.call(destination, localSession);
        }
    }

    private void setupCallerDisplayName(String callerName, String destination) {
    	String fromURL = "\"" + callerName + "\" <sip:" + destination + "@" + clientRtpIp + ">";
    	userProfile.username = callerName;
    	userProfile.fromUrl = fromURL;
		userProfile.contactUrl = "sip:" + destination + "@" + clientRtpIp;
        if (sipProvider.getPort() != SipStack.default_port) {
            userProfile.contactUrl += ":" + sipProvider.getPort();
        }
    }
    
    /** Closes an ongoing, incoming, or pending call */
    public void hangup() {
    	if (callState == CallState.UA_IDLE) return;
    	log.debug("hangup");
    	if (listeningToGlobal) {
    		log.debug("Hanging up of a call connected to the global audio stream");
    		notifyListenersOfOnCallClosed();
    	} else {
    		closeVoiceStreams();
    		if (call != null) call.hangup();
    	}
    	callState = CallState.UA_IDLE; 
    }

    private DatagramSocket getLocalAudioSocket() throws Exception {
    	DatagramSocket socket = null;
    	boolean failedToGetSocket = true;
    	StringBuilder failedPorts = new StringBuilder("Failed ports: ");
    	
    	for (int i = portProvider.getStartAudioPort(); i <= portProvider.getStopAudioPort(); i++) {
    		int freePort = portProvider.getFreeAudioPort();
    		try {    			
        		socket = new DatagramSocket(freePort);
        		failedToGetSocket = false;
        		log.info("Successfully setup local audio port {}. {}", freePort, failedPorts);
        		break;
    		} catch (SocketException e) {
    			failedPorts.append(freePort + ", ");   			
    		}
    	}
    	
    	if (failedToGetSocket) {
			log.warn("Failed to setup local audio port {}.", failedPorts); 
    		throw new Exception("Exception while initializing CallStream");
    	}
    	
    	return socket;
    }

    private boolean isGlobalAudioStream() {
        return (_callerName != null && _callerName.startsWith("GLOBAL_AUDIO_"));
    }
    
    private void createVoiceStreams() {
        if (callStream != null) {            
        	log.debug("Media application is already running.");
            return;
        }
        
        SessionDescriptor localSdp = new SessionDescriptor(call.getLocalSessionDescriptor());        
        SessionDescriptor remoteSdp = new SessionDescriptor(call.getRemoteSessionDescriptor());
        String remoteMediaAddress = SessionDescriptorUtil.getRemoteMediaAddress(remoteSdp);
        int remoteAudioPort = SessionDescriptorUtil.getRemoteAudioPort(remoteSdp);
        int localAudioPort = SessionDescriptorUtil.getLocalAudioPort(localSdp);
    	
    	SipConnectInfo connInfo = new SipConnectInfo(localSocket, remoteMediaAddress, remoteAudioPort);
        try {
			localSocket.connect(InetAddress.getByName(remoteMediaAddress), remoteAudioPort);
	        log.debug("[localAudioPort=" + localAudioPort + ",remoteAudioPort=" + remoteAudioPort + "]");

	        if (userProfile.audio && localAudioPort != 0 && remoteAudioPort != 0) {
	            if ((callStream == null) && (sipCodec != null)) {               	
	            	try {
						callStream = callStreamFactory.createCallStream(sipCodec, connInfo);
						callStream.addCallStreamObserver(this);
						callStream.start();
						if (isGlobalAudioStream()) {
							GlobalCall.addGlobalAudioStream(_destination, callStream.getListenStreamName(), sipCodec, connInfo);
						} else {
							notifyListenersOnCallConnected(callStream.getTalkStreamName(), callStream.getListenStreamName());
						}
					} catch (Exception e) {
						log.error("Failed to create Call Stream.");
						System.out.println(StackTraceUtil.getStackTrace(e));
					}                
	            }
	        }
		} catch (UnknownHostException e1) {
			log.error(StackTraceUtil.getStackTrace(e1));
		}
    }

        
    public void startTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	try {
			callStream.startTalkStream(broadcastStream, scope);
		} catch (StreamException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}   	
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	if (callStream != null) {
    		callStream.stopTalkStream(broadcastStream, scope);   	
    	} else {
    		log.info("Can't stop talk stream as stream may have already stopped.");
    	}
    }


    
    public void connectToGlobalStream(String clientId, String callerIdName, String voiceConf) {
        listeningToGlobal = true;
        _destination = voiceConf;

        String globalAudioStreamName = GlobalCall.getGlobalAudioStream(voiceConf);
        while (globalAudioStreamName.equals("reserved")) {
            try {
                Thread.sleep(100);
            } catch (Exception e) {
            }
            globalAudioStreamName = GlobalCall.getGlobalAudioStream(voiceConf);
        }


		    
        GlobalCall.addUser(clientId, callerIdName, _destination);
        sipCodec = GlobalCall.getRoomCodec(voiceConf);
        callState = CallState.UA_ONCALL;
        notifyListenersOnCallConnected("", globalAudioStreamName);
        log.info("User is has connected to global audio, user=[" + callerIdName + "] voiceConf = [" + voiceConf + "]");
        messagingService.userConnectedToGlobalAudio(voiceConf, callerIdName);
        
    }
    
    private void closeVoiceStreams() {        
    	log.debug("Shutting down the voice streams.");         
      if (callStream != null) {
      	callStream.stop();
       	callStream = null;
       } else {
       	log.debug("Can't shutdown voice stream. callstream is NULL");
      }
    }

    // ********************** Call callback functions **********************
    private void createAudioCodec(SessionDescriptor newSdp) {
    	sipCodec = SdpUtils.getNegotiatedAudioCodec(newSdp);
    }
        
    private void setupSdpAndCodec(String sdp) {
    	SessionDescriptor remoteSdp = new SessionDescriptor(sdp);
        SessionDescriptor localSdp = new SessionDescriptor(localSession);
        
        log.debug("localSdp = " + localSdp.toString() + ".");
        log.debug("remoteSdp = " + remoteSdp.toString() + ".");
        
        // First we need to make payloads negotiation so the related attributes can be then matched.
        SessionDescriptor newSdp = SdpUtils.makeMediaPayloadsNegotiation(localSdp, remoteSdp);        
        createAudioCodec(newSdp);
        
        // Now we complete the SDP negotiation informing the selected 
        // codec, so it can be internally updated during the process.
        SdpUtils.completeSdpNegotiation(newSdp, localSdp, remoteSdp);
        localSession = newSdp.toString();
        
        log.debug("newSdp = " + localSession + "." );
        
        // Finally, we use the "newSdp" and "remoteSdp" to initialize the lasting codec informations.
        CodecUtils.initSipAudioCodec(sipCodec, userProfile.audioDefaultPacketization, 
                userProfile.audioDefaultPacketization, newSdp, remoteSdp);
    }


    /** Callback function called when arriving a 2xx (call accepted) 
     *  The user has managed to join the conference.
     */ 
    public void onCallAccepted(Call call, String sdp, Message resp) {        
    	log.debug("Received 200/OK. So user has successfully joined the conference.");        
    	if (!isCurrentCall(call)) return;
        callState = CallState.UA_ONCALL;
        setupSdpAndCodec(sdp);

        if (userProfile.noOffer) {
            // Answer with the local sdp.
            call.ackWithAnswer(localSession);
        }

        createVoiceStreams();
    }

    /** Callback function called when arriving an ACK method (call confirmed) */
    public void onCallConfirmed(Call call, String sdp, Message ack) {
    	log.debug("Received ACK. Hmmm...is this for when the server initiates the call????");
        
    	if (!isCurrentCall(call)) return;        
        callState = CallState.UA_ONCALL;
        createVoiceStreams();
    }

    /** Callback function called when arriving a 4xx (call failure) */
    public void onCallRefused(Call call, String reason, Message resp) {        
    	log.debug("Call has been refused.");        
    	if (!isCurrentCall(call)) return;
        callState = CallState.UA_IDLE;
        notifyListenersOnOutgoingCallFailed();
    }

    /** Callback function called when arriving a 3xx (call redirection) */
    public void onCallRedirection(Call call, String reason, Vector contact_list, Message resp) {        
    	log.debug("onCallRedirection");
        
    	if (!isCurrentCall(call)) return;
        call.call(((String) contact_list.elementAt(0)));
    }


    /**
     * Callback function that may be overloaded (extended). Called when arriving a CANCEL request
     */
    public void onCallCanceling(Call call, Message cancel) {
    	log.error("Server shouldn't cancel call...or does it???");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("Server has CANCEL-led the call.");
        callState = CallState.UA_IDLE;
        notifyListenersOfOnIncomingCallCancelled();
    }

    private void notifyListenersOnCallConnected(String talkStream, String listenStream) {
    	log.debug("notifyListenersOnCallConnected for {}", clientId);
    	clientConnManager.joinConferenceSuccess(clientId, talkStream, listenStream, sipCodec.getCodecName());
    }
  
    private void notifyListenersOnOutgoingCallFailed() {
    	log.debug("notifyListenersOnOutgoingCallFailed for {}", clientId);
    	clientConnManager.joinConferenceFailed(clientId);
    	cleanup();
    }

    
    private void notifyListenersOfOnIncomingCallCancelled() {
    	log.debug("notifyListenersOfOnIncomingCallCancelled for {}", clientId);
    }
    
    private void notifyListenersOfOnCallClosed() {
    	if (callState == CallState.UA_IDLE) return;

    	log.debug("notifyListenersOfOnCallClosed for {}", clientId);
    	clientConnManager.leaveConference(clientId);
    	cleanup();
    }
    
    private void cleanup() {
        if (localSocket == null) return;

        log.debug("Closing local audio port {}", localSocket.getLocalPort());
        if (!listeningToGlobal) {
            localSocket.close();
        }
    }
    
    /** Callback function called when arriving a BYE request */
    public void onCallClosing(Call call, Message bye) {
      log.info("Received a BYE from the other end telling us to hangup.");

      if (!isCurrentCall(call)) return;
      closeVoiceStreams();
      notifyListenersOfOnCallClosed();

      // FreeSWITCH initiated hangup of call. Hangup all listen only users.
      // ralam jan 24, 2019
      if (forceHangupGlobalAudioUsersListener != null) {
        log.info("Forcing hangup for listen only users of of voice conf {}.", getDestination());
        forceHangupGlobalAudioUsersListener.forceHangupGlobalAudioUsers(getDestination());
      }

      callState = CallState.UA_IDLE;

      // Reset local sdp for next call.
      initSessionDescriptor();
    }


    /**
     * Callback function called when arriving a response after a BYE request
     * (call closed)
     */
    public void onCallClosed(Call call, Message resp) {
    	log.debug("onCallClosed");
        
    	if (!isCurrentCall(call)) return;         
        log.debug("CLOSE/OK.");
        
        notifyListenersOfOnCallClosed();
        callState = CallState.UA_IDLE;
    }


    /** Callback function called when the invite expires */
    public void onCallTimeout(Call call) {        
    	log.debug("onCallTimeout");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("NOT FOUND/TIMEOUT.");
        callState = CallState.UA_IDLE;

        notifyListenersOnOutgoingCallFailed();
    }

    public void onCallStreamStopped() {
    	log.info("Call stream has been stopped");
    	notifyListenersOfOnCallClosed();
    }
    
    private boolean isCurrentCall(Call call) {
    	return this.call == call;
    }

    public void setForceHangupGlobalAudioUsersListener(ForceHangupGlobalAudioUsersListener listener) {
      forceHangupGlobalAudioUsersListener = listener;
    }

    public void setCallStreamFactory(CallStreamFactory csf) {
    	this.callStreamFactory = csf;
    }
    
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
}
