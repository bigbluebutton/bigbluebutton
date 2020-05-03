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
package org.bigbluebutton.web.services;

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

import org.bigbluebutton.web.ClientMappings

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import org.apache.commons.codec.digest.DigestUtils;

import org.bigbluebutton.api.*
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.web.services.Proxy
import org.bigbluebutton.web.services.Role
import org.bigbluebutton.web.services.Parameter
import org.bigbluebutton.web.UrlMappings
import groovy.json.JsonSlurper

class ApiService {

    ParamsProcessorUtil paramsProcessorUtil

    def url;
    def salt;
    def idParams = "meetingID,oauth_consumer_key"

    Proxy bbbProxy
    DocumentBuilderFactory docBuilderFactory
    DocumentBuilder docBuilder

    ApiService(processorUtil){
        this.paramsProcessorUtil = processorUtil;
        this.url = processorUtil.getDefaultServerUrl();
        this.salt = processorUtil.getSecuritySalt();

        // Initialize XML libraries
        docBuilderFactory = DocumentBuilderFactory.newInstance()
        try {
            docBuilder = docBuilderFactory.newDocumentBuilder()
        } catch (ParserConfigurationException e) {
            log.error("Failed to initialise BaseProxy", e)
        }
        //Instantiate bbbProxy and initialize it with default url and salt
        bbbProxy = new Proxy(url, salt)
    }

