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

import java.awt.BorderLayout;
import java.awt.Button;
import java.awt.Frame;
import java.awt.GridLayout;
import java.awt.Label;
import java.awt.Panel;
import java.awt.TextField;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.security.AccessController;
import java.security.PrivilegedAction;

import javax.swing.JApplet;

import local.ua.RegisterAgent;
import local.ua.UserAgent;
import local.ua.UserAgentProfile;

import org.zoolu.sip.provider.SipProvider;

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
	
	private static final String BBB_USERNAME = "bbbuser" ;
	private static final String BBB_PASSWORD = "secret"  ;
	private static final int   BBB_PORT     = 5070 ;
	private static final String BBB_PROTOCOL =  "sip:" ;
	
	private UserAgentProfile userProfile ;
	private SipProvider provider ;
	private UserAgent ua ;
	private RegisterAgent ra ; 
	private String bbb_domain = null ;
	private String bbb_room   = null ;
	private String bbb_name   = null ;
	
	private static boolean connected = false ;
	
	Panel p = new Panel();
    Panel p1 = new Panel();
    Label l_domain = new Label("Domain : ");
    final TextField t_domain = new TextField(20);
    
    Label l_room =new Label("Room : ");
    final TextField t_room=new TextField(20);
    
    Label l_name =new Label("Name : ");
    final TextField t_name=new TextField(20);
    
    final Button b_connect=new Button("  Connect  ");
    
    Frame frm=new Frame("BigBlueButton SIP Applet");
    
    protected boolean onCall = false ;
	
	public void loadUI(){
			
			frm.setSize(500, 200);
		    frm.setVisible(true);
		    frm.addWindowListener(new WindowAdapter(){
		      public void windowClosing(WindowEvent e){
		    	hangup();
		        System.exit(0);
		      }
		    });
		    
		    p.setLayout(new GridLayout(4,1));
		    
		    p.add(l_domain);
		    p.add(t_domain);
		    
		    p.add(l_room);
		    p.add(t_room);
		    
		    p.add(l_name);
		    p.add(t_name);
		    
		    
		    p.add(b_connect);
		    p1.add(p);
		    frm.add(p1,BorderLayout.NORTH);
		    b_connect.addActionListener(new ActionListener(){

				public void actionPerformed(ActionEvent arg0) {
					// TODO Auto-generated method stub
					connected = ! connected ;
					if ( true == connected ){
						initializeProfile(t_domain.getText(),t_room.getText(), t_name.getText());
						doCall(t_domain.getText(), t_room.getText()) ;
						b_connect.setLabel("Disconnect") ;
					}else{
						hangup();
						b_connect.setLabel("  Connect  ");
					}
					
				}
		    	
		    });		    

	}
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
		
		//loadUI();
		/*frm.setVisible(false);
	    frm.addWindowListener(new WindowAdapter(){
	      public void windowClosing(WindowEvent e){
	    	hangup();
	        System.exit(0);
	      }
	    });
	    p.add(frm);*/
	    
		this.bbb_domain = getParameter("domain");
		this.bbb_room   = getParameter("room") ;
		this.bbb_name   = getParameter("name") ;
		
		/** mock up **/
		/*this.bbb_domain = "bbb.titook.org" ;
		this.bbb_room = "12345";
		this.bbb_name = "sokoun" ;*/
		/** end **/
		
		
		initializeProfile(this.bbb_domain,this.bbb_room,this.bbb_name);
		doCall(this.bbb_domain,this.bbb_room);
	}
	
	public void initializeProfile(String domain, String room, String name){
		if ( (true == domain.equals("")) || (true==room.equals("")) ){
			return ;
		}
		
		if ( null == userProfile ){
			userProfile = new UserAgentProfile();
		}
		
		this.bbb_domain = domain ;
		this.bbb_room = room ;
		this.bbb_name = name ;
		
		userProfile.contact_url = cSIP_Applet.BBB_USERNAME + "@" + domain ;
		userProfile.username = cSIP_Applet.BBB_USERNAME ;
		userProfile.use_jmf = false ;
		userProfile.audio = true;
		userProfile.from_url = "\""+ name +"\"" + "<"+cSIP_Applet.BBB_PROTOCOL + cSIP_Applet.BBB_USERNAME + 
								"@" + domain ;
		userProfile.call_to = cSIP_Applet.BBB_PROTOCOL + room + "@" + domain  ;
		userProfile.passwd   = cSIP_Applet.BBB_PASSWORD ;
		userProfile.realm    = domain ;
		
		if ( null == provider ){
			provider = new SipProvider(domain,cSIP_Applet.BBB_PORT);
		}
		
		if ( null == ua ){
			ua = new UserAgent(provider,userProfile,null) ;
		}
		
		if ( null == ra ){
			ra = new RegisterAgent(provider,userProfile.call_to,userProfile.from_url,userProfile.username,userProfile.realm,userProfile.passwd,null);
		}
		
		ra.register(120);
		
	}
	
	public void doCall(String domain, String room){
		System.out.print("Call to " + room + "@" + domain);
		if ( null != ua ){
			ua.call(room + "@" + domain);
		}
		onCall = true ;
	}
	
	public void hangup(){
		/*if ( true == ra.isRegistering()){
			ra.unregister();
		}*/
		System.out.print("Stop UA") ;		
		if ( null != ua ){
			ua.hangup() ;
		}else{
			System.out.print("UA is null") ;
		}
		
		if ( true == onCall ){
			System.exit(0);
		}
		
		/*ua=null ;
		ra=null ;
		provider=null ;*/
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void destroy(){
		System.out.print("Destroy Applet") ;
		AccessController.doPrivileged(new PrivilegedAction() 
		   {
		        public Void run() {
		            // kill the JVM
		        	hangup();
		        	onCall = false ;
		            System.exit(0);
		            return null;
		        }
		    });

	}
}
