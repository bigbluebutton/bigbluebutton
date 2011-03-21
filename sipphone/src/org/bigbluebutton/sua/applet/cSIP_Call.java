package org.bigbluebutton.sua.applet;

import local.ua.RegisterAgent;
import local.ua.UserAgent;
import local.ua.UserAgentProfile;

import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.provider.SipStack;

public class cSIP_Call {
	
	private UserAgentProfile userProfile ;
	private SipProvider provider ;
	private UserAgent ua ;
	private RegisterAgent ra ; 
	
	public cSIP_Call(
						String domain, String room, String name,
						String bbbUserName,String bbbPassword,
						int bbbPort
					){
		System.out.print("Initialize cSIP_Call") ;
		cSIP_Initialize(domain,room,name,bbbUserName,bbbPassword,bbbPort) ;
	}
	
	private void cSIP_Initialize(
						String domain, String room, String name,
						String bbbUserName,String bbbPassword,
						int bbbPort
						){
		
		if ( true == domain.equals("") || 
			 true == room.equals("") ){
			System.out.print("Invalid domain or room") ;
			return ;
		}
		
		
		SipStack.debug_level = 0 ;
		
		userProfile = new UserAgentProfile() ;
		if ( null == userProfile ){
			System.out.print("Failed to initialize user profile") ;
			return ;
		}
		
		/** assign value to user profile **/
		userProfile.contact_url = bbbUserName + "@" + domain ;
		userProfile.username = bbbUserName ;
		userProfile.use_jmf = false ;
		userProfile.audio = true;
		userProfile.from_url = "\""+ name +"\"" + "<"+cSIP_Constant.BBB_PROTOCOL + bbbUserName + 
								"@" + domain ;
		userProfile.call_to = cSIP_Constant.BBB_PROTOCOL + room + "@" + domain  ;
		userProfile.passwd   = bbbPassword ;
		userProfile.realm    = domain ;
		userProfile.use_rat  = false ;
		
		/** Initialize Provider **/
		provider = new SipProvider(domain,bbbPort);
		if ( null == provider ){
			System.out.print("Failed to initialize provider");
			return ;
		}
		
		/** Initialize Register Agent **/
		ra = new RegisterAgent( provider             ,
				                userProfile.call_to  ,
				                userProfile.from_url ,
				                userProfile.username ,
				                userProfile.realm    ,
				                userProfile.passwd   ,
				                null );
		if ( null == ra ){
			System.out.print("Failed to initialize register agent");
			return ;
		}
		
		// register caller
		System.out.print("Register Caller");
		ra.register(120);
		
		
		/** Initialize User Agent **/
		ua = new UserAgent(provider,userProfile,null) ;
		if ( null == ua ){
			System.out.print("Failed to initialize user agent");
			return ;
		}
	}
	
	public void doCall(String domain, String room){
		
		if ( true == domain.equals("") || 
			 true == room.equals("") ){
				System.out.print("Invalid domain or room") ;
				return ;
		}
		
		System.out.print("Call to " + room + "@" + domain);
		if ( null != ua ){
			ua.call( room + "@" + domain );
		}
	}
	
	public void endCall(){
		System.out.print("End Call");
		if ( null != ua ){
			ua.hangup();
		}
	}
	
}
