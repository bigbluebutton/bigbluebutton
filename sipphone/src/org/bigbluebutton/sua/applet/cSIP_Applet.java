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
	
	private cSIP_Call sip_call ;
	/*****************************************************************************
    ;  init
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to load when applet was called
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 02-24-2011
    ******************************************************************************/
	public void init(){
	    
		this.bbb_domain = getParameter("domain");
		this.bbb_room   = getParameter("room") ;
		this.bbb_name   = getParameter("name") ;
		
		/** mock up **/
		/*this.bbb_domain = "bbb.titook.org" ;
		this.bbb_room = "12345";
		this.bbb_name = "test" ;*/
		/** end **/
		
		//new cSIP_AudioGUI();
		
		sip_call = new cSIP_Call(this.bbb_domain,this.bbb_room,this.bbb_name);
		//initializeProfile(this.bbb_domain,this.bbb_room,this.bbb_name);
		//doCall(this.bbb_domain,this.bbb_room);
	}
	
	public void endCall(){
		if ( null != sip_call ){
			sip_call.endCall() ;
		}
		sip_call = null ;
	}

	@Override
	public void destroy(){
		System.out.print("Destroy SIP Phone...") ;
		//onCall = false ;
		endCall();
		super.destroy() ;
	}
	
	@Override
	public void start(){
		System.out.print("Starting SIP Phone...") ;
		
		if ( null == sip_call ){
			sip_call = new cSIP_Call(this.bbb_domain,this.bbb_room,this.bbb_name);
		}
		
		sip_call.doCall(this.bbb_domain, this.bbb_room);
		
		super.start();
	}
	
	@Override
	public void stop(){
		System.out.print("Stopping SIP Phone...") ;		
		super.stop();
	}
	
}
