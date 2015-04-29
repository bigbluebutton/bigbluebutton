package org.red5.app.sip.registration;

import local.net.KeepAliveSip;
import org.zoolu.net.SocketAddress;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.header.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.transaction.TransactionClient;
import org.zoolu.sip.transaction.TransactionClientListener;
import org.zoolu.sip.authentication.DigestAuthentication;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.util.HashSet;
import java.util.Set;
import java.util.Vector;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Register User Agent. It registers (one time or periodically) a contact
 * address with a registrar server.
 */
public class SipRegisterAgent implements TransactionClientListener {
	private static Logger log = Red5LoggerFactory.getLogger(SipRegisterAgent.class, "sip");
	
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable registerProcess;
	private volatile boolean continueRegistering = false;
	
	/** The CallerID and CSeq that should be used during REGISTER method */
	private CallIdHeader registerCallID;
	private int registerCSeq;

	private static final int MAX_ATTEMPTS = 3;
	private Status agentStatus = Status.UNREGISTERED;
	private Request request;
	
	private enum Status {
    	REGISTERING(0), REGISTERED(1), RENEWING(2), UNREGISTERING(3), UNREGISTERED(4);    	
    	private final int state;
    	Status(int state) {this.state = state;}
    	private int getState() {return state;}
    }
	
	private enum Request {
    	REGISTERING(0), RENEWING(1), UNREGISTERING(1);    	
    	private final int request;
    	Request(int request) {this.request = request;}
    	private int getRequest() {return request;}
    }
	
	private Set<SipRegisterAgentListener> listeners = new HashSet<SipRegisterAgentListener>();

	private SipProvider sipProvider;	
	private NameAddress target; 			// User's URI with the fully qualified domain 
											// name of the registrar server. 
	private String username;
	private String realm;
	private String passwd;	
	private String nextNonce; 				// Nonce for the next authentication.
	private String qop; 					// Qop for the next authentication. 	
	private NameAddress contact; 			// User's contact address. 	
	private int expireTime;					// Expiration time. 
	private int renewTime;	
	private int origRenewTime;				// Change by lior.
	private int minRenewTime = 20;
	private boolean lastRegFailed = false; 	// Changed by Lior.
	private boolean regInprocess = false;	
	private int attempts; 					// Number of registration attempts.	
	private KeepAliveSip keepAlive; 		// KeepAliveSip daemon. 

	public SipRegisterAgent(SipProvider sipProvider, String targetUrl, String contactUrl) {
		init(sipProvider, targetUrl, contactUrl);
	}

	/**
	 * Creates a new RegisterAgent with authentication credentials (i.e.
	 * username, realm, and passwd).
	 */
	public SipRegisterAgent(SipProvider sipProvider, String targetUrl,
			String contactUrl, String username, String realm, String passwd) {

		init(sipProvider, targetUrl, contactUrl);

		// Authentication.
		this.username = username;
		this.realm = realm;
		this.passwd = passwd;
	}

	private void init(SipProvider sipProvider, String targetUrl, String contactUrl) {
		this.sipProvider = sipProvider;
		this.target = new NameAddress(targetUrl);
		this.contact = new NameAddress(contactUrl);
		// this.expire_time=SipStack.default_expires;
		this.expireTime = 600;
		// Changed by Lior.
		this.renewTime = 600;
		this.origRenewTime = this.renewTime;
		this.keepAlive = null;
		// Authentication.
		this.username = null;
		this.realm = null;
		this.passwd = null;
		this.nextNonce = null;
		this.qop = null;
		this.attempts = 0;
		this.minRenewTime = 20;
		this.registerCallID = null;
		this.registerCSeq = 0;
	}

	public void addListener(SipRegisterAgentListener listener) {
		listeners.add(listener);
	}
    
    public void removeListener(SipRegisterAgentListener listener) {
		listeners.remove(listener);
	}
    
	private boolean isPeriodicallyRegistering() {
		return continueRegistering;
	}

	private void register() {
		register(expireTime);
	}

