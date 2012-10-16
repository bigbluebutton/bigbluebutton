/* 
    BigBlueButton - http://www.bigbluebutton.org

    Copyright (c) 2008-2012 by respective authors (see below). All rights reserved.

    BigBlueButton is free software; you can redistribute it and/or modify it under the 
    terms of the GNU Lesser General Public License as published by the Free Software 
    Foundation; either version 2 of the License, or (at your option) any later 
    version.  

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along 
    with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

    Author: Jesus Federico <jesus@blindsidenetworks.com>
*/    


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import org.apache.commons.codec.digest.DigestUtils;

import org.bigbluebutton.api.Proxy
import org.bigbluebutton.lti.Role
import org.bigbluebutton.lti.Parameter

class BigbluebuttonService {

    boolean transactional = false
    
    def url = "http://test-install.blindsidenetworks.com/bigbluebutton"
    def salt = "8cd8ef52e8e101574e400365b55e11a6"

    Proxy bbbProxy
    DocumentBuilderFactory docBuilderFactory
    DocumentBuilder docBuilder

    BigbluebuttonService(){
        // Initialize XML libraries
        docBuilderFactory = DocumentBuilderFactory.newInstance()
        try {
            docBuilder = docBuilderFactory.newDocumentBuilder()
        } catch (ParserConfigurationException e) {
            logger.error("Failed to initialise BaseProxy", e)
        }
        
        //Instantiate bbbProxy and initialize it with default url and salt
        bbbProxy = new Proxy(url, salt)
    
    }
    
    
    public String getJoinURL(params, welcome){
        log.debug params
        //Set the injected values
        if( !url.equals(bbbProxy.url) && !url.equals("") ) bbbProxy.setUrl(url)
        if( !salt.equals(bbbProxy.salt) && !salt.equals("") ) bbbProxy.setSalt(salt)

        String joinURL = null
        
        String meetingName = getValidatedMeetingName(params.get(Parameter.RESOURCE_LINK_TITLE))
        log.debug "Validated meetingName=" + meetingName
        String meetingID = getValidatedMeetingId(params.get(Parameter.RESOURCE_LINK_ID), params.get(Parameter.COURSE_ID), params.get(Parameter.CONSUMER_ID))
        log.debug "Validated meetingID=" + meetingID
        String attendeePW = DigestUtils.shaHex("ap" + params.get(Parameter.RESOURCE_LINK_ID))
        log.debug "Validated attendeePW=" + attendeePW
        String moderatorPW = DigestUtils.shaHex("mp" + params.get(Parameter.RESOURCE_LINK_ID))
        log.debug "Validated moderatorPW=" + moderatorPW
        String logoutURL = getValidatedLogoutURL(params.get(Parameter.LAUNCH_RETURN_URL))
        log.debug "Validated logoutURL=" + logoutURL
        boolean isModerator = Role.isModerator(params.get(Parameter.ROLES))
        log.debug "Validated isModerator=" + isModerator
        String userFullName = getValidatedUserFullName(params.get(Parameter.USER_FULL_NAME), isModerator)
        log.debug "Validated userFullName=" + userFullName
        String courseTitle = getValidatedCourseTitle(params.get(Parameter.COURSE_TITLE))
        log.debug "Validated courseTitle=" + courseTitle
        
        
        String[] values = [meetingName, courseTitle]
        //values[0] = meetingName
        //values[1] = courseTitle
        String welcomeMsg = MessageFormat.format(welcome, values);
        
        String createURL = getCreateURL( meetingName, meetingID, attendeePW, moderatorPW, welcomeMsg, logoutURL )
        log.debug "createURL: " + createURL
        Map<String, Object> createResponse = doAPICall(createURL)
        log.debug "createResponse: " + createResponse

        if( createResponse != null){
            String returnCode = (String) createResponse.get("returncode")
            String messageKey = (String) createResponse.get("messageKey")
            if ( Proxy.APIRESPONSE_SUCCESS.equals(returnCode) ||
                (Proxy.APIRESPONSE_FAILED.equals(returnCode) &&  (Proxy.MESSAGEKEY_IDNOTUNIQUE.equals(messageKey) || Proxy.MESSAGEKEY_DUPLICATEWARNING.equals(messageKey)) ) ){
                joinURL = bbbProxy.getJoinMeetingURL( userFullName, meetingID, isModerator? moderatorPW: attendeePW);
            }
        }

        return joinURL
        
    }
    
    private String getCreateURL(String name, String meetingID, String attendeePW, String moderatorPW, String welcome, String logoutURL ) {
        Integer voiceBridge = 70000 + new Random(System.currentTimeMillis()).nextInt(10000);

        String url = bbbProxy.getCreateURL(name, meetingID, attendeePW, moderatorPW, welcome, "", voiceBridge.toString(), "", logoutURL, "", "", "", "" );
        return url;
    }
    
    private String getValidatedMeetingName(String meetingName){
        return (meetingName == null || meetingName == "")? "Meeting": meetingName
    }
    
