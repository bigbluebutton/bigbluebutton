/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.sua.applet;

import local.ua.RegisterAgent;
import local.ua.UserAgent;
import local.ua.UserAgentProfile;

import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.provider.SipStack;

/*****************************************************************************
;  cSIP_Call
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to initialize, start and stop call
;  
; HISTORY
; __date__ :        PTS:            Description
; 02-24-2011
******************************************************************************/
public class cSIP_Call {
	
	private UserAgentProfile userProfile ;
	private SipProvider provider ;
	private UserAgent ua ;
	private RegisterAgent ra ; 
	
	/*****************************************************************************
    ;  cSIP_Call
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of the class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;	INPUT
    ;		domain: (String) domain name or IP
    ;		room:	(String) the voice conference room number
    ;		name:	(String) the caller name
    ;		bbbuserName: (String) the user name to connect to conference servers
    ;		bbbPassword: (String) the password to connect to conference servers
    ;		bbbPort: (int) port
    ;   
    ; IMPLEMENTATION
    ;	call cSIP_Initialize function
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	public cSIP_Call(
						String domain, String room, String name,
						String bbbUserName,String bbbPassword,
						int bbbPort
					){
		System.out.print("Initialize cSIP_Call") ;
		cSIP_Initialize(domain,room,name,bbbUserName,bbbPassword,bbbPort) ;
	}/** END Function: cSIP_Call */
	
	/*****************************************************************************
    ;  cSIP_Initialize
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to call when initialize
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;	INPUT
    ;		domain: (String) domain name or IP
    ;		room:	(String) the voice conference room number
    ;		name:	(String) the caller name
    ;		bbbuserName: (String) the user name to connect to conference servers
    ;		bbbPassword: (String) the password to connect to conference servers
    ;		bbbPort: (int) port
    ;   
    ; IMPLEMENTATION
    ;	initialize userProfile, provider, register agent and user agent 
    ;	for making call
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
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
	}/** END Function: cSIP_Initialize */
	
	/*****************************************************************************
    ;  doCall
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to starting call
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;	INPUT
    ;		domain: (String) the domain name or IP
    ;		room:	(String) the voice conference room number
    ;   
    ; IMPLEMENTATION
    ;	calling user agent "call()" function to start call
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
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
	}/** END Function: doCall */
	
	/*****************************************************************************
    ;  endCall
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to hangup calling
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	calling user agent "hangup()" function to hangup the call
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	public void endCall(){
		System.out.print("End Call");
		if ( null != ua ){
			ua.hangup();
		}
	}/** END Function: endCall */
	
}