	/** Registers with the registrar server for <i>expire_time</i> seconds. */
	private void register(int expireTime) {
		if (agentStatus == Status.REGISTERED) {
			request = Request.RENEWING;
		} else {
			request = Request.REGISTERING;
		}
		
		attempts = 0;
		lastRegFailed = false;
		regInprocess = true;
		
		if (expireTime > 0) this.expireTime = expireTime;
		
		Message req = MessageFactory.createRegisterRequest(sipProvider, target, target, contact);

		/*
		 * MY_FIX: registerCallID contains the CallerID randomly generated in
		 * the first REGISTER method. It will be reused for all successive
		 * REGISTER invocations
		 */
		if (this.registerCallID == null) {
			this.registerCallID = req.getCallIdHeader();
		} else {
			req.setCallIdHeader(this.registerCallID);
		}

		/*
		 * MY_FIX: the registerCSeq must be unique for a given CallerID
		 */
		this.registerCSeq++;
		req.setCSeqHeader(new CSeqHeader(this.registerCSeq, SipMethods.REGISTER));

		req.setExpiresHeader(new ExpiresHeader(String.valueOf(expireTime)));
		
		if (nextNonce != null) {
			AuthorizationHeader authHeader = new AuthorizationHeader("Digest");
			authHeader.addUsernameParam(username);
			authHeader.addRealmParam(realm);
			authHeader.addNonceParam(nextNonce);
			authHeader.addUriParam(req.getRequestLine().getAddress().toString());
			authHeader.addQopParam(qop);
			
			String response = (new DigestAuthentication(SipMethods.REGISTER,
					authHeader, null, passwd)).getResponse();
			authHeader.addResponseParam(response);
			
			req.setAuthorizationHeader(authHeader);
		}
		
		if (expireTime > 0)
			printLog("Registering contact " + contact + " (it expires in " + expireTime + " secs)");
		else
			printLog("Unregistering contact " + contact);
		
		TransactionClient t = new TransactionClient(sipProvider, req, this);
		t.request();
	}

	public void unregister() {
		if (isPeriodicallyRegistering()) {
			stopRegistering();
		}
		unregisterWithServer();
		sipProvider = null;
	}

	private void unregisterWithServer() {
		attempts = 0;
		request = Request.UNREGISTERING;
		
		Message req = MessageFactory.createRegisterRequest(sipProvider, target, target, null);
		req.setExpiresHeader(new ExpiresHeader(String.valueOf(0)));
		printLog("Unregistering all contacts");
		TransactionClient t = new TransactionClient(sipProvider, req, this);
		t.request();
	}

	/**
	 * Periodically registers with the registrar server.
	 * 
	 * @param expireTime
	 *            expiration time in seconds
	 * @param renewTime
	 *            renew time in seconds
	 */
	private void loopRegister(int expireTime, int renewTime) {
		this.expireTime = expireTime;
		this.renewTime = renewTime;
	
		if (!isPeriodicallyRegistering()) {
			registerProcess = new Runnable() {
				public void run() {
					registerWithServer();
				}
			};
			exec.execute(registerProcess);
		}
	}

	/**
	 * Periodically registers with the registrar server.
	 * 
	 * @param expireTime
	 *            expiration time in seconds
	 * @param renewTime
	 *            renew time in seconds
	 * @param keepaliveTime
	 *            keep-alive packet rate (inter-arrival time) in milliseconds
	 */
	public void register(int expireTime, int renewTime, long keepaliveTime) {
		if (isPeriodicallyRegistering()) {
			stopRegistering();
		}
		
		loopRegister(expireTime, renewTime);
		// Keep-alive.
		if (keepaliveTime > 0) {
			SipURL targetUrl = target.getAddress();
			String targetHost = targetUrl.getHost();
			int targePort = targetUrl.getPort();
			if (targePort < 0) targePort = SipStack.default_port;
			
			SocketAddress socket = new SocketAddress(targetHost, targePort);
			keepAlive = new KeepAliveSip(sipProvider, socket, null, keepaliveTime);
		}
	}

	public void stopRegistering() {
		continueRegistering = false;
		if (keepAlive != null)
			keepAlive.halt();
	}

	// ***************************** run() *****************************

	/** Run method */
	private void registerWithServer() {
		continueRegistering = true;
		try {
			while (continueRegistering) {
				register();
				// Changed by Lior.
				long waitCnt = 0;
				while (regInprocess) {
					Thread.sleep(1000);
					waitCnt += 1000;
				}

				if (lastRegFailed) {
					printLog("Failed Registration stop try.");
					stopRegistering();
				} else
					Thread.sleep(renewTime * 1000 - waitCnt);
			}
		} catch (Exception e) {
			printException(e);
		}
		continueRegistering = false;
	}

	// **************** Transaction callback functions *****************

	/** Callback function called when client sends back a failure response. */

	/** Callback function called when client sends back a provisional response. */
	public void onTransProvisionalResponse(TransactionClient transaction, Message resp) { 
		// do nothing...
	}

