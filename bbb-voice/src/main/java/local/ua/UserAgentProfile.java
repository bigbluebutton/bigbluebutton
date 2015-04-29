package local.ua;


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.tools.Configure;
import org.zoolu.tools.Parser;


/** UserProfile maintains the user configuration
  */
public class UserAgentProfile extends Configure
{
   /** The default configuration file */
   private static String config_file="mjsip.cfg";

       
   // ********************** user configurations *********************

   /** User's AOR (Address Of Record), used also as From URL.
     * <p/>
     * The AOR is the SIP address used to register with the user's registrar server
     * (if requested).
     * <br/> The address of the registrar is taken from the hostport field of the AOR,
     * i.e. the value(s) host[:port] after the '@' character.
     * <p/>
     * If not defined (default), it equals the <i>contact_url</i> attribute. */
   public String from_url=null;
   /** Contact URL.
     * If not defined (default), it is formed by sip:local_user@host_address:host_port */
   public String contact_url=null;
   /** User's name (used to build the contact_url if not explitely defined) */
   public String username=null;
   /** User's realm. */
   public String realm=null;
   /** User's passwd. */
   public String passwd=null;
   /** Path for the 'ua.jar' lib, used to retrive various UA media (gif, wav, etc.)
     * By default, it is used the "lib/ua.jar" folder */
   public static String ua_jar="lib/ua.jar";
   /** Path for the 'contacts.lst' file where save and load the VisualUA contacts
     * By default, it is used the "config/contacts.lst" folder */
   public static String contacts_file="contacts.lst";

   /** Whether registering with the registrar server */
   public boolean do_register=false;
   /** Whether unregistering the contact address */
   public boolean do_unregister=false;
   /** Whether unregistering all contacts beafore registering the contact address */
   public boolean do_unregister_all=false;
   /** Expires time (in seconds). */
   public int expires=3600;

   /** Rate of keep-alive packets sent toward the registrar server (in milliseconds).
     * Set keepalive_time=0 to disable the sending of keep-alive datagrams. */
   public long keepalive_time=0;


   /** Automatic call a remote user secified by the 'call_to' value.
     * Use value 'NONE' for manual calls (or let it undefined).  */
   public String call_to=null;      
   /** Automatic answer time in seconds; time<0 corresponds to manual answer mode. */
   public int accept_time=-1;        
   /** Automatic hangup time (call duartion) in seconds; time<=0 corresponds to manual hangup mode. */
   public int hangup_time=-1;
   /** Automatic call transfer time in seconds; time<0 corresponds to no auto transfer mode. */
   public int transfer_time=-1;
   /** Automatic re-inviting time in seconds; time<0 corresponds to no auto re-invite mode.  */
   public int re_invite_time=-1;

   /** Redirect incoming call to the secified url.
     * Use value 'NONE' for not redirecting incoming calls (or let it undefined). */
   public String redirect_to=null;

   /** Transfer calls to the secified url.
     * Use value 'NONE' for not transferring calls (or let it undefined). */
   public String transfer_to=null;

   /** No offer in the invite */
   public boolean no_offer=false;
   /** Do not use prompt */
   public boolean no_prompt=false;
   
   /** Whether using audio */
   public boolean audio=false;
   /** Whether using video */
   public boolean video=false;

   /** Whether playing in receive only mode */
   public boolean recv_only=false;
   /** Whether playing in send only mode */
   public boolean send_only=false;
   /** Whether playing a test tone in send only mode */
   public boolean send_tone=false;
   /** Audio file to be played */
   public String send_file=null;
   /** Audio file to be recorded */
   public String recv_file=null;

   /** Audio port */
   public int audio_port=21000;
   /** Audio avp */
   public int audio_avp=0;
   /** Audio codec */
   public String audio_codec="PCMU";
   /** Audio sample rate */
   public int audio_sample_rate=8000;
   /** Audio sample size */
   public int audio_sample_size=1;
   /** Audio frame size */
   public int audio_frame_size=160;
   
   /** Video port */
   public int video_port=21070;
   /** Video avp */
   public int video_avp=17;

   /** Whether using JMF for audio/video streaming */
   public boolean use_jmf=false;
   /** Whether using RAT (Robust Audio Tool) as audio sender/receiver */
   public boolean use_rat=false;
   /** Whether using VIC (Video Conferencing Tool) as video sender/receiver */
   public boolean use_vic=false;
   /** RAT command-line executable */
   public String bin_rat="rat";
   /** VIC command-line executable */
   public String bin_vic="vic";
   
   // ************************** Costructors *************************
   
   /** Costructs a void UserProfile */
   public UserAgentProfile()
   {  init();
   }

   /** Costructs a new UserAgentProfile */
   public UserAgentProfile(String file)
   {  // load configuration
      loadFile(file);
      // post-load manipulation     
      init();
   }

