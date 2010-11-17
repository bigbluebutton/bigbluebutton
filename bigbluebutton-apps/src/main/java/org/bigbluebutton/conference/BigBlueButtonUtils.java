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

package org.bigbluebutton.conference;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Hashtable;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.red5.server.api.Red5;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

public class BigBlueButtonUtils{

	public BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	@SuppressWarnings("unchecked")
	public static String parseEventsToXML(String module, Hashtable keyvalues){
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
			
		}
        
		return "";
	}
	
	public static String appendXMLToEvent(String xmlevents,String xmlappended,String fromtag){
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
			
		}
        
		return "";
	}
}