    private String getValidatedMeetingId(String meetingId, String courseId, String consumerId){
        return DigestUtils.shaHex(meetingId + courseId + consumerId)
    }

    private String getValidatedLogoutURL(String logoutURL){
        return (logoutURL == null)? "": logoutURL
    }
    
    private String getValidatedUserFullName(String userFullName, boolean isModerator){
        return (userFullName == null || userFullName == "")? (isModerator? "Moderator" : "Attendee"): userFullName
    }

    private String getValidatedCourseTitle(String courseTitle){
        return (courseTitle == null || courseTitle == "")? "Course": courseTitle
    }

    /** Make an API call */
    private Map<String, Object> doAPICall(String query) {
        StringBuilder urlStr = new StringBuilder(query);

        try {
            // open connection
            log.debug("doAPICall.call: " + query );
            
            URL url = new URL(urlStr.toString());
            HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
            httpConnection.setUseCaches(false);
            httpConnection.setDoOutput(true);
            httpConnection.setRequestMethod("GET");
            httpConnection.connect();

            int responseCode = httpConnection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // read response
                InputStreamReader isr = null;
                BufferedReader reader = null;
                StringBuilder xml = new StringBuilder();
                try {
                    isr = new InputStreamReader(httpConnection.getInputStream(), "UTF-8");
                    reader = new BufferedReader(isr);
                    String line = reader.readLine();
                    while (line != null) {
                        if( !line.startsWith("<?xml version=\"1.0\"?>"))
                            xml.append(line.trim());
                        line = reader.readLine();
                    }
                } finally {
                    if (reader != null)
                        reader.close();
                    if (isr != null)
                        isr.close();
                }
                httpConnection.disconnect();

                // parse response
                log.debug("doAPICall.responseXml: " + xml);
                //Patch to fix the NaN error
                String stringXml = xml.toString();
                stringXml = stringXml.replaceAll(">.\\s+?<", "><");
                
                Document dom = null;
                dom = docBuilder.parse(new InputSource( new StringReader(stringXml)));
                
                Map<String, Object> response = getNodesAsMap(dom, "response");
                log.debug("doAPICall.responseMap: " + response);
                
                String returnCode = (String) response.get("returncode");
                if (Proxy.APIRESPONSE_FAILED.equals(returnCode)) {
                    log.debug("doAPICall." + (String) response.get("messageKey") + ": Message=" + (String) response.get("message"));
                }

                return response;

            } else {
                log.debug("doAPICall.HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode);
            }

        } catch(IOException e) {
            log.debug("doAPICall.IOException: Message=" + e.getMessage());
        } catch(SAXException e) {
            log.debug("doAPICall.SAXException: Message=" + e.getMessage());
        } catch(IllegalArgumentException e) {
            log.debug("doAPICall.IllegalArgumentException: Message=" + e.getMessage());
        } catch(Exception e) {
            log.debug("doAPICall.Exception: Message=" + e.getMessage());
        }
    }

    
    /** Get all nodes under the specified element tag name as a Java map */
    private Map<String, Object> getNodesAsMap(Document dom, String elementTagName) {
        Node firstNode = dom.getElementsByTagName(elementTagName).item(0);
        return processNode(firstNode);
    }

    private Map<String, Object> processNode(Node _node) {
        Map<String, Object> map = new HashMap<String, Object>();
        NodeList responseNodes = _node.getChildNodes();
        for (int i = 0; i < responseNodes.getLength(); i++) {
            Node node = responseNodes.item(i);
            String nodeName = node.getNodeName().trim();
            if (node.getChildNodes().getLength() == 1
                    && ( node.getChildNodes().item(0).getNodeType() == org.w3c.dom.Node.TEXT_NODE || node.getChildNodes().item(0).getNodeType() == org.w3c.dom.Node.CDATA_SECTION_NODE) ) {
                String nodeValue = node.getTextContent();
                map.put(nodeName, nodeValue != null ? nodeValue.trim() : null);
            
            } else if (node.getChildNodes().getLength() == 0
                    && node.getNodeType() != org.w3c.dom.Node.TEXT_NODE
                    && node.getNodeType() != org.w3c.dom.Node.CDATA_SECTION_NODE) {
                map.put(nodeName, "");
            
            } else if ( node.getChildNodes().getLength() >= 1
                    && node.getChildNodes().item(0).getChildNodes().item(0).getNodeType() != org.w3c.dom.Node.TEXT_NODE
                    && node.getChildNodes().item(0).getChildNodes().item(0).getNodeType() != org.w3c.dom.Node.CDATA_SECTION_NODE ) {

                List<Object> list = new ArrayList<Object>();
                for (int c = 0; c < node.getChildNodes().getLength(); c++) {
                    Node n = node.getChildNodes().item(c);
                    list.add(processNode(n));
                }
                map.put(nodeName, list);
            
            } else {
                map.put(nodeName, processNode(node));
            }
        }
        return map;
    }
    
}