	/** Callback function called when client sends back a success response. */
	public void onTransSuccessResponse(TransactionClient transaction, Message resp) {
		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {
			if (resp.hasAuthenticationInfoHeader()) {
				nextNonce = resp.getAuthenticationInfoHeader().getNextnonceParam();
			}
			StatusLine status = resp.getStatusLine();
			String result = status.getCode() + " " + status.getReason();

			// Update the renew_time.
			// Changed by Lior.
			int expires = 0;
			
			if (resp.hasExpiresHeader()) {
				expires = resp.getExpiresHeader().getDeltaSeconds();
			} else if (resp.hasContactHeader()) {
				// Look for the max expires - should be the latest.
				Vector contacts = resp.getContacts().getHeaders();
				for (int i = 0; i < contacts.size(); i++) {
					int exp_i = (new ContactHeader((Header) contacts.elementAt(i))).getExpires();
					if (exp_i / 2 > expires)
						expires = exp_i / 2;
				}
			}
			
			if (expires > 0 && expires < renewTime) {
				renewTime = expires;
				if (renewTime < minRenewTime) {
					printLog("Attempt to set renew time below min renew. Attempted="
							+ renewTime + " min=" + minRenewTime + "\r\nResponse=" + resp.toString());
					renewTime = minRenewTime;
				}
			} else if (expires > origRenewTime) {
				printLog("Attempt to set renew time above original renew. Attempted="
						+ expires + " origrenew=" + origRenewTime + "\r\nResponse=" + resp.toString());
			}

			printLog("Registration success: " + result);
			regInprocess = false;
			
			if (request == Request.REGISTERING) {
				printLog("Notifying listeners of REGISTRATION success");
				agentStatus = Status.REGISTERED;
				notifyListenersOfRegistrationSuccess("REGISTERED");
			} else if (request == Request.UNREGISTERING){
				printLog("Notifying listeners of UNREGISTRATION success");
				agentStatus = Status.UNREGISTERED;
				notifyListenersOfRegistrationSuccess("UNREGISTERED");
			} else if (request == Request.RENEWING) {
				agentStatus = Status.REGISTERED;
				// Don't notify the listeners.
				printLog("NOT Notifying listeners of RENEW success");
			}			
		}
	}
	
	private void notifyListenersOfRegistrationSuccess(String result) {
		for (SipRegisterAgentListener listener : listeners) {
    		listener.onRegistrationSuccess(result);
    	}
	}

	/** Callback function called when client sends back a failure response. */
	public void onTransFailureResponse(TransactionClient transaction, Message resp) {
		printLog("onTransFailureResponse start: ");
		
		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {
			StatusLine status = resp.getStatusLine();
			int code = status.getCode();
			if ((code == 401 && attempts < MAX_ATTEMPTS && resp.hasWwwAuthenticateHeader() 
					&& resp.getWwwAuthenticateHeader().getRealmParam().equalsIgnoreCase(realm))
				|| (code == 407 && attempts < MAX_ATTEMPTS && resp.hasProxyAuthenticateHeader() 
					&& resp.getProxyAuthenticateHeader().getRealmParam().equalsIgnoreCase(realm)))
			{
				printLog("onTransFailureResponse 401 or 407: ");

				attempts++;
				Message req = transaction.getRequestMessage();
				req.setCSeqHeader(req.getCSeqHeader().incSequenceNumber());
				// * MY_FIX: registerCSeq counter must incremented.
				this.registerCSeq++;

				WwwAuthenticateHeader wwwAuthHeader;
				if (code == 401)
					wwwAuthHeader = resp.getWwwAuthenticateHeader();
				else
					wwwAuthHeader = resp.getProxyAuthenticateHeader();

				String qopOptions = wwwAuthHeader.getQopOptionsParam();
				// qop=(qopOptions!=null)? "auth" : null;

				// Select a new branch - rfc3261 says should be new on each  request.
				ViaHeader via = req.getViaHeader();
				req.removeViaHeader();
				via.setBranch(SipProvider.pickBranch());
				req.addViaHeader(via);
				qop = (qopOptions != null) ? "auth" : null;

				DigestAuthentication digest = new DigestAuthentication(SipMethods.REGISTER, 
						req.getRequestLine().getAddress().toString(), wwwAuthHeader, qop, null, username, passwd);
				
				AuthorizationHeader authHeader;
				if (code == 401)
					authHeader = digest.getAuthorizationHeader();
				else
					authHeader = digest.getProxyAuthorizationHeader();

				req.setAuthorizationHeader(authHeader);
				TransactionClient t = new TransactionClient(sipProvider, req, this);
				t.request();

			} else {
				String result = code + " " + status.getReason();
				lastRegFailed = true;
				regInprocess = false;
				
				printLog("Registration failure: " + result);
				notifyListenersOfRegistrationFailure(result);
			}
		}
	}
	
	private void notifyListenersOfRegistrationFailure(String result) {
		for (SipRegisterAgentListener listener : listeners) {
    		listener.onRegistrationFailure(result);
    	}
	}

	/** Callback function called when client expires timeout. */
	public void onTransTimeout(TransactionClient transaction) {
		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {	
			lastRegFailed = true;
			regInprocess = false;
			
			printLog("Registration failure: No response from server.");
			notifyListenersOfRegistrationFailure( "Timeout");
		}
	}

	// ****************************** Logs *****************************

	void printLog(String str) {
		System.out.println("RegisterAgent: " + str);
	}

	void printException(Exception e) {
		System.out.println("RegisterAgent Exception: " + e);
	}

}
