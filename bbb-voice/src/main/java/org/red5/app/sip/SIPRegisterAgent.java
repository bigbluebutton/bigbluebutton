package org.red5.app.sip;

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

import java.util.Vector;

/**
 * Register User Agent. It registers (one time or periodically) a contact
 * address with a registrar server.
 */
public class SIPRegisterAgent implements Runnable, TransactionClientListener {

	/** The CallerID and CSeq that should be used during REGISTER method */
	private CallIdHeader registerCallID;
	private int registerCSeq;

	/** Max number of registration attempts. */
	static final int MAX_ATTEMPTS = 3;

	/** RegisterAgent listener */
	SIPRegisterAgentListener listener;

	/** SipProvider */
	SipProvider sipProvider;

	/** User's URI with the fully qualified domain name of the registrar server. */
	NameAddress target;

	/** User name. */
	String username;

	/** User name. */
	String realm;

	/** User's passwd. */
	String passwd;

	/** Nonce for the next authentication. */
	String nextNonce;

	/** Qop for the next authentication. */
	String qop;

	/** User's contact address. */
	NameAddress contact;

	/** Expiration time. */
	int expireTime;

	/** Renew time. */
	int renewTime;
	// Change by lior.
	int origRenewTime;

	int minRenewTime = 20;
	int regFailRetryTime = 15;

	/** Whether keep on registering. */
	boolean loop;
	// Changed by Lior.
	boolean lastRegFailed = false;
	boolean regInprocess = false;

	/** Whether the thread is running. */
	boolean isRunning;

	/** Event logger. */
	private static Logger log = Red5LoggerFactory.getLogger(SIPRegisterAgent.class, "sip");

	/** Number of registration attempts. */
	int attempts;

	/** KeepAliveSip daemon. */
	KeepAliveSip keepAlive;

	/** Creates a new RegisterAgent. */
	public SIPRegisterAgent(
			SipProvider sipProvider,
			String targetUrl,
			String contactUrl,
			SIPRegisterAgentListener listener) {

		init(sipProvider, targetUrl, contactUrl, listener);
	}

	/**
	 * Creates a new RegisterAgent with authentication credentials (i.e.
	 * username, realm, and passwd).
	 */
	public SIPRegisterAgent(
			SipProvider sipProvider,
			String targetUrl,
			String contactUrl,
			String username,
			String realm,
			String passwd,
			SIPRegisterAgentListener listener) {

		init(sipProvider, targetUrl, contactUrl, listener);

		// Authentication.
		this.username = username;
		this.realm = realm;
		this.passwd = passwd;
	}

	/** Inits the RegisterAgent. */
	private void init(
			SipProvider sipProvider, 
			String targetUrl,
			String contactUrl, 
			SIPRegisterAgentListener listener) {

		this.listener = listener;
		this.sipProvider = sipProvider;
		this.target = new NameAddress(targetUrl);
		this.contact = new NameAddress(contactUrl);
		// this.expire_time=SipStack.default_expires;
		this.expireTime = 600;
		// Changed by Lior.
		this.renewTime = 600;
		this.origRenewTime = this.renewTime;
		this.isRunning = false;
		this.keepAlive = null;
		// Authentication.
		this.username = null;
		this.realm = null;
		this.passwd = null;
		this.nextNonce = null;
		this.qop = null;
		this.attempts = 0;
		this.minRenewTime = 20;
		this.regFailRetryTime = 5;

		this.registerCallID = null;
		this.registerCSeq = 0;

	}

	/** Whether it is periodically registering. */
	public boolean isRegistering() {
		return isRunning;
	}

	/** Registers with the registrar server. */
	public void register() {
		register(expireTime);
	}

