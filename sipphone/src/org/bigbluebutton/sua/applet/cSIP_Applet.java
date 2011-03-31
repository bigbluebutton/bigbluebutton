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

import java.security.AccessController;
import java.security.PrivilegedAction;

import javax.swing.JApplet;
import org.bigbluebutton.sua.applet.cSIP_Call;
/*****************************************************************************
;  cSIP_Applet
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to load the sip applet
;  
; HISTORY
; __date__ :        PTS:            Description
; 02-24-2011
******************************************************************************/
@SuppressWarnings("serial")
public class cSIP_Applet extends JApplet{
		
	//private AudioGUI audiogui = new AudioGUI();
    
    protected boolean onCall = false ;
	private String bbb_domain ;
	private String bbb_room   ;
	private String bbb_name   ;
	private String bbb_username;
	private String bbb_password;
	private int bbb_port; 
	
	private cSIP_Call sip_call ;
	/*****************************************************************************
    ;  init
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to load when applet was initialize
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	get the parameter and set to the member then create the cSIP_Call object
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	public void init(){
	    System.out.println("Initialize applet.........");
		
	    this.bbb_domain = getParameter("domain");
		this.bbb_room   = getParameter("room") ;
		this.bbb_name   = getParameter("name") ;
		this.bbb_username = getParameter("bbbUserName");
		this.bbb_password = getParameter("bbbPassword");
		this.bbb_port	  = Integer.parseInt(getParameter("bbbPort"));
		
		System.out.println("bbb_domain: " + this.bbb_domain + ", bbb_room: " + this.bbb_room
				+ ", bbb_name: " + this.bbb_name + ", bbb_username: " + this.bbb_username
				+ ", bbb_password: " + this.bbb_password + ", bbb_port: " + this.bbb_port
				);
		
		sip_call = new cSIP_Call(this.bbb_domain,this.bbb_room,this.bbb_name,
							this.bbb_username,this.bbb_password,this.bbb_port
							);
	}/** END Function: init */
	
	/*****************************************************************************
    ;  endCall
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to end calling.
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	call enCall() to end the call
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	public void endCall(){
		if ( null != sip_call ){
			sip_call.endCall() ;
		}
		sip_call = null ;
	}/** END Function: endCall */

	/*****************************************************************************
    ;  destroy
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to call when the applet has been kill to ending the
   	; 	call
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	call endCall() to disconnect calling.
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	@Override
	public void destroy(){
		System.out.println("Destroy SIP Phone...") ;
		//onCall = false ;
		endCall();
		super.destroy() ;
	}/** END Function: destroy */
	
	/*****************************************************************************
    ;  start
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used call when applet started.
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	initialize and start calling
    ;	
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	@Override
	public void start(){
		System.out.println("Starting SIP Phone...") ;
		
		if ( null == sip_call ){
			sip_call = new cSIP_Call(this.bbb_domain,this.bbb_room,this.bbb_name,
								this.bbb_username,this.bbb_password,this.bbb_port
								);
		}
		if ( null == sip_call ){
			System.out.println("cSIP_Applet : Creating cSIP_Call object is NULL");
			return;
		}
		sip_call.doCall(this.bbb_domain, this.bbb_room);
		
		super.start();
	}/** END Function: start */
	
	/*****************************************************************************
    ;  stop
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to load when applet stopped
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES : N/A
    ;   
    ; IMPLEMENTATION
    ;	stop the JApplet
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	@Override
	public void stop(){
		System.out.print("Stopping SIP Phone...") ;		
		super.stop();
	}/** END Function: stop */
	
}
