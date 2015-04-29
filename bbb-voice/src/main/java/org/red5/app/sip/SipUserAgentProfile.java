package org.red5.app.sip;

import org.red5.app.sip.codecs.Codec;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.tools.Configure;

public class SipUserAgentProfile {
    /**
     * User's AOR (Address Of Record), used also as From URL.
     * <p/>
     * The AOR is the SIP address used to register with the user's registrar
     * server (if requested). <br/>
     * The address of the registrar is taken from the hostport field of the AOR,
     * i.e. the value(s) host[:port] after the '@' character.
     * <p/>
     * If not defined (default), it equals the <i>contact_url</i> attribute.
     */
    public String fromUrl = null;

    /**
     * Contact URL. If not defined (default), it is formed by
     * sip:local_user@host_address:host_port
     */
    public String contactUrl = null;

    /** User's name (used to build the contact_url if not explitely defined) */
    public String username = null;

    /** User's realm. */
    public String realm = null;

    /** User's passwd. */
    public String passwd = null;

    /**
     * Path for the 'ua.jar' lib, used to retrive various UA media (gif, wav,
     * etc.) By default, it is used the "lib/ua.jar" folder
     */
//    public static String uaJar = "lib/ua.jar";

    /**
     * Path for the 'contacts.lst' file where save and load the VisualUA
     * contacts By default, it is used the "config/contacts.lst" folder
     */
    public static String contactsFile = "contacts.lst";

    /** Whether registering with the registrar server */
    public boolean doRegister = false;

    /** Whether unregistering the contact address */
    public boolean doUnregister = false;

    /**
     * Whether unregistering all contacts beafore registering the contact
     * address
     */
    public boolean doUnregisterAll = false;

    /** Expires time (in seconds). */
    public int expires = 3600;

    /**
     * Rate of keep-alive packets sent toward the registrar server (in
     * milliseconds). Set keepalive_time=0 to disable the sending of keep-alive
     * datagrams.
     */
    public long keepaliveTime = 8000;

    /**
     * Automatic call a remote user secified by the 'call_to' value. Use value
     * 'NONE' for manual calls (or let it undefined).
     */
    public String callTo = null;

    /**
     * Automatic answer time in seconds; time<0 corresponds to manual answer
     * mode.
     */
    public int acceptTime = 0;

    /**
     * Automatic hangup time (call duartion) in seconds; time<=0 corresponds to
     * manual hangup mode.
     */
    public int hangupTime = 20;

    /**
     * Automatic call transfer time in seconds; time<0 corresponds to no auto
     * transfer mode.
     */
    public int transferTime = -1;

    /**
     * Automatic re-inviting time in seconds; time<0 corresponds to no auto
     * re-invite mode.
     */
    public int reInviteTime = -1;

    /**
     * Redirect incoming call to the secified url. Use value 'NONE' for not
     * redirecting incoming calls (or let it undefined).
     */
    public String redirectTo = null;

    /**
     * Transfer calls to the secified url. Use value 'NONE' for not transferring
     * calls (or let it undefined).
     */
    public String transferTo = null;

    /** No offer in the invite */
    public boolean noOffer = false;

    /** Do not use prompt */
    public boolean noPrompt = false;

    /** Whether using audio */
    public boolean audio = true;

    /** Whether using video */
    public boolean video = false;

    /** Whether playing in receive only mode */
    public boolean recvOnly = false;

    /** Whether playing in send only mode */
    public boolean sendOnly = false;

    /** Whether playing a test tone in send only mode */
    public boolean sendTone = false;

    /** Audio file to be played */
    public String sendFile = null;

    /** Audio file to be recorded */
    public String recvFile = null;

    /** Audio port */
    public int audioPort = 21000;

    /** Audio packetization */
    public int audioDefaultPacketization = Codec.DEFAULT_PACKETIZATION;

    /** Video port */
    public int videoPort = 21070;

    /** Whether using JMF for audio/video streaming */
    public boolean useJMF = false;

    /** Whether using RAT (Robust Audio Tool) as audio sender/receiver */
    public boolean useRAT = false;

    /** Whether using VIC (Video Conferencing Tool) as video sender/receiver */
    public boolean useVIC = false;

    /** RAT command-line executable */
    public String binRAT = "rat";

    /** VIC command-line executable */
    public String binVIC = "vic";

    public String audioCodecsPrecedence = "8;18;0;110;111";
    //public String audioCodecsPrecedence = "";


    // ************************** Costructors *************************

    /** Costructs a void UserProfile */
    public SipUserAgentProfile() {

        init();
    }


    /** Inits the SIPUserAgentProfile */
    private void init() {

        if ( realm == null && contactUrl != null ) {
            realm = new NameAddress( contactUrl ).getAddress().getHost();
        }
        if ( username == null ) {
            username = ( contactUrl != null ) ? new NameAddress( contactUrl ).getAddress().getUserName() : "user";
        }
        if ( callTo != null && callTo.equalsIgnoreCase( Configure.NONE ) ) {
            callTo = null;
        }
        if ( redirectTo != null && redirectTo.equalsIgnoreCase( Configure.NONE ) ) {
            redirectTo = null;
        }
        if ( transferTo != null && transferTo.equalsIgnoreCase( Configure.NONE ) ) {
            transferTo = null;
        }
        if ( sendFile != null && sendFile.equalsIgnoreCase( Configure.NONE ) ) {
            sendFile = null;
        }
        if ( recvFile != null && recvFile.equalsIgnoreCase( Configure.NONE ) ) {
            recvFile = null;
        }
    }


    // ************************ Public methods ************************

    /**
     * Sets contact_url and from_url with transport information.
     * <p/>
     * This method actually sets contact_url and from_url only if they haven't
     * still been explicitly initilized.
     */
    public void initContactAddress( SipProvider sip_provider ) { // contact_url

        if ( contactUrl == null ) {

            contactUrl = "sip:" + username + "@" + sip_provider.getViaAddress();
            if ( sip_provider.getPort() != SipStack.default_port ) {
                contactUrl += ":" + sip_provider.getPort();
            }
            if ( !sip_provider.getDefaultTransport().equals( SipProvider.PROTO_UDP ) ) {
                contactUrl += ";transport=" + sip_provider.getDefaultTransport();
            }
        }
        // from_url
        if ( fromUrl == null ) {
            fromUrl = contactUrl;
        }
    }
}