	/** Registers with the registrar server for <i>expire_time</i> seconds. */
	public void register(int expireTime) {
		attempts = 0;
		lastRegFailed = false;
		regInprocess = true;
		if (expireTime > 0)
			this.expireTime = expireTime;
		Message req = MessageFactory.createRegisterRequest(
				sipProvider, target, target, contact);

		/*
		 * MY_FIX: registerCallID contains the CallerID randomly generated in
		 * the first REGISTER method. It will be reused for all successive
		 * REGISTER invocations
		 */
		if (this.registerCallID == null)
			this.registerCallID = req.getCallIdHeader();
		else
			req.setCallIdHeader(this.registerCallID);

		/*
		 * MY_FIX: the registerCSeq must be unique for a given CallerID
		 */
		this.registerCSeq++;
		req.setCSeqHeader(new CSeqHeader(this.registerCSeq, SipMethods.REGISTER));

		req.setExpiresHeader(new ExpiresHeader(String.valueOf(expireTime)));
		if (nextNonce != null) {
			AuthorizationHeader ah = new AuthorizationHeader("Digest");
			SipURL targetUrl = target.getAddress();
			ah.addUsernameParam(username);
			ah.addRealmParam(realm);
			ah.addNonceParam(nextNonce);
			ah.addUriParam(req.getRequestLine().getAddress().toString());
			ah.addQopParam(qop);
			String response = (new DigestAuthentication(SipMethods.REGISTER,
					ah, null, passwd)).getResponse();
			ah.addResponseParam(response);
			req.setAuthorizationHeader(ah);
		}
		if (expireTime > 0)
			printLog("Registering contact " + contact + " (it expires in "
					+ expireTime + " secs)");
		else
			printLog("Unregistering contact " + contact);
		TransactionClient t = new TransactionClient(sipProvider, req, this);
		t.request();
	}

	/** Unregister with the registrar server */
	public void unregister() {
		register(0);
		sipProvider = null;
		listener = null;
	}

