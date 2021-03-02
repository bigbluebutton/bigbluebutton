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
package org.bigbluebutton.api;

import java.net.URLEncoder;
import java.util.Random;

import org.apache.commons.codec.digest.DigestUtils;

public class Proxy {
    
    // API Server Path
    protected final static String API_SERVERPATH = "/api/";

    // API Calls
    protected final static String APICALL_CREATE = "create";
    protected final static String APICALL_JOIN = "join";
    protected final static String APICALL_ISMEETINGRUNNING = "isMeetingRunning";
    protected final static String APICALL_END = "end";
    protected final static String APICALL_GETMEETINGINFO = "getMeetingInfo";
    protected final static String APICALL_GETMEETINGS = "getMeetings";
    protected final static String APICALL_GETRECORDINGS = "getRecordings";
    protected final static String APICALL_PUBLISHRECORDINGS = "publishRecordings";
    protected final static String APICALL_DELETERECORDINGS = "deleteRecordings";

    // API Response Codes
    protected final static String APIRESPONSE_SUCCESS = "SUCCESS";
    protected final static String APIRESPONSE_FAILED = "FAILED";

    // API MesageKey Codes
    protected final static String MESSAGEKEY_IDNOTUNIQUE = "idNotUnique";
    protected final static String MESSAGEKEY_DUPLICATEWARNING = "duplicateWarning";
    
    protected final static String PARAMETERENCODING = "UTF-8";
    
    String url;
    String salt;
    
    Proxy(String url, String salt) {
        this.url = url;
        this.salt = salt;
    }
    
    public void setUrl(String url){
        if( url.substring(url.length()-1).equals("/") )
            this.url = url.substring(0, url.length()-1);
        else
            this.url = url;
        //this.url = url;
    }
    
    public void setSalt(String salt){
        this.salt = salt;
    }
    
    public String getCreateURL(String name, String meetingID, String attendeePW, String moderatorPW, String welcome, String dialNumber, String voiceBridge, String webVoice, String logoutURL, String maxParticipants, String record, String duration, String meta ) {

        String url;
        url = "name=" + getStringEncoded(name);
        url += "&meetingID=" + meetingID;
        url += "&moderatorPW=" + moderatorPW;
        url += "&attendeePW=" + attendeePW;
        url += "&welcome=" + getStringEncoded(welcome);
        url += "&logoutURL=" + getStringEncoded(logoutURL);
        url += "&voiceBridge=" + voiceBridge;
        if ( maxParticipants != null ) {
            url += "&maxParticipants=" + maxParticipants;
        }
        if ( dialNumber != null ) {
            url += "&dialNumber=" + dialNumber;
        }
        if ( webVoice != null ) {
            url += "&webVoice=" + webVoice;
        }
        url += "&record=" + record;
        url += "&duration=" + duration;
        url += "&" + meta;

        url += getCheckSumParameterForQuery(APICALL_CREATE, url);
        
        return this.url + API_SERVERPATH + APICALL_CREATE + "?" + url;
    }
    
    public String getJoinURL(String fullName, String meetingID, String password, String createTime, String userID) {
        String url = getJoinURL(fullName, meetingID, password, createTime, userID, "" );
        return url;
        
    }

    public String getJoinURL(String fullName, String meetingID, String password, String createTime, String userID, String webVoiceConf ) {

        String url;
        url = "fullName=" + getStringEncoded(fullName);
        url += "&meetingID=" + meetingID;
        url += "&password=" + password;
        url += "".equals(createTime)? "": "&createTime=" + createTime;
        url += "&userID=" + userID;
        url += "&webVoiceConf=" + webVoiceConf;

        url += getCheckSumParameterForQuery(APICALL_JOIN, url);
        
        return this.url + API_SERVERPATH + APICALL_JOIN + "?" + url;
    }

    public String getIsMeetingRunningURL(String meetingID) {

        String url = "meetingID=" + meetingID;
        url += getCheckSumParameterForQuery(APICALL_ISMEETINGRUNNING, url);
        
        return this.url + API_SERVERPATH + APICALL_ISMEETINGRUNNING + "?" + url;
    }

    public String getEndURL(String meetingID, String password) {
        
        String url = "meetingID=" + meetingID;
        url += "&password=" + password;
        url += getCheckSumParameterForQuery(APICALL_END, url);
        
        return this.url + API_SERVERPATH + APICALL_END + "?" + url;
    }
    
    public String getGetMeetingInfoURL(String meetingID, String password) {
        
        String url = "meetingID=" + meetingID;
        url += "&password=" + password;
        url += getCheckSumParameterForQuery(APICALL_GETMEETINGINFO, url);
        
        return this.url + API_SERVERPATH + APICALL_GETMEETINGINFO + "?" + url;
    }

    public String getGetMeetingsURL(String meetingID, String password) {
        
        String url = getCheckSumParameterForQuery(APICALL_END, "");
        
        return this.url + API_SERVERPATH + APICALL_END + "?" + url;
    }

    public String getGetRecordingsURL(String meetingID) {
        
        String queryString = "meetingID=" + meetingID;
        queryString += getCheckSumParameterForQuery(APICALL_GETRECORDINGS, queryString);
        
        return this.url + API_SERVERPATH + APICALL_GETRECORDINGS + "?" + queryString;
    }
    
    public String getPublishRecordingsURL(String recordID, String publish) {
        
        String url = "recordID=" + recordID;
        url += "&publish=" + publish;
        url += getCheckSumParameterForQuery(APICALL_PUBLISHRECORDINGS, url);
        
        return this.url + API_SERVERPATH + APICALL_PUBLISHRECORDINGS + "?" + url;
    }
    
    public String getDeleteRecordingsURL(String recordID) {
        
        String url = "recordID=" + recordID;
        url += getCheckSumParameterForQuery(APICALL_DELETERECORDINGS, url);
        
        return this.url + API_SERVERPATH + APICALL_DELETERECORDINGS + "?" + url;
    }
    
    public String getStringEncoded(String string){
        String stringEncoded = "";
        
        try {
            stringEncoded = URLEncoder.encode(string, PARAMETERENCODING); 
        } catch(Exception e){}
        
        return stringEncoded;
    }
    
    /** Creates the checksum parameter to be included as part of the url */
    private String getCheckSumParameterForQuery(String apiCall, String queryString) {
        if (this.salt != null)
            return "&checksum=" + DigestUtils.shaHex(apiCall + queryString + this.salt);
        else
            return "";
    }

}
