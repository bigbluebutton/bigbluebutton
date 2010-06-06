/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb.classes;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author Markos
 */
public class Utils {
    public static Document parseXmlFile(String urlxml){
	Document dom=null;
        //get the factory
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();

        try {
                //Using factory get an instance of document builder
                DocumentBuilder db = dbf.newDocumentBuilder();
                //parse using builder to get DOM representation of the XML file
                dom = db.parse(urlxml);
        }catch(ParserConfigurationException pce) {
                pce.printStackTrace();
        }catch(SAXException se) {
                se.printStackTrace();
        }catch(IOException ioe) {
                ioe.printStackTrace();
        }
        return dom;
    }

    /*
     * This method has been done exactly for processing lecture.xml
     * return: an arraylist with Map values for each tag
     */
    public static ArrayList parseLectureXML(Document dom) {
        ArrayList listmapvalues=new ArrayList();
        Element docEle = dom.getDocumentElement();
        NodeList lookseq = docEle.getElementsByTagName("seq");

        if(lookseq != null && lookseq.getLength() > 0) {
            Node nseq=lookseq.item(0);

            //here I get all the events
            NodeList seqchildren=nseq.getChildNodes();

            for(int i=0;i<seqchildren.getLength();i++){
                
                Map<String,String> mapvalues=new HashMap<String, String>();

                //get one event
                Node nevent=seqchildren.item(i);

                if(nevent.getNodeType()==Node.ELEMENT_NODE)
                {
                    // identify the type of event
                    String tagname=nevent.getNodeName();
                    //if(!tagname.equalsIgnoreCase("presentation"))
                        //continue;

                    mapvalues.put("type", tagname);

                    
                    // get all the attributes of the node
                    NamedNodeMap attribs=nevent.getAttributes();
                    for(int j=0;j<attribs.getLength();j++){
                        Node attr=attribs.item(j);
                        String attname=attr.getNodeName();
                        String attvalue=attr.getNodeValue();

                        //put the name and value of an attribute
                        mapvalues.put(attname, attvalue);
                    }

                    //check if there is child nodes
                    // the following nodes has child nodes: presentation and chat
                    if(nevent.hasChildNodes()){
                        Node nextnode=nevent.getFirstChild();

                        if(nextnode.getNodeType()==Node.TEXT_NODE&&!nextnode.getNodeValue().trim().equalsIgnoreCase("")){
                            // chat node has a text node
                            mapvalues.put("text", nextnode.getNodeValue());
                        }
                        else{
                            //this is for presentation node
                            NodeList slidesnode=nevent.getChildNodes();
                            int count=0;
                            for(int j=0;j<slidesnode.getLength();j++){
                                Node nslide=slidesnode.item(j);

                                if(nslide.getNodeType()==Node.ELEMENT_NODE){
                                    String slidename=nslide.getFirstChild().getNodeValue();
                                    // slides nodes
                                    count+=1;
                                    mapvalues.put("slide"+count, slidename);
                                }
                            }
                        }

                    }
                }
                listmapvalues.add(mapvalues);
            }
        }
        return listmapvalues;
    }
}