	/** Unregister all contacts with the registrar server */
	public void unregisterall() {
		attempts = 0;
		NameAddress user = new NameAddress(target);
		Message req = MessageFactory.createRegisterRequest(sipProvider,
				target, target, null);
		// ContactHeader contact_star=new ContactHeader(); // contact is *
		// req.setContactHeader(contact_star);
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
	public void loopRegister(int expireTime, int renewTime) {
		this.expireTime = expireTime;
		this.renewTime = renewTime;
		loop = true;
		if (!isRunning)
			(new Thread(this, this.getClass().getName())).start();
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
	public void loopRegister(int expireTime, int renewTime,
			long keepaliveTime) {
		loopRegister(expireTime, renewTime);
		// Keep-alive.
		if (keepaliveTime > 0) {
			SipURL targetUrl = target.getAddress();
			String targetHost = targetUrl.getHost();
			int targePort = targetUrl.getPort();
			if (targePort < 0)
				targePort = SipStack.default_port;
			keepAlive = new KeepAliveSip(sipProvider, new SocketAddress(
					targetHost, targePort), null, keepaliveTime);
		}
	}

	/** Halts the periodic registration. */
	public void halt() {
		if (isRunning)
			loop = false;
		if (keepAlive != null)
			keepAlive.halt();
	}

	// ***************************** run() *****************************

	/** Run method */
	public void run() {
		isRunning = true;
		try {
			while (loop) {
				register();
				// Changed by Lior.
				long waitCnt = 0;
				while (regInprocess) {
					Thread.sleep(1000);
					waitCnt += 1000;
				}

				if (lastRegFailed) {
					printLog("Failed Registration stop try.");
					// Thread.sleep(regFailRetryTime*1000);
					halt();
				} else
					Thread.sleep(renewTime * 1000 - waitCnt);
			}
		} catch (Exception e) {
			printException(e);
		}
		isRunning = false;
	}

	// **************** Transaction callback functions *****************

	/** Callback function called when client sends back a failure response. */

	/** Callback function called when client sends back a provisional response. */
	public void onTransProvisionalResponse(TransactionClient transaction,
			Message resp) { // do nothing...
	}

	/** Callback function called when client sends back a success response. */
	public void onTransSuccessResponse(TransactionClient transaction,
			Message resp) {
		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {
			if (resp.hasAuthenticationInfoHeader()) {
				nextNonce = resp.getAuthenticationInfoHeader()
						.getNextnonceParam();
			}
			StatusLine status = resp.getStatusLine();
			String result = status.getCode() + " " + status.getReason();

			// Update the renew_time.
			// Changed by Lior.
			int expires = 0;
			// int newRenew=0;
			if (resp.hasExpiresHeader()) {
				expires = resp.getExpiresHeader().getDeltaSeconds();
				// {
				// newRenew=resp.getExpiresHeader().getDeltaSeconds();
			} else if (resp.hasContactHeader())
			// Look for the max expires - should be the latest.
			{
				Vector contacts = resp.getContacts().getHeaders();
				for (int i = 0; i < contacts.size(); i++) {
					int exp_i = (new ContactHeader((Header) contacts
							.elementAt(i))).getExpires();
					// if (exp_i>0 && (expires==0 || exp_i<expires))
					// expires=exp_i;
					// {
					// newRenew=(new
					// ContactHeader((Header)contacts.elementAt(i))).getExpires();
					if (exp_i / 2 > expires)
						expires = exp_i / 2;
				}
			}
			// if (expires>0 && expires<renew_time) renew_time=expires;

			// printLog("Registration success: ");
			// if (listener!=null)
			// listener.onUaRegistrationSuccess(this,target,contact,result);
			// }
			// }
			// if (newRenew>0 && newRenew<renew_time)
			if (expires > 0 && expires < renewTime) {
				renewTime = expires;
				if (renewTime < minRenewTime) {
					printLog("Attempt to set renew time below min renew. Attempted="
							+ renewTime
							+ " min="
							+ minRenewTime
							+ "\r\nResponse=" + resp.toString());
					renewTime = minRenewTime;
				}
			} else if (expires > origRenewTime) {
				printLog("Attempt to set renew time above original renew. Attempted="
						+ expires
						+ " origrenew="
						+ origRenewTime
						+ "\r\nResponse=" + resp.toString());
			}

			printLog("Registration success: ");
			regInprocess = false;
			if (listener != null)
				listener.onUaRegistrationSuccess(this, target, contact, result);

		}
	}

	/** Callback function called when client sends back a failure response. */
	public void onTransFailureResponse(TransactionClient transaction,
			Message resp) {
		printLog("onTransFailureResponse start: ");

		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {
			StatusLine status = resp.getStatusLine();
			int code = status.getCode();
			if ((code == 401 && attempts < MAX_ATTEMPTS
					&& resp.hasWwwAuthenticateHeader() && 
					resp.getWwwAuthenticateHeader().getRealmParam()
						.equalsIgnoreCase(realm))
				|| (code == 407 && attempts < MAX_ATTEMPTS
					&& resp.hasProxyAuthenticateHeader() && 
					resp.getProxyAuthenticateHeader().getRealmParam()
						.equalsIgnoreCase(realm)))
			{
				printLog("onTransFailureResponse 401 or 407: ");

				attempts++;
				Message req = transaction.getRequestMessage();
				req.setCSeqHeader(req.getCSeqHeader().incSequenceNumber());
				// * MY_FIX: registerCSeq counter must incremented.
				this.registerCSeq++;

				WwwAuthenticateHeader wah;
				if (code == 401)
					wah = resp.getWwwAuthenticateHeader();
				else
					wah = resp.getProxyAuthenticateHeader();

				String qopOptions = wah.getQopOptionsParam();
				// qop=(qopOptions!=null)? "auth" : null;

				// Select a new branch - rfc3261 says should be new on each 
				// request.
				ViaHeader via = req.getViaHeader();
				req.removeViaHeader();
				via.setBranch(SipProvider.pickBranch());
				req.addViaHeader(via);
				qop = (qopOptions != null) ? "auth" : null;

				DigestAuthentication digest = new DigestAuthentication(
						SipMethods.REGISTER, 
						req.getRequestLine().getAddress().toString(), 
						wah, qop, null, username, passwd);
				AuthorizationHeader ah;
				if (code == 401)
					ah = digest.getAuthorizationHeader();
				else
					ah = digest.getProxyAuthorizationHeader();

				req.setAuthorizationHeader(ah);
				TransactionClient t = new TransactionClient(
						sipProvider, req, this);
				t.request();

			} else {
				String result = code + " " + status.getReason();
				lastRegFailed = true;
				regInprocess = false;
				if (listener == null)
					printLog("Registration failure: " + result);
				else
					printLog("Registration failure: " + result);
				if (listener != null)
					listener.onUaRegistrationFailure(
							this, target, contact, result);
			}
		}
	}

	/** Callback function called when client expires timeout. */
	public void onTransTimeout(TransactionClient transaction) {
		if (transaction.getTransactionMethod().equals(SipMethods.REGISTER)) {
			if (listener == null)
				printLog("Registration failure: No response from server.");
			else
				printLog("Registration failure: No response from server.");
			lastRegFailed = true;
			regInprocess = false;
			if (listener != null)
				listener.onUaRegistrationFailure(
						this, target, contact, "Timeout");
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