    public String joinUrl(params, welcome, mode){
        // Set the injected values
        if (!url.equals(bbbProxy.url) && !url.equals("")) {
            bbbProxy.setUrl(url)
        }
        if (!salt.equals(bbbProxy.salt) && !salt.equals("")) {
            bbbProxy.setSalt(salt)
        }

        String meetingName = getValidatedMeetingName(params.get(Parameter.RESOURCE_LINK_TITLE))
        String meetingID = getValidatedMeetingId(getParamsForMeetingId(params))
        String attendeePW = params.get('attendeePW')
        String moderatorPW = params.get('moderatorPW') || ClientMappings.salesforce.get(params.target).get("moderatorPW")
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
            record = getValidatedBBBRecord(params.get(Parameter.CUSTOM_RECORD)) || ltiService.allRecordedByDefault()
            duration = getValidatedBBBDuration(params.get(Parameter.CUSTOM_DURATION))
        }
        Boolean allModerators = Boolean.valueOf(false)
        if ( params.containsKey(Parameter.CUSTOM_ALL_MODERATORS) ) {
            allModerators = Boolean.parseBoolean(params.get(Parameter.CUSTOM_ALL_MODERATORS))
        }
        String[] values = [meetingName, courseTitle]
        String welcomeMsg = MessageFormat.format(welcome, values)
        String meta = getMonitoringMetaData(params)
        String createURL = getCreateURL(meetingName, meetingID, attendeePW, moderatorPW, welcomeMsg, voiceBridge, logoutURL, record, duration, meta)
        Map<String, Object> responseAPICall = doAPICall(createURL)
        if (responseAPICall == null) {
            return null
        }
        Object response = (Object)responseAPICall.get("response")
        String returnCode = (String)response.get("returncode")
        String messageKey = (String)response.get("messageKey")
        if (!Proxy.APIRESPONSE_SUCCESS.equals(returnCode) ||
                !Proxy.MESSAGEKEY_DUPLICATEWARNING.equals(messageKey) &&
                !"".equals(messageKey)) {
            return null
        }
        def joinURL = bbbProxy.getJoinURL(userFullName, meetingID, (isModerator || allModerators)? moderatorPW: attendeePW, (String) response.get("createTime"), userID)
        log.info "joinURL: " + joinURL
        return joinURL
    }

    public Object getRecordings(params) {
        // Set the injected values
        if (!url.equals(bbbProxy.url) && !url.equals("")) {
            bbbProxy.setUrl(url)
        }
        if (!salt.equals(bbbProxy.salt) && !salt.equals("")) {
            bbbProxy.setSalt(salt)
        }
        String meetingID = getValidatedMeetingId(getParamsForMeetingId(params))
        String recordingsURL = bbbProxy.getGetRecordingsURL(meetingID)
        Map<String, Object> responseAPICall = doAPICall(recordingsURL)
        if (responseAPICall == null) {
            return null
        }
        Object response = (Object)responseAPICall.get("response")
        String returnCode = (String)response.get("returncode")
        String messageKey = (String)response.get("messageKey")
        if (!Proxy.APIRESPONSE_SUCCESS.equals(returnCode) || messageKey != null) {
            return null
        }
        Object recordings = (Object)response.get("recordings")
        return recordings
    }

    Object doDeleteRecordings(params){
        // Set the injected values
        if (!url.equals(bbbProxy.url) && !url.equals("")) {
            bbbProxy.setUrl(url)
        }
        if (!salt.equals(bbbProxy.salt) && !salt.equals("")) {
            bbbProxy.setSalt(salt)
        }
        String recordingId = getValidatedBBBRecordingId(params.get(Parameter.BBB_RECORDING_ID))
        if (!recordingId.equals("")) {
            String deleteRecordingsURL = bbbProxy.getDeleteRecordingsURL( recordingId )
            return doAPICall(deleteRecordingsURL)
        }
        def result = new HashMap<String, String>()
        result.put("messageKey", "InvalidRecordingId")
        result.put("message", "RecordingId is invalid. The recording can not be deleted.")
        return result
    }

    Object doPublishRecordings(params){
        // Set the injected values
        if (!url.equals(bbbProxy.url) && !url.equals("")) {
            bbbProxy.setUrl(url)
        }
        if (!salt.equals(bbbProxy.salt) && !salt.equals("")) {
            bbbProxy.setSalt(salt)
        }
        String recordingId = getValidatedBBBRecordingId(params.get(Parameter.BBB_RECORDING_ID))
        String publish = getValidatedBBBRecordingPublished(params.get(Parameter.BBB_RECORDING_PUBLISHED))
        if( !recordingId.equals("") ){
            String publishRecordingsURL = bbbProxy.getPublishRecordingsURL( recordingId, "true".equals(publish)?"false":"true" )
            return doAPICall(publishRecordingsURL)
        }
        def result = new HashMap<String, String>()
        result.put("messageKey", "InvalidRecordingId")
        result.put("message", "RecordingId is invalid. The recording can not be deleted.")
        return result
    }

    boolean isModerator(params) {
        //TODO: this needs to be changed to compare the moderatorPW to the meetingId moderatorPW
		if (params.get('moderatorPW') == null) {
			return false
		} 
		def salesforceClient = ClientMappings.salesforce.get(params.target);
		if (params.get('moderatorPW') == salesforceClient.get('moderatorPW')) {
			return true
		} 
		throw new Exception("Invalid Moderator Password")
    }

    private String getCreateURL(String name, String meetingID, String attendeePW, String moderatorPW, String welcome, Integer voiceBridge, String logoutURL, String record, Integer duration, String meta ) {
        voiceBridge = ( voiceBridge == null || voiceBridge == 0 )? 70000 + new Random(System.currentTimeMillis()).nextInt(10000): voiceBridge;

        String url = bbbProxy.getCreateURL(name, meetingID, attendeePW, moderatorPW, welcome, null, voiceBridge.toString(), null, logoutURL, null, record, duration.toString(), meta );
        return url;
    }

    private String getValidatedMeetingName(String meetingName){
        return (meetingName == null || meetingName == "")? "Meeting": meetingName
    }

    private String getValidatedMeetingId(String params){
        return DigestUtils.shaHex(params)
    }

    private String getValidatedLogoutURL(String logoutURL){
        return (logoutURL == null)? "": logoutURL
    }

    private String getValidatedUserFullName(params, boolean isModerator){
        String userFullName = params.get(Parameter.USER_FULL_NAME)
        String userFirstName = params.get(Parameter.USER_FIRSTNAME)
        String userLastName = params.get(Parameter.USER_LASTNAME)
        if(userFullName == null || userFullName == ""){
            if (userFirstName != null && userFirstName != "") {
                userFullName = userFirstName
            }
            if (userLastName != null && userLastName != "") {
                userFullName += userFullName.length() > 0? " ": ""
                userFullName += userLastName
            }
            if (userFullName == null || userFullName == "") {
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
        meta  = "meta_origin=" + bbbProxy.getStringEncoded(params.get(Parameter.TOOL_CONSUMER_CODE) == null? "": params.get(Parameter.TOOL_CONSUMER_CODE))
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
            URL url = new URL(urlStr.toString());
            HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
            httpConnection.setUseCaches(false);
            httpConnection.setDoOutput(true);
            httpConnection.setRequestMethod("GET");
            httpConnection.connect();
            int responseCode = httpConnection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // read response
				InputStreamReader isr;
				BufferedReader reader;
                StringBuilder xml = new StringBuilder();
                try {
                    isr = new InputStreamReader(httpConnection.getInputStream(), "UTF-8");
                    reader = new BufferedReader(isr);
                    String line = reader.readLine();
					
                    while (line != null) {
                        if( !line.startsWith("<?xml version=\"1.0\"?>")) {
                            xml.append(line.trim());
                        }
                        line = reader.readLine();
                    }
                } finally {
                    if (reader != null) {
                        reader.close();
                    }
                    if (isr != null) {
                        isr.close();
                    }
                }
                httpConnection.disconnect();
                // Parse response.
                //log.debug("doAPICall.responseXml: " + xml);
                //Patch to fix the NaN error
                String stringXml = xml.toString();
                stringXml = stringXml.replaceAll(">.\\s+?<", "><");
                JSONObject rootJSON = XML.toJSONObject(stringXml);
                Map<String, Object> response = jsonToMap(rootJSON);
                return response;
            } else {
                log.debug "doAPICall.HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode
            }
        } catch(IOException e) {
            log.debug "doAPICall.IOException: Message=" + e.getMessage()
        } catch(SAXException e) {
            log.debug "doAPICall.SAXException: Message=" + e.getMessage()
        } catch(IllegalArgumentException e) {
            log.debug "doAPICall.IllegalArgumentException: Message=" + e.getMessage()
        } catch(Exception e) {
            log.debug 'MIKE ERROR: ' + e
            log.debug "doAPICall.Exception: Message=" + e.getMessage()
        }
    }

	public String getRefreshToken(String clientName) {

		String query = 'https://ptu21cf23f.execute-api.us-east-1.amazonaws.com/prod/jamauth/getToken';
		query += '?id=' + clientName 
		try {
			// open connection
			log.debug "doAPICall.call: " + query
			URL url = new URL(query);
			HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
			httpConnection.setUseCaches(false);
			httpConnection.setDoOutput(true);
			httpConnection.setRequestMethod("GET");
			httpConnection.setRequestProperty("Content-Type", "application/json");
	        // httpConnection.setRequestProperty("Authorization", auth);

			httpConnection.connect();
			int responseCode = httpConnection.getResponseCode();

			if (responseCode == HttpURLConnection.HTTP_OK) {
				// read response
				InputStreamReader isr = null;
				BufferedReader reader = null;
				StringBuilder xml = new StringBuilder();
				String response;
				try {
					isr = new InputStreamReader(httpConnection.getInputStream(), "UTF-8");
					reader = new BufferedReader(isr);
					response = reader.readLine();
					return response;
					
					while (response != null) {
						response = reader.readLine();
					}
				} finally {
					if (reader != null) {
						reader.close();
					}
					if (isr != null) {
						isr.close();
					}
				}
				httpConnection.disconnect();
				return response;
			} else {
				log.debug "doAPICall.HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode
			}
		} catch(IOException e) {
			log.debug "doAPICall.IOException: Message=" + e.getMessage()
		} catch(SAXException e) {
			log.debug "doAPICall.SAXException: Message=" + e.getMessage()
		} catch(IllegalArgumentException e) {
			log.debug "doAPICall.IllegalArgumentException: Message=" + e.getMessage()
		} catch(Exception e) {
			log.debug 'MIKE ERROR: ' + e
			log.debug "doAPICall.Exception: Message=" + e.getMessage()
		}
	}

	public String storeRefreshToken(
		String clientName, 
		String clientId, 
		String clientSecret, 
		String token
	) {
		String query = 'https://ptu21cf23f.execute-api.us-east-1.amazonaws.com/prod/jamauth/storeToken';
		query += '?id=' + clientName + '&key=' + clientId + '&secret=' + clientSecret + '&token=' + token;
		try {
			// open connection
			log.debug "doAPICall.call: " + query
			URL url = new URL(query);
			HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
			httpConnection.setUseCaches(false);
			httpConnection.setDoOutput(true);
			httpConnection.setRequestMethod("POST");
			httpConnection.setRequestProperty("Content-Type", "application/json");
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
						if( !line.startsWith("<?xml version=\"1.0\"?>")) {
						    xml.append(line.trim());
						}
						line = reader.readLine();
					}
				} finally {
					if (reader != null) {
						reader.close();
					}
					if (isr != null) {
						isr.close();
					}
				}
				httpConnection.disconnect();

				String stringXml = xml.toString();
				stringXml = stringXml.replaceAll(">.\\s+?<", "><");
				JSONObject rootJSON = XML.toJSONObject(stringXml);
				Map<String, Object> response = jsonToMap(rootJSON);
				return response;
			} else {
				log.debug "doAPICall.HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode
			}
		} catch(IOException e) {
			log.debug "doAPICall.IOException: Message=" + e.getMessage()
		} catch(SAXException e) {
			log.debug "doAPICall.SAXException: Message=" + e.getMessage()
		} catch(IllegalArgumentException e) {
			log.debug "doAPICall.IllegalArgumentException: Message=" + e.getMessage()
		} catch(Exception e) {
			log.debug "doAPICall.Exception: Message=" + e.getMessage()
		}
	}

	public String makeSFCall(String query, String accessToken) {
		String auth = 'Bearer ' + accessToken;
		try {
			// open connection
			log.debug "doAPICall.call: " + query
			URL url = new URL(query);
			HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
			httpConnection.setUseCaches(false);
			httpConnection.setDoOutput(true);
			httpConnection.setRequestMethod("POST");
			httpConnection.setRequestProperty("Content-Type", "application/json");
			httpConnection.setRequestProperty("Authorization", auth);

			String requestBody = "{\"name\": \"ManMosas\"}";
			byte[] outputInBytes = requestBody.getBytes("UTF-8");
			OutputStream os = httpConnection.getOutputStream();
			os.write( outputInBytes );    

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
						if( !line.startsWith("<?xml version=\"1.0\"?>")) {
						    xml.append(line.trim());
						}
						line = reader.readLine();
					}
				} finally {
					if (reader != null) {
						reader.close();
					}
					if (isr != null) {
						isr.close();
					}
				}
				httpConnection.disconnect();
				// Parse response.
				//log.debug("doAPICall.responseXml: " + xml);
				//Patch to fix the NaN error
				String stringXml = xml.toString();
				stringXml = stringXml.replaceAll(">.\\s+?<", "><");
				JSONObject rootJSON = XML.toJSONObject(stringXml);
				Map<String, Object> response = jsonToMap(rootJSON);
				return response;
			} else {
				log.debug "doAPICall.HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode
			}
		} catch(IOException e) {
			log.debug "doAPICall.IOException: Message=" + e.getMessage()
		} catch(SAXException e) {
			log.debug "doAPICall.SAXException: Message=" + e.getMessage()
		} catch(IllegalArgumentException e) {
			log.debug "doAPICall.IllegalArgumentException: Message=" + e.getMessage()
		} catch(Exception e) {
			log.debug "doAPICall.Exception: Message=" + e.getMessage()
		}
	}

	private static String getOauthCallback() { return 'https://071c173e.ngrok.io/bigbluebutton/api/oauthCallback'; }

	public String getOAuthCode(String clientId) {
		String client = '?client_id=' + clientId
		String responseType = '&response_type=code'
		String redirectUri = '&redirect_uri=' + ApiService.getOauthCallback()

		return 'https://login.salesforce.com/services/oauth2/authorize' + client + responseType + redirectUri
	}

    public String getOAuthRefreshToken(String clientId, String clientSecret, String authToken) {
        String request = buildOAuthUrl(clientId, clientSecret, authToken)

        URL postUrl = new URL(request);
        HttpURLConnection httpConnection = (HttpURLConnection) postUrl.openConnection();
        httpConnection.setUseCaches(false);
        httpConnection.setDoOutput(true);
        httpConnection.setRequestMethod("POST");
        httpConnection.setRequestProperty("Content-Type", "application/json");
		httpConnection.connect();

		BufferedReader br = new BufferedReader(new InputStreamReader((httpConnection.getInputStream())));
		StringBuilder sb = new StringBuilder();
		String output;
		while ((output = br.readLine()) != null) {
			sb.append(output);
		}
		String response = sb.toString()
		def jsonSlurp = new JsonSlurper()
		def responseObj = jsonSlurp.parseText(response);
		
		return responseObj.refresh_token
    }

	def getOAuthAccessToken(String clientId, String clientSecret, String refreshToken) {
		String client = '?client_id=' + clientId + '&client_secret=' + clientSecret
        String grantType = '&grant_type=refresh_token'
        String token = '&refresh_token=' + refreshToken

		String requestUrl = 'https://login.salesforce.com/services/oauth2/token' + client + grantType + token

		log.debug 'Getting access token from refresh token: ' + requestUrl

		URL postUrl = new URL(requestUrl);
		HttpURLConnection httpConnection = (HttpURLConnection) postUrl.openConnection();
		httpConnection.setUseCaches(false);
		httpConnection.setDoOutput(true);
		httpConnection.setRequestMethod("POST");
		httpConnection.setRequestProperty("Content-Type", "application/json");
		httpConnection.connect();

		BufferedReader br = new BufferedReader(new InputStreamReader((httpConnection.getInputStream())));
		StringBuilder sb = new StringBuilder();
		String output;
		while ((output = br.readLine()) != null) {
			sb.append(output);
		}
		String response = sb.toString()
		def jsonSlurp = new JsonSlurper()
		def responseObj = jsonSlurp.parseText(response);
		
		return ['accessToken': responseObj.access_token, 'instanceUrl': responseObj.instance_url]

	}

	private String buildOAuthUrl(String clientId,String clientSecret, String authToken) {
		String client = 'client_id=' + clientId
		String secret = '&client_secret=' + clientSecret
		String grantType = '&grant_type=authorization_code'
		String redirectUri = '&redirect_uri=' + ApiService.getOauthCallback()
		String code = '&code=' + authToken
		
		String request = 'https://login.salesforce.com/services/oauth2/token?' + client + secret + grantType + redirectUri + code
		log.info 'REQUESTED URL: ' + request
		return request
	}

    protected Map<String, Object> jsonToMap(JSONObject json) throws JSONException {
		Map<String, Object> retMap = new HashMap<String, Object>();
		if(json != JSONObject.NULL) {
		    retMap = toMap(json);
		}
		return retMap;
    }

    protected Map<String, Object> toMap(JSONObject object) throws JSONException {
		Map<String, Object> map = new HashMap<String, Object>();
		Iterator<String> keysItr = object.keys();
		while(keysItr.hasNext()) {
		    String key = keysItr.next();
		    Object value = object.get(key);
		    if(value instanceof JSONArray) {
				value = toList((JSONArray) value);
		    }
		    else if(value instanceof JSONObject) {
				value = toMap((JSONObject) value);
		    }
		    map.put(key, value);
		}
		return map;
    }

    protected List<Object> toList(JSONArray array) throws JSONException {
		List<Object> list = new ArrayList<Object>();
		for(int i = 0; i < array.length(); i++) {
		    Object value = array.get(i);
		    if(value instanceof JSONArray) {
				value = toList((JSONArray) value);
		    }
		    else if(value instanceof JSONObject) {
				value = toMap((JSONObject) value);
		    }
		    list.add(value);
		}
		return list;
    }

    /**
     * Get the value of all params from idParams (specified in lti-config)
     * If none are specified, fallback to using resource_link_id and oauth_consumer_key
     */
    private String getParamsForMeetingId(params) {
		String[] paramArray = idParams.split(",");
		String result = "";
		for(String s : paramArray) {
		    if(params.get(s) != null) {
				result += params.get(s);
		    }
		}
		// If we can't get anything from config, fallback to old way
		if(result.equals("")) {
		    result = params.get(Parameter.RESOURCE_LINK_ID) + params.get(Parameter.CONSUMER_ID);
		}
		return result;
    }
}