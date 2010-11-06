/** 
* ===License Header===
*
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
* ===License Header===
*/
package org.bigbluebutton.conference.service.recorder;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Hashtable;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.bigbluebutton.recorder.EventMessage;
import org.bigbluebutton.recorder.IEventMessage;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/** 
 * 
 * The RecorderEventDispatcher class creates a object message and implements 
 * the sender method for sending events to the JMS queue
 *
 **/
public class RecorderEventDispatcher implements IRecorder {

	/** A log instance */
	private static Logger log = Red5LoggerFactory.getLogger( RecorderEventDispatcher.class, "bigbluebutton" );
	
	/** TODO conference attribute is unused */
	private final String conference;
	
	/** Conference Name */
	private final String room;
	
	/** A JmsTemplate instance */
	private JmsTemplate jmsTemplate;
	
	/**
	 * RecorderEventDispatcher constructor.
	 * @param conference the conference name
	 * @param room the room name
	 * @return RecorderEventDispatcher
	 */
	public RecorderEventDispatcher(String conference, String room) {
		this.conference = conference;
		this.room = room;
		log.debug("create an instance of RecorderEventDispatcher");
	}
	
	/**
	 * The method creates a object message for sending to the jms queue.
	 * @param event receive a IEventMessage object from bbb-common-messages
	 */
	public void sendEvents(final IEventMessage event) {
		jmsTemplate.send(new MessageCreator() {
            public Message createMessage(Session sn) throws JMSException {
                Message msg=sn.createObjectMessage(event);
                return msg;
            }
        });
		log.debug("create and send object message");
	}
	
	/**
	 * The method implements recordEvent from IRecoder. It sets the EventMessage 
	 * from bbb-common-messages with the room name, timestamp and message-event.
	 * @param message this is a event-message sent by the BigBlueButton modules. 
	 * @see IRecorder 
	 */
	@Override
	public void recordEvent(String message) {
		EventMessage event=new EventMessage();
		event.setConferenceID(room);
		event.setMessage(message);
		event.setTimeStamp(System.currentTimeMillis());
		sendEvents(event);
		log.debug("event-message: {}",message);
	}
	
	/**
	 * The method sets a Jms Template. 
	 * @param jmsTemplate a JmsTemplate.
	 */
	public void setJmsTemplate(JmsTemplate jmsTemplate){
		this.jmsTemplate=jmsTemplate;
		log.debug("set jms template");
	}
	
	/******************************************
	 * Test XML Performance
	 ******************************************/
	@SuppressWarnings("unchecked")
	public String parseEventsToXML(String module, Hashtable keyvalues){
		DocumentBuilderFactory dbfac = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
		try {
			docBuilder = dbfac.newDocumentBuilder();
			Document doc = docBuilder.newDocument();
	        
	        
	        Element node = doc.createElement(module);
	        
	        ArrayList keysarray=new ArrayList(keyvalues.keySet());
	        for(int i=0;i<keysarray.size();i++){
	        	String key=(String) keysarray.get(i);
	        	node.setAttribute(key, keyvalues.get(key)+"");
	        }
	        doc.appendChild(node);
	        
	        Transformer transformer = TransformerFactory.newInstance().newTransformer();
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");

	        //initialize StreamResult with File object to save to file
	        StreamResult result = new StreamResult(new StringWriter());
	        DOMSource source = new DOMSource(doc);
	        transformer.transform(source, result);

	        String xmlString = result.getWriter().toString();
	        
	        return xmlString; 
		} catch (Exception e) {
			log.warn("Exception {}",e.getMessage());
		}
        
		return "";
	}
	
	public String appendXMLToEvent(String xmlevents,String xmlappended,String fromtag){
		DocumentBuilderFactory dbfac = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder;
		try {
			docBuilder = dbfac.newDocumentBuilder();
			
			// xml to append
			InputSource is = new InputSource();
	        is.setCharacterStream(new StringReader(xmlappended));
	        Document docappended = docBuilder.parse(is);
			
	        //events xml
	        is = new InputSource();
	        is.setCharacterStream(new StringReader(xmlevents));
	        Document docevents = docBuilder.parse(is);
			
	        NodeList list = docappended.getElementsByTagName(fromtag);
	        Element element = (Element)list.item(0);
	        
	        Node dup = docevents.importNode(element, true);
	        docevents.getDocumentElement().appendChild(dup);
	       
	        Transformer transformer = TransformerFactory.newInstance().newTransformer();
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");

	        //initialize StreamResult with File object to save to file
	        StreamResult result = new StreamResult(new StringWriter());
	        DOMSource source = new DOMSource(docevents);
	        transformer.transform(source, result);

	        String xmlString = result.getWriter().toString();
	        
	        return xmlString; 
		} catch (Exception e) {
			log.warn("Exception {}",e.getMessage());
		}
        
		return "";
	}
}