   /** Inits the UserAgentProfile */
   private void init()
   {  if (realm==null && contact_url!=null) realm=new NameAddress(contact_url).getAddress().getHost();
      if (username==null) username=(contact_url!=null)? new NameAddress(contact_url).getAddress().getUserName() : "user";
      if (call_to!=null && call_to.equalsIgnoreCase(Configure.NONE)) call_to=null;
      if (redirect_to!=null && redirect_to.equalsIgnoreCase(Configure.NONE)) redirect_to=null;
      if (transfer_to!=null && transfer_to.equalsIgnoreCase(Configure.NONE)) transfer_to=null;
      if (send_file!=null && send_file.equalsIgnoreCase(Configure.NONE)) send_file=null;
      if (recv_file!=null && recv_file.equalsIgnoreCase(Configure.NONE)) recv_file=null;
   }  


   // ************************ Public methods ************************

   /** Sets contact_url and from_url with transport information.
     * <p/>
     * This method actually sets contact_url and from_url only if
     * they haven't still been explicitly initilized.
     */
   public void initContactAddress(SipProvider sip_provider)
   {  // contact_url
      if (contact_url==null)
      {  contact_url="sip:"+username+"@"+sip_provider.getViaAddress();
         if (sip_provider.getPort()!=SipStack.default_port) contact_url+=":"+sip_provider.getPort();
         if (!sip_provider.getDefaultTransport().equals(SipProvider.PROTO_UDP)) contact_url+=";transport="+sip_provider.getDefaultTransport();
      }
      // from_url
      if (from_url==null) from_url=contact_url;
   }


   // *********************** Protected methods **********************

   /** Parses a single line (loaded from the config file) */
   protected void parseLine(String line)
   {  String attribute;
      Parser par;
      int index=line.indexOf("=");
      if (index>0) {  attribute=line.substring(0,index).trim(); par=new Parser(line,index+1);  }
      else {  attribute=line; par=new Parser("");  }
              
      if (attribute.equals("from_url"))       { from_url=par.getRemainingString().trim(); return; }
      if (attribute.equals("contact_url"))    { contact_url=par.getRemainingString().trim(); return; }
      if (attribute.equals("username"))       { username=par.getString(); return; } 
      if (attribute.equals("realm"))          { realm=par.getRemainingString().trim(); return; }
      if (attribute.equals("passwd"))         { passwd=par.getRemainingString().trim(); return; }
      if (attribute.equals("ua_jar"))         { ua_jar=par.getStringUnquoted(); return; }      
      if (attribute.equals("contacts_file"))  { contacts_file=par.getStringUnquoted(); return; }      

      if (attribute.equals("do_register"))    { do_register=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("do_unregister"))  { do_unregister=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("do_unregister_all")) { do_unregister_all=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("expires"))        { expires=par.getInt(); return; } 
      if (attribute.equals("keepalive_time")) { keepalive_time=par.getInt(); return; } 

      if (attribute.equals("call_to"))     { call_to=par.getRemainingString().trim(); return; }
      if (attribute.equals("accept_time"))    { accept_time=par.getInt(); return; }
      if (attribute.equals("hangup_time"))    { hangup_time=par.getInt(); return; } 
      if (attribute.equals("transfer_time"))  { transfer_time=par.getInt(); return; } 
      if (attribute.equals("re_invite_time")) { re_invite_time=par.getInt(); return; } 
      if (attribute.equals("redirect_to"))    { redirect_to=par.getRemainingString().trim(); return; }
      if (attribute.equals("transfer_to"))    { transfer_to=par.getRemainingString().trim(); return; }
      if (attribute.equals("no_offer"))       { no_offer=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("no_prompt"))      { no_prompt=(par.getString().toLowerCase().startsWith("y")); return; }

      if (attribute.equals("audio"))          { audio=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("video"))          { video=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("recv_only"))      { recv_only=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("send_only"))      { send_only=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("send_tone"))      { send_tone=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("send_file"))      { send_file=par.getRemainingString().trim(); return; }
      if (attribute.equals("recv_file"))      { recv_file=par.getRemainingString().trim(); return; }

      if (attribute.equals("audio_port"))     { audio_port=par.getInt(); return; } 
      if (attribute.equals("audio_avp"))      { audio_avp=par.getInt(); return; } 
      if (attribute.equals("audio_codec"))    { audio_codec=par.getString(); return; } 
      if (attribute.equals("audio_sample_rate"))     { audio_sample_rate=par.getInt(); return; } 
      if (attribute.equals("audio_sample_size"))     { audio_sample_size=par.getInt(); return; } 
      if (attribute.equals("audio_frame_size"))      { audio_frame_size=par.getInt(); return; } 
      if (attribute.equals("video_port"))     { video_port=par.getInt(); return; } 
      if (attribute.equals("video_avp"))      { video_avp=par.getInt(); return; } 

      if (attribute.equals("use_jmf"))        { use_jmf=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("use_rat"))        { use_rat=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("bin_rat"))        { bin_rat=par.getStringUnquoted(); return; }
      if (attribute.equals("use_vic"))        { use_vic=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("bin_vic"))        { bin_vic=par.getStringUnquoted(); return; }      

      // for backward compatibily
      if (attribute.equals("contact_user"))   { username=par.getString(); return; } 
      if (attribute.equals("auto_accept"))    { accept_time=((par.getString().toLowerCase().startsWith("y")))? 0 : -1; return; } 
   }


   /** Converts the entire object into lines (to be saved into the config file) */
   protected String toLines()
   {  // currently not implemented..
      return contact_url;
   }
  
}
