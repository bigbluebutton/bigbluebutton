/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bigbluebutton.recorder;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 *
 * @author Markos
 */
public class EventListener implements MessageListener {

    /*private static final String FIELD_CONFERENCEID="conferenceid";
    private static final String FIELD_TSEVENT="tsevent";
    private static final String FIELD_MESSAGE="message";
    private static final String TABLE_EVENT="event";
    private JdbcTemplate jdbcTemplate;*/
	
	private static final String FILENAME="manifest.xml";
	private String pathConferences;
	

    public void onMessage(Message msg) {
        if(msg instanceof ObjectMessage){
            try{
                IEventMessage objmsg=(IEventMessage)((ObjectMessage)msg).getObject();
                if(objmsg instanceof IEventMessage){
                    //if(!isDuplicated(objmsg)){
                        //insertEvent(objmsg);
                    //}
                	if(!isDuplicatedXMLNode(objmsg)){
                		writeXMLFile(objmsg);
                	}
                }
            }catch(JMSException ex){
                ex.printStackTrace();
            }
        }
    }

    /*public void insertEvent(IEventMessage event) {
        String sql = "INSERT INTO "+TABLE_EVENT;
        sql=sql+" ("+FIELD_CONFERENCEID+","+FIELD_TSEVENT+","+FIELD_MESSAGE+")";
        sql=sql+" VALUES (?, ?, ?)";
        jdbcTemplate.update(sql,
                    new Object[] {event.getConferenceID(),event.getTimeStamp(),event.getMessage()});
    }
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private boolean isDuplicated(IEventMessage objmsg) {
        String sql="SELECT COUNT(0) FROM "+TABLE_EVENT+" WHERE "+FIELD_CONFERENCEID+" = ? AND "+FIELD_TSEVENT+" = ?";
        int count=jdbcTemplate.queryForInt(sql, new Object[]{objmsg.getConferenceID(),objmsg.getTimeStamp()});
        if(count>0)
            return true;
        return false;
    }*/

	public void setPathConferences(String pathConferences) {
		this.pathConferences = pathConferences;
	}

	/****************************************
     *  Write XML Files (I think that this method should be optimized
     *****************************************/
    public void writeXMLFile(IEventMessage event){
		try {
			Document manifest = parseManifestXML(event.getConferenceID(), true);
	        
	        Node sequence = manifest.getElementsByTagName("seq").item(0);
	        
			// Event Message to XML
			InputSource is = new InputSource();
	        is.setCharacterStream(new StringReader(event.getMessage()));
	        Document docevent = createDocBuilder().parse(is);
			
	        //append event message to Manifest
	        Element element = docevent.getDocumentElement();
	        
	        Node dup = manifest.importNode(element, true);
	        NamedNodeMap attributes = dup.getAttributes();
	        Attr timestamp = manifest.createAttribute("timestamp");
	        timestamp.setValue(event.getTimeStamp()+"");
	        attributes.setNamedItem(timestamp);
	        sequence.appendChild(dup);
	       
	        //Prepare the DOM document for writing
	        manifest.setXmlStandalone(true);
	        DOMSource source = new DOMSource(manifest);
	        
	        // Prepare the output file
	        File file = new File(pathConferences + "/" + event.getConferenceID() + "/" + event.getConferenceID() + "/" + FILENAME);
	        StreamResult result = new StreamResult(file);
	        
	        //Writing the file
	        Transformer transformer = TransformerFactory.newInstance().newTransformer();
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
	        transformer.transform(source, result);
	        
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
    
    //NOTE: maybe it can be done in another way... xquery?
    private boolean isDuplicatedXMLNode(IEventMessage objmsg) {
    	Document manifest = parseManifestXML(objmsg.getConferenceID(),false);
    	
    	//indicate that manifest file doesn't exist, so there is not duplicate
        if(manifest==null)
        	return false;
        
		NodeList events=manifest.getElementsByTagName("seq").item(0).getChildNodes();
		for(int i=0;i<events.getLength();i++){
			if(events.item(i).getNodeType()==Node.ELEMENT_NODE){
				Node attribute=events.item(i).getAttributes().getNamedItem("timestamp");
				long att_value=Long.parseLong(attribute.getNodeValue());
				if(att_value==objmsg.getTimeStamp()){
					return true;
				}
			}
		}
		return false;
    }
    
    private Document parseManifestXML(String confid,boolean createnew){
    	Document manifest=null;
    	
    	String dirpath=pathConferences+"/"+confid+"/"+confid+"/";
		String filename=dirpath+FILENAME;
		try {
    		DocumentBuilder docBuilder=createDocBuilder();
            if(isFileExists(filename)){
            	manifest = docBuilder.parse(filename);
	        }
	        else if(createnew){
	        	if(!isFileExists(dirpath)){
	        		boolean success = (new File(dirpath)).mkdirs();
		        	System.out.println("create dirs: "+success);
	        	}
	        	manifest = docBuilder.newDocument();
	            Node root=manifest.createElement("events");
	            Node sequence=manifest.createElement("seq");
	            root.appendChild(sequence);
	            manifest.appendChild(root);
	            
	        }
        } catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
        return manifest;
    }
    
    private DocumentBuilder createDocBuilder(){
    	DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder=null;
		try {
			docBuilder = docFactory.newDocumentBuilder();
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		}
		return docBuilder;
    }
    
    private boolean isFileExists(String fileName) {
    	File file = new File(fileName);
    	return file.exists();
    }
}
