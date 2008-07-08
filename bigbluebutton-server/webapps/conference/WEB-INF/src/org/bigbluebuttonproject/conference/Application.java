/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/

package org.bigbluebuttonproject.conference;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.bigbluebuttonproject.conference.vo.Room;

import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IScope;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.so.ISharedObject;
import org.springframework.core.io.Resource;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

   
/**
 * This is the base class of conference server application. It overwrites the methods of ApplicationAdapter class.
 * This class plays main role in the conference room, handling and controlling conference participants list and assigning roles to the users of the conference rooms.
 * 
 * TO-DO
 * (1) Client conference room registration
 * (2)
 */

public class Application extends ApplicationAdapter implements
	IPendingServiceCallback {
	
	/** Logger log is used for logging conference server messages in log file. */
	protected static Logger log = LoggerFactory.getLogger( Application.class );

	/** The app scope. */
	private static IScope appScope;
	
	/** conferenceRooms Map : where details of all conference rooms are stored. */
	private Map<String, Room> conferenceRooms = new HashMap<String, Room>();
	
	/** The Constant PARTICIPANTS. */
	private static final String PARTICIPANTS = "PARTICIPANTS";
	
	/** The Constant PARTICIPANTS_SO. */
	private static final String PARTICIPANTS_SO = "participantsSO";
    
   
    @Override
    /** 
	   * This method is called once on scope start. overrides MultiThreadedApplicationAdapter.appStart(IScope).
	   * Calls Initialize() to do initialization tasks. Since this is the Application start handler method, 
	   * all the initialization tasks that the server application needs, have to go here.
	   *   
	   * @param app the Application scope
	   * @return true if Application can be started, or esle false
	   * 
	   * 
	   * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appStart(org.red5.server.api.IScope)
	   */
    public boolean appStart (IScope app )
    {
        log.info( "Blindside.appStart" );
        appScope = app;
        
        initialize();
        
        return true;
    }
    
    /**
     * This method is called from appStart().
     * Calls loadConferenceRooms() to read "conferences/conferences.xml" file and store conference room details in hashmap.
     * 
     * @see org.blindsideproject.conference.Application#loadConferenceRooms(String fileName)
     */
    private void initialize() 
    {
        conferenceRooms = this.loadConferenceRooms("conferences/conferences.xml");

    }
    
    /**
     * This method is automatically called when conference Server application is stopped.
     * Tasks that are needed to be executed before exiting the server, have to go here.
     */
    public void appStop ( )
    {
        log.info( "Blindside.appStop" );
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appConnect(org.red5.server.api.IConnection, java.lang.Object[])
     */
    public boolean appConnect( IConnection conn , Object[] params )
    {
        log.info( "Blindside.appConnect " + conn.getClient().getId() );
    	
        return true;
    }
    
    /**
     * This method is called to get the conference room details. Room name is given as a parameter.
     * When conference server starts details of all conference rooms, are stored in conferenceRooms HashMap.
     * 
     * @param room conference room name
     * 
     * @return Room object containing the conference room details
     */
    private Room getRoom(String room)
    {
    	if (! conferenceRooms.containsKey(room)) {
    		return null;
    	}
    	
    	return conferenceRooms.get(room);
    }

    /**
     * This method is called from roomConnect() to update the connecting  client about his/her role in the conference.
     * setUserIdAndRole() method in client is remotely called from conference server.
     * 
     * @param conn connection to the client who needs to be updated about his/her role in the conference
     * @param role role of the client in the conference room
     * 
     * @see org.blindsideproject.conference.Role.java
     */
    private void setUserIdAndRole(IConnection conn, Role role)
    {
		IServiceCapableConnection service = (IServiceCapableConnection) conn;
		
		log.info("Setting userId and role [" + conn.getClient().getId() + "," + role.toString() + "]");
		// remotely invoke client method with his/her role as on of the parameters
		service.invoke("setUserIdAndRole", new Object[] { conn.getClient().getId(), role.toString() },
						this);
    }

    /**
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#appDisconnect(org.red5.server.api.IConnection)
     */
    public void appDisconnect( IConnection conn)
    {
        log.info( "Blindside.appDisconnect " + conn.getClient().getId() );
    }
    
    /**
     * This method is called once on room scope start (when first client connects to the scope). overrides MultiThreadedApplicationAdapter.roomStart(IScope).
     * 
     * @param room the Room scope
     * 
     * @return true if Room can be started or esle false
     * 
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomStart(org.red5.server.api.IScope)
     */
    public boolean roomStart(IScope room) {
    	log.info( "Blindside.roomStart " );
    	if (!super.roomStart(room))
    		return false;

    	return true;
    }
    
    /**
     * This method is called every time new client connects to the application. NetConnection.connect() call from client side, call this function in server side.
     * It also takes parameters from the client. This method is a powerful handler method which allows developers to add tasks here that are needed to be executed every time a new client connects to the server.
     * 
     * 
     * In this method, client sends login ID to the server and server verifies it. It then assign user's role and send it to the client.
     * It also adds the client to the participants list in ParticipantSO
     * 
     * @param conn the connection between server and client
     * @param params parameter array passed from client
     * 
     * @return true
     */
    public boolean roomConnect(IConnection conn, Object[] params) {
    	log.info( "Blindside.roomConnect " + conn.getClient().getId() );
    	// extract login info from client connect call
    	String room = ((String) params[0]).toString();
        String username = ((String) params[1]).toString();
        String password = ((String) params[2]).toString();

        log.info("User logging [" + room + "," + username + "," + password + "]");
        // see if the room exists
        Room confRoom = getRoom(room);        
        if (confRoom == null) {
        	// room does not exist
        	log.info("Cannot find room[" + room + "]");
        	// reject client with error message
        	rejectClient("Room not found.");
        	return true;
        }
        // get moderator and viewer passwords for the conference room
    	String modPass = confRoom.getModeratorPassword();
    	String viewPass = confRoom.getViewerPassword();
    	
    	if (!(modPass.equals(password)) && !(viewPass.equals(password))) {
    		log.info("Wrong password for [" + room + "," + password + "]");
    		log.info("Passwords are [" + modPass + "," + viewPass + "]");
    		// reject client with error message
    		rejectClient("Wrong password.");
    		return true;
    	}
    	
    	Role role = Role.VIEWER;
    	// determine participant's role
    	if (modPass.equals(password)) role = Role.MODERATOR;
    	else role = Role.VIEWER;
    	// call serUserIdAndRole() to send user's role
    	setUserIdAndRole(conn, role);        

    	ISharedObject so = null;
    	// create ParticipantSO if it is not already created
    	if (!hasSharedObject(conn.getScope(), PARTICIPANTS_SO)) {
    		createSharedObject(conn.getScope(), PARTICIPANTS_SO, false);
    		so = getSharedObject(conn.getScope(), PARTICIPANTS_SO, false);
    	} else {        	
        	so = getSharedObject(conn.getScope(), PARTICIPANTS_SO, false);        	   		
    	}    	
    	
    	Participant newParticipant = new Participant(new Integer(conn.getClient().getId()), username, role.toString());
    	// add new participant to the conference room
    	confRoom.addParticipant(newParticipant);
    	
    	ArrayList<Participant> participants = confRoom.getParticipants();
      	// add new participant to the sharedobject's attribute
    	// so that other clients can be notified about new client and update their
    	// participants list
    	so.beginUpdate();
    	so.setAttribute(newParticipant.userid.toString(), newParticipant);
    	
    	log.info("Blindside::roomConnect - Adding[" + newParticipant.userid + "," + participants.size() + "]");
    	
//    	so.setAttribute(PARTICIPANTS, participants);
    	so.endUpdate();
    	
    	return true;
    }
    
    /**
     * This method is called every time client leaves room scope. Developer can add tasks here that are needed to be executed when a client disconnects from the server.
     * Removes the client from the participants list (Stored in participantsSO SharedObject).
     * 
     * @param client conference client
     * @param room room scope
     * 
     * @see org.red5.server.adapter.MultiThreadedApplicationAdapter#roomLeave(org.red5.server.api.IClient, org.red5.server.api.IScope)
     */
    public void roomLeave(IClient client, IScope room) {
    	super.roomLeave(client, room);
    	ISharedObject so = getSharedObject(room, PARTICIPANTS_SO, false);
    	
    	Room confRoom = getRoom(room.getName()); 
    	confRoom.removeParticipant(new Integer(client.getId()));

    	ArrayList<Participant> participants = confRoom.getParticipants();
      	
    	so.beginUpdate();
    	so.removeAttribute(client.getId());
    	log.info("Blindside::roomLeave - Removing[" + client.getId() + "," + participants.size() + "]");
//    	so.setAttribute(PARTICIPANTS, participants);
    	so.endUpdate();
    
    }
    
    /**
     * This handler method is called every time client joins room scope.
     * 
     * @param client conference client
     * @param room Room scope
     * 
     * @return true, if room join
     */
    public boolean roomJoin(IClient client, IScope room) {
    	super.roomJoin(client, room);    	
    	
    	log.info("Blindside::roomJoin - " + client.getId());
  	
    	return true;
    }    
    
    /**
     * This method is called from initialize() to read the "conferences/conferences.xml" file and collect conference rooms details.
     * It returns the conference rooms' details in HashMap
     * 
     * @param fileName XML fileName that contains conference rooms' details
     * 
     * @return HashMap with all the conference rooms details
     */
     public Map<String, Room> loadConferenceRooms(String fileName)
     {
    	 
    	Map<String, Room> rooms = new HashMap<String, Room>();
    	 
     	try {
     		log.debug("Loading conference rooms");    		
 	    	
     		Resource roomsXML = getResource(fileName);
 			
     		InputStream xmlinStream = roomsXML.getInputStream();
     		BufferedReader xmldataStream = new BufferedReader(new InputStreamReader(xmlinStream));
     		StringBuffer xmlStringBuf = new StringBuffer();
     		
     		String inputLine;
     		// read conference.xml file and add it in xmlStringBuf
     		while ((inputLine = xmldataStream.readLine()) != null) { 
     			xmlStringBuf.append(inputLine);
     		}
     		
     		xmldataStream.close();
     		// convert xmlStringBuf content to Document dom
 	    	Document dom = null;    	
 	    	try {
 				dom = this.stringToDoc(xmlStringBuf.toString());
 			} 
 	    	catch (IOException ioex) {
 				log.error("IOException converting xml to dom", ioex);
 			}
 	
 	    	//enables access to the document element of the document...
 	        Element docElement = dom.getDocumentElement();
 	
 	        //get a nodelist of <playlist-item> elements
 	        NodeList nl_level1 = docElement.getElementsByTagName("conference-room");
 	        if(nl_level1 != null && nl_level1.getLength() > 0) {
 	            String roomName;
 	            String modPassword;
 	            String viewPassword;
 	            
 	        	for(int i = 0 ; i < nl_level1.getLength();i++){	                
 	                
 	                Element roomItem_nl_level1 = (Element)nl_level1.item(i);
 	                
 	                //
 	                // Get the values of the <name> and <length> tags within each <playlist-item> 
 	                // and put them into the Map<String, Object> Object...
 	                //
 	                roomName = getTextValue(roomItem_nl_level1, "name");	                
 	                modPassword = getTextValue(roomItem_nl_level1, "mod-password");	              
 	                viewPassword = getTextValue(roomItem_nl_level1, "view-password");
 	               
 	                log.debug("Item no:"+i+", Name: "+ roomName + ", moderator: "+ modPassword + ", viewer: " + viewPassword);
 	                // create Room instances from each Element
 	                Room room = new Room(roomName, modPassword, viewPassword);
 	                // add it in rooms HashMap 	     			
 	     			rooms.put(roomName, room);
 	            }
 	        }
     	}
     	catch (IOException ioe){
     		log.debug(ioe.toString());
     	}

     	return rooms;

     }  
     
     /**
      * This method returns the the string value within an Element's tag.
      * 
      * @param ele A DOM <code>Element</code>
      * @param tagName The name of the DOM Element of type <code>String</code>
      * 
      * @return the text value
      * 
      * The value contained within the DOM Element. Return value is of type <code>String</code>.
      */
     private String getTextValue(Element ele, String tagName)
     {
         String textVal = null;
         NodeList nl = ele.getElementsByTagName(tagName);
         
         if(nl != null && nl.getLength() > 0)
         {
             Element el = (Element)nl.item(0);
             textVal = el.getFirstChild().getNodeValue();
         }

         return textVal;
     }
     
     /**
      * This method takes in an XML string and returns a DOM...
      * 
      * @param str the str
      * 
      * @return A DOM object created by the SAX parser
      * 
      * @throws IOException Signals that an I/O exception has occurred.
      */
     public Document stringToDoc(String str) throws IOException 
     {
     	try {
 	    	DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
 	    	return db.parse(new InputSource(new StringReader(str)));
 	    }
     	catch(Exception ex){
 	    	log.debug("Error in stringToDoc() converting from xml sting to xml doc "+ex.toString());
 	    	return null;
 	    }
 	 }     
     
	/* (non-Javadoc)
	 * @see org.red5.server.api.service.IPendingServiceCallback#resultReceived(org.red5.server.api.service.IPendingServiceCall)
	 */
	public void resultReceived(IPendingServiceCall call) {
		log.info("Received result " + call.getResult() + " for "
				+ call.getServiceMethodName());		
	}     
}
