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

import java.util.ArrayList
import java.util.HashMap
import java.util.List
import java.util.Map
import java.util.Properties

import org.apache.commons.codec.digest.DigestUtils

import net.oauth.OAuthMessage
import net.oauth.signature.OAuthSignatureMethod
import net.oauth.signature.HMAC_SHA1
import org.bigbluebutton.lti.Parameter

import BigbluebuttonService
import LtiService

class ToolController {
    private static final String CONTROLLER_NAME = 'ToolController'
    private static final String RESP_CODE_SUCCESS = 'SUCCESS'
    private static final String RESP_CODE_FAILED = 'FAILED'
    private static final String REQUEST_METHOD = "request_method";
    
    LtiService ltiService
    BigbluebuttonService bigbluebuttonService
    
    def index = {
        if( ltiService.consumerMap == null) ltiService.initConsumerMap()
        log.debug CONTROLLER_NAME + "#index"

        setLocalization(params)
        
        params.put(REQUEST_METHOD, request.getMethod().toUpperCase())
        ltiService.logParameters(params)
        
        if( request.post ){
            Map<String, String> result = new HashMap<String, String>()
            ArrayList<String> missingParams = new ArrayList<String>()
            log.debug "Checking for required parameters"

            if (hasAllRequiredParams(params, missingParams)) {
                def sanitizedParams = sanitizePrametersForBaseString(params)
                def consumer = ltiService.getConsumer(params.get(Parameter.CONSUMER_ID))
                if (consumer != null) {
                    log.debug "Found consumer with key " + consumer.get("key") //+ " and sharedSecret " + consumer.get("secret")
                    if (checkValidSignature(params.get(REQUEST_METHOD), ltiService.endPoint, consumer.get("secret"), sanitizedParams, params.get(Parameter.OAUTH_SIGNATURE))) {
                        log.debug  "The message has a valid signature."
                        
                        if( !"extended".equals(ltiService.mode) ) {
                            log.debug  "LTI service running in simple mode."
                            result = doJoinMeeting(params)
                        } else {
                            log.debug  "LTI service running in extended mode."
                            if ( !Boolean.parseBoolean(params.get(Parameter.CUSTOM_RECORD)) ) {
                                log.debug  "No bbb_record parameter was sent; immediately redirecting to BBB session!"
                                result = doJoinMeeting(params)
                            }
                        }
                        
                    } else {
                        log.debug  "The message has NOT a valid signature."
                        result.put("resultMessageKey", "InvalidSignature")
                        result.put("resultMessage", "Invalid signature (" + params.get(Parameter.OAUTH_SIGNATURE) + ").")
                    }
                    
                } else {
                    result.put("resultMessageKey", "ConsumerNotFound")
                    result.put("resultMessage", "Consumer with id = " + params.get(Parameter.CONSUMER_ID) + " was not found.")
                }
    
            } else {
                String missingStr = ""
                for(String str:missingParams) {
                    missingStr += str + ", ";
                }
                result.put("resultMessageKey", "MissingRequiredParameter")
                result.put("resultMessage", "Missing parameters [$missingStr]")
            }

            if( result.containsKey("resultMessageKey") ) {
                log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
                render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])

            } else {
                session["params"] = params
                List<Object> recordings = bigbluebuttonService.getRecordings(params)
                for(Map<String, Object> recording: recordings){
                    /// Calculate duration
                    long endTime = Long.parseLong((String)recording.get("endTime"))
                    endTime -= (endTime % 1000)
                    long startTime = Long.parseLong((String)recording.get("startTime"))
                    startTime -= (startTime % 1000)
                    int duration = (endTime - startTime) / 60000
                    /// Add duration
                    recording.put("duration", duration )
                }

                render(view: "index", model: ['params': params, 'recordingList': recordings, 'ismoderator': bigbluebuttonService.isModerator(params)])
            }

        } else {
            render(text: getCartridgeXML(), contentType: "text/xml", encoding: "UTF-8")

        }
    }

    def join = {
        if( ltiService.consumerMap == null) ltiService.initConsumerMap()
        log.debug CONTROLLER_NAME + "#join"
        Map<String, String> result

        def sessionParams = session["params"]

        if( sessionParams != null ) {
            log.debug "params: " + params
            log.debug "sessionParams: " + sessionParams
            result = doJoinMeeting(sessionParams)
        } else {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "InvalidSession")
            result.put("resultMessage", "Invalid session. User can not execute this action.")
        } 

        if( result.containsKey("resultMessageKey")) {
            log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
            render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])
        }

    }

    def publish = {
        log.debug CONTROLLER_NAME + "#publish"
        Map<String, String> result

        def sessionParams = session["params"]

        if( sessionParams == null ) {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "InvalidSession")
            result.put("resultMessage", "Invalid session. User can not execute this action.")
        } else if ( !bigbluebuttonService.isModerator(sessionParams) ) {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "NotAllowed")
            result.put("resultMessage", "User not allowed to execute this action.")
        } else {
            log.debug "params: " + params
            log.debug "sessionParams: " + sessionParams
            
            //Execute the publish command
            result = bigbluebuttonService.doPublishRecordings(params)
        } 

        if( result.containsKey("resultMessageKey")) {
            log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
            render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])
        } else {
            List<Object> recordings = bigbluebuttonService.getRecordings(sessionParams)
            for(Map<String, Object> recording: recordings){
                /// Calculate duration
                long endTime = Long.parseLong((String)recording.get("endTime"))
                endTime -= (endTime % 1000)
                long startTime = Long.parseLong((String)recording.get("startTime"))
                startTime -= (startTime % 1000)
                int duration = (endTime - startTime) / 60000
                /// Add duration
                recording.put("duration", duration )
            }
            
            render(view: "index", model: ['params': sessionParams, 'recordingList': recordings, 'ismoderator': bigbluebuttonService.isModerator(sessionParams)])

        }

    }

    def delete = {
        log.debug CONTROLLER_NAME + "#delete"
        Map<String, String> result

        def sessionParams = session["params"]

        if( sessionParams == null ) {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "InvalidSession")
            result.put("resultMessage", "Invalid session. User can not execute this action.")
        } else if ( !bigbluebuttonService.isModerator(sessionParams) ) {
            result = new HashMap<String, String>()
            result.put("resultMessageKey", "NotAllowed")
            result.put("resultMessage", "User not allowed to execute this action.")
        } else {
            log.debug "params: " + params
            log.debug "sessionParams: " + sessionParams
            
            //Execute the delete command
            result = bigbluebuttonService.doDeleteRecordings(params)
        }

        if( result.containsKey("resultMessageKey")) {
            log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
            render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])
        } else {
            List<Object> recordings = bigbluebuttonService.getRecordings(sessionParams)
            for(Map<String, Object> recording: recordings){
                /// Calculate duration
                long endTime = Long.parseLong((String)recording.get("endTime"))
                endTime -= (endTime % 1000)
                long startTime = Long.parseLong((String)recording.get("startTime"))
                startTime -= (startTime % 1000)
                int duration = (endTime - startTime) / 60000
                /// Add duration
                recording.put("duration", duration )
            }

            render(view: "index", model: ['params': sessionParams, 'recordingList': recordings, 'ismoderator': bigbluebuttonService.isModerator(sessionParams)])
        }
    }

    private void setLocalization(params){

        String locale = params.get(Parameter.LAUNCH_LOCALE)
        locale = (locale == null || locale.equals("")?"en":locale)
        log.debug "Locale code =" + locale
        String[] localeCodes = locale.split("_")
        //Localize the default welcome message
        if( localeCodes.length > 1 )
            session['org.springframework.web.servlet.i18n.SessionLocaleResolver.LOCALE'] = new Locale(localeCodes[0], localeCodes[1])
        else
            session['org.springframework.web.servlet.i18n.SessionLocaleResolver.LOCALE'] = new Locale(localeCodes[0])
                    
        log.debug "Locale has been set to " + locale

    }

    private Object doJoinMeeting(params) {
        Map<String, String> result = new HashMap<String, String>()
                    
        setLocalization(params)
        String welcome = message(code: "bigbluebutton.welcome.header", args: ["\"{0}\"", "\"{1}\""]) + "<br>"
        log.debug "Localized default welcome message: [" + welcome + "]"

		// Check for [custom_]welcome parameter being passed from the LTI
		if (params.get(Parameter.CUSTOM_WELCOME) != null) {
			welcome = params.get(Parameter.CUSTOM_WELCOME) + "<br>"
			log.debug "Overriding default welcome message with: [" + welcome + "]"
		}

        if ( Boolean.parseBoolean(params.get(Parameter.CUSTOM_RECORD)) ) {
            welcome += "<br><b>" + message(code: "bigbluebutton.welcome.record") + "</b><br>"
            log.debug "Adding record warning to welcome message, welcome is now: [" + welcome + "]"
        }

        if ( Integer.parseInt(params.get(Parameter.CUSTOM_DURATION)) > 0 ) {
            welcome += "<br><b>" + message(code: "bigbluebutton.welcome.duration", args: [params.get(Parameter.CUSTOM_DURATION)]) + "</b><br>"
            log.debug "Adding duration warning to welcome message, welcome is now: [" + welcome + "]"
        }

        welcome += "<br>" + message(code: "bigbluebutton.welcome.footer") + "<br>"
        log.debug "Localized default welcome message including footer: [" + welcome + "]"

        String destinationURL = bigbluebuttonService.getJoinURL(params, welcome, ltiService.mode)
        log.debug "redirecting to " + destinationURL
                    
        if( destinationURL != null ) {
            redirect(url:destinationURL)
        } else {
            result.put("resultMessageKey", "BigBlueButtonServerError")
            result.put("resultMessage", "The join could not be completed")
        }
        
        return result
    }
        
    /**
     * Assemble all parameters passed that is required to sign the request.
     * @param the HTTP request parameters
     * @return the key:val pairs needed for Basic LTI
     */
    private Properties sanitizePrametersForBaseString(Object params) {
        
        Properties reqProp = new Properties();
        for (String key : ((Map<String, String>)params).keySet()) {
            if (key == "action" || key == "controller") {
                // Ignore as these are the grails controller and action tied to this request.
                continue
            } else if (key == "oauth_signature") {
                // We don't need this as part of the base string
                continue
            } else if (key == "request_method") {
                // As this is was added by the controller, we don't want it as part of the base string
                continue
            }

            reqProp.setProperty(key, ((Map<String, String>)params).get(key));
        }

        return reqProp
    }

    /**
     * Check if all required parameters have been passed in the request.
     * @param params - the HTTP request parameters
     * @param missingParams - a list of missing parameters
     * @return - true if all required parameters have been passed in
     */
    private boolean hasAllRequiredParams(Object params, Object missingParams) {
        boolean hasAllParams = true
        if (! ((Map<String, String>)params).containsKey(Parameter.CONSUMER_ID)) {
            ((ArrayList<String>)missingParams).add(Parameter.CONSUMER_ID);
            hasAllParams = false;
        }

        if (! ((Map<String, String>)params).containsKey(Parameter.OAUTH_SIGNATURE)) {
            ((ArrayList<String>)missingParams).add(Parameter.OAUTH_SIGNATURE);
            hasAllParams = false;
        }

        if (! ((Map<String, String>)params).containsKey(Parameter.RESOURCE_LINK_ID)) {
            ((ArrayList<String>)missingParams).add(Parameter.RESOURCE_LINK_ID);
            hasAllParams = false;
        }

        return hasAllParams
    }

    /**
     * Check if the passed signature is valid.
     * @param method - POST or GET method used to make the request
     * @param URL - The target URL for the Basic LTI tool
     * @param conSecret - The consumer secret key
     * @param postProp - the parameters passed in from the tool
     * @param signature - the passed in signature calculated from the client
     * @return - TRUE if the signatures matches the calculated signature
     */
    private boolean checkValidSignature(String method, String URL, String conSecret, Object postProp, String signature) {
		log.debug( "Starting checkValidSignature()" )
        OAuthMessage oam = new OAuthMessage(method, URL, ((Properties)postProp).entrySet())
		log.debug( "OAuthMessage oam = " + oam.toString() )
        HMAC_SHA1 hmac = new HMAC_SHA1()
		log.debug( "HMAC_SHA1 hmac = " + hmac.toString() )
        hmac.setConsumerSecret(conSecret)

        log.debug("Base Message String = [ " + hmac.getBaseString(oam) + " ]\n")
        String calculatedSignature = hmac.getSignature(hmac.getBaseString(oam))
        log.debug("Calculated: " + calculatedSignature + " Received: " + signature)
        return calculatedSignature.equals(signature)
    }
    
    private String getCartridgeXML(){
        def cartridge = '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"' +
        '       xmlns:blti = "http://www.imsglobal.org/xsd/imsbasiclti_v1p0"' +
        '       xmlns:lticm ="http://www.imsglobal.org/xsd/imslticm_v1p0"' +
        '       xmlns:lticp ="http://www.imsglobal.org/xsd/imslticp_v1p0"' +
        '       xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"' +
        '       xsi:schemaLocation = "http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd' +
        '                             http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0.xsd' +
        '                             http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd' +
        '                             http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">' +
        '    <blti:title>BigBlueButton</blti:title>' +
        '    <blti:description>Single Sign On into BigBlueButton</blti:description>' +
        '    <blti:launch_url>' + ltiService.retrieveBasicLtiEndpoint() + '</blti:launch_url>' +
        '    <blti:icon>' + ltiService.retrieveIconEndpoint() + '</blti:icon>' +
        '    <blti:vendor>' +
        '        <lticp:code>BBB</lticp:code>' +
        '        <lticp:name>BigBlueButton</lticp:name>' +
        '        <lticp:description>Open source web conferencing system for distance learning.</lticp:description>' +
        '        <lticp:url>http://www.bigbluebutton.org/</lticp:url>' +
        '    </blti:vendor>' +
        '    <cartridge_bundle identifierref="BLTI001_Bundle"/>' +
        '    <cartridge_icon identifierref="BLTI001_Icon"/>' +
        '</cartridge_basiclti_link>'
        
        return cartridge
        
    }


}
