package org.bigbluebutton
/* 
    BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

    Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).

    This program is free software; you can redistribute it and/or modify it under the
    terms of the GNU Lesser General Public License as published by the Free Software
    Foundation; either version 3.0 of the License, or (at your option) any later
    version.

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along
    with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
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

    public String getJoinURL(params, welcome, mode){
        //Set the injected values
        if( !url.equals(bbbProxy.url) && !url.equals("") ) bbbProxy.setUrl(url)
        if( !salt.equals(bbbProxy.salt) && !salt.equals("") ) bbbProxy.setSalt(salt)

        String joinURL = null

        String meetingName = getValidatedMeetingName(params.get(Parameter.RESOURCE_LINK_TITLE))
        String meetingID = getValidatedMeetingId(params.get(Parameter.RESOURCE_LINK_ID), params.get(Parameter.CONSUMER_ID))
        String attendeePW = DigestUtils.shaHex("ap" + params.get(Parameter.RESOURCE_LINK_ID) + params.get(Parameter.CONSUMER_ID))
        String moderatorPW = DigestUtils.shaHex("mp" + params.get(Parameter.RESOURCE_LINK_ID) + params.get(Parameter.CONSUMER_ID))
        String logoutURL = getValidatedLogoutURL(params.get(Parameter.LAUNCH_RETURN_URL))
        boolean isModerator = isModerator(params)
        String userFullName = getValidatedUserFullName(params, isModerator)
        String courseTitle = getValidatedCourseTitle(params.get(Parameter.COURSE_TITLE))
        String userID = getValidatedUserId(params.get(Parameter.USER_ID))

        Integer voiceBridge = 0
        String record = false
        Integer duration = 0
        if( "extended".equals(mode) ){
            voiceBridge = getValidatedBBBVoiceBridge(params.get(Parameter.CUSTOM_VOICEBRIDGE))
            record = getValidatedBBBRecord(params.get(Parameter.CUSTOM_RECORD))
            duration = getValidatedBBBDuration(params.get(Parameter.CUSTOM_DURATION))
        }

        Boolean allModerators = Boolean.valueOf(false)
        if ( params.containsKey(Parameter.CUSTOM_ALL_MODERATORS) ) {
            allModerators = Boolean.parseBoolean(params.get(Parameter.CUSTOM_ALL_MODERATORS))
        }

        String[] values = [meetingName, courseTitle]
        String welcomeMsg = MessageFormat.format(welcome, values)

        String meta = getMonitoringMetaData(params)

        String createURL = getCreateURL( meetingName, meetingID, attendeePW, moderatorPW, welcomeMsg, voiceBridge, logoutURL, record, duration, meta )
        log.debug "createURL: " + createURL
        Map<String, Object> createResponse = doAPICall(createURL)
        log.debug "createResponse: " + createResponse

        if( createResponse != null){
            String returnCode = (String) createResponse.get("returncode")
            String messageKey = (String) createResponse.get("messageKey")
            if ( Proxy.APIRESPONSE_SUCCESS.equals(returnCode) ||
                (Proxy.APIRESPONSE_FAILED.equals(returnCode) &&  (Proxy.MESSAGEKEY_IDNOTUNIQUE.equals(messageKey) || Proxy.MESSAGEKEY_DUPLICATEWARNING.equals(messageKey)) ) ){
                joinURL = bbbProxy.getJoinURL( userFullName, meetingID, (isModerator || allModerators)? moderatorPW: attendeePW, (String) createResponse.get("createTime"), userID);
            }
        }

        return joinURL
    }

    public Object getRecordings(params){
        //Set the injected values
        if( !url.equals(bbbProxy.url) && !url.equals("") ) bbbProxy.setUrl(url)
        if( !salt.equals(bbbProxy.salt) && !salt.equals("") ) bbbProxy.setSalt(salt)

        String meetingID = getValidatedMeetingId(params.get(Parameter.RESOURCE_LINK_ID), params.get(Parameter.CONSUMER_ID))

        String recordingsURL = bbbProxy.getGetRecordingsURL( meetingID )
        log.debug "recordingsURL: " + recordingsURL
        Map<String, Object> recordings = doAPICall(recordingsURL)

        if( recordings != null){
            String returnCode = (String) recordings.get("returncode")
            String messageKey = (String) recordings.get("messageKey")
            if ( Proxy.APIRESPONSE_SUCCESS.equals(returnCode) && messageKey == null ){
                return recordings.get("recordings")
            }
        }

        return null
    }

    public Object doDeleteRecordings(params){
        //Set the injected values
        if( !url.equals(bbbProxy.url) && !url.equals("") ) bbbProxy.setUrl(url)
        if( !salt.equals(bbbProxy.salt) && !salt.equals("") ) bbbProxy.setSalt(salt)

        Map<String, Object> result

        String recordingId = getValidatedBBBRecordingId(params.get(Parameter.BBB_RECORDING_ID))

        if( !recordingId.equals("") ){
            String deleteRecordingsURL = bbbProxy.getDeleteRecordingsURL( recordingId )
            log.debug "deleteRecordingsURL: " + deleteRecordingsURL
            result = doAPICall(deleteRecordingsURL)
        } else {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "InvalidRecordingId")
            result.put("resultMessage", "RecordingId is invalid. The recording can not be deleted.")
        }

        return result
    }

    public Object doPublishRecordings(params){
        //Set the injected values
        if( !url.equals(bbbProxy.url) && !url.equals("") ) bbbProxy.setUrl(url)
        if( !salt.equals(bbbProxy.salt) && !salt.equals("") ) bbbProxy.setSalt(salt)

        Map<String, Object> result

        String recordingId = getValidatedBBBRecordingId(params.get(Parameter.BBB_RECORDING_ID))
        String publish = getValidatedBBBRecordingPublished(params.get(Parameter.BBB_RECORDING_PUBLISHED))

        if( !recordingId.equals("") ){
            String publishRecordingsURL = bbbProxy.getPublishRecordingsURL( recordingId, "true".equals(publish)?"false":"true" )
            log.debug "publishRecordingsURL: " + publishRecordingsURL
            result = doAPICall(publishRecordingsURL)
        } else {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "InvalidRecordingId")
            result.put("resultMessage", "RecordingId is invalid. The recording can not be deleted.")
        }

        return result
    }

    public boolean isModerator(params) {
        boolean isModerator = params.get(Parameter.ROLES) != null? Role.isModerator(params.get(Parameter.ROLES)): true
        return isModerator
    }

    private String getCreateURL(String name, String meetingID, String attendeePW, String moderatorPW, String welcome, Integer voiceBridge, String logoutURL, String record, Integer duration, String meta ) {
        voiceBridge = ( voiceBridge == null || voiceBridge == 0 )? 70000 + new Random(System.currentTimeMillis()).nextInt(10000): voiceBridge;

        String url = bbbProxy.getCreateURL(name, meetingID, attendeePW, moderatorPW, welcome, "", voiceBridge.toString(), "", logoutURL, "", record, duration.toString(), meta );
        return url;
    }

    private String getValidatedMeetingName(String meetingName){
        return (meetingName == null || meetingName == "")? "Meeting": meetingName
    }

    private String getValidatedMeetingId(String resourceId, String consumerId){
        return DigestUtils.shaHex(resourceId + consumerId)
    }

    private String getValidatedLogoutURL(String logoutURL){
        return (logoutURL == null)? "": logoutURL
    }

    private String getValidatedUserFullName(params, boolean isModerator){
        String userFullName = params.get(Parameter.USER_FULL_NAME)
        String userFirstName = params.get(Parameter.USER_FIRSTNAME)
        String userLastName = params.get(Parameter.USER_LASTNAME)
        if( userFullName == null || userFullName == "" ){
            if( userFirstName != null && userFirstName != "" ){
                userFullName = userFirstName
            }
            if( userLastName != null && userLastName != "" ){
                userFullName += userFullName.length() > 0? " ": ""
                userFullName += userLastName
            }
            if( userFullName == null || userFullName == "" ){
                userFullName = isModerator? "Moderator" : "Attendee"
            }
        }
        return userFullName
    }

    private String getValidatedCourseTitle(String courseTitle){
        return (courseTitle == null || courseTitle == "")? "Course": courseTitle
    }

    private String getValidatedUserId(String userId){
        return (userId == null)? "": userId
    }
    
    private Integer getValidatedBBBVoiceBridge(String voiceBridge){
        return (voiceBridge != null )? voiceBridge.toInteger(): 0
    }

    private String getValidatedBBBRecord(String record){
        return Boolean.valueOf(record).toString();
    }

    private Integer getValidatedBBBDuration(String duration){
        return (duration != null )? duration.toInteger(): 0
    }

    private String getValidatedBBBRecordingId(String recordingId){
        return (recordingId != null )? recordingId: ""
    }

    private String getValidatedBBBRecordingPublished(String published){
        return (published != null && published.equals("true") )? "true": "false"
    }

    private String getMonitoringMetaData(params){
        String meta

        meta = "meta_origin=" + bbbProxy.getStringEncoded(params.get(Parameter.TOOL_CONSUMER_CODE) == null? "": params.get(Parameter.TOOL_CONSUMER_CODE))
        meta += "&meta_originVersion=" + bbbProxy.getStringEncoded(params.get(Parameter.TOOL_CONSUMER_VERSION) == null? "": params.get(Parameter.TOOL_CONSUMER_VERSION))
        meta += "&meta_originServerCommonName=" + bbbProxy.getStringEncoded(params.get(Parameter.TOOL_CONSUMER_INSTANCE_DESCRIPTION) == null? "": params.get(Parameter.TOOL_CONSUMER_INSTANCE_DESCRIPTION))
        meta += "&meta_originServerUrl=" + bbbProxy.getStringEncoded(params.get(Parameter.TOOL_CONSUMER_INSTANCE_URL) == null? "": params.get(Parameter.TOOL_CONSUMER_INSTANCE_URL))
        meta += "&meta_context=" + bbbProxy.getStringEncoded(params.get(Parameter.COURSE_TITLE) == null? "": params.get(Parameter.COURSE_TITLE))
        meta += "&meta_contextId=" + bbbProxy.getStringEncoded(params.get(Parameter.COURSE_ID) == null? "": params.get(Parameter.COURSE_ID))
        meta += "&meta_contextActivity=" + bbbProxy.getStringEncoded(params.get(Parameter.RESOURCE_LINK_TITLE) == null? "": params.get(Parameter.RESOURCE_LINK_TITLE))
        meta += "&meta_contextActivityDescription=" + bbbProxy.getStringEncoded(params.get(Parameter.RESOURCE_LINK_DESCRIPTION) == null? "": params.get(Parameter.RESOURCE_LINK_DESCRIPTION))

        return meta
    }

    /** Make an API call */
    private Map<String, Object> doAPICall(String query) {
        StringBuilder urlStr = new StringBuilder(query);

        try {
            // open connection
            //log.debug("doAPICall.call: " + query );

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
                //log.debug("doAPICall.responseXml: " + xml);
                //Patch to fix the NaN error
                String stringXml = xml.toString();
                stringXml = stringXml.replaceAll(">.\\s+?<", "><");

                Document dom = null;
                dom = docBuilder.parse(new InputSource( new StringReader(stringXml)));

                Map<String, Object> response = getNodesAsMap(dom, "response");
                //log.debug("doAPICall.responseMap: " + response);

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
    protected Map<String, Object> getNodesAsMap(Document dom, String elementTagName) {
        Node firstNode = dom.getElementsByTagName(elementTagName).item(0);
        return processNode(firstNode);
    }

    protected Map<String, Object> processNode(Node _node) {
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
