package org.bigbluebutton.lti.controllers

import net.oauth.OAuthMessage
import net.oauth.signature.HMAC_SHA1
import net.oauth.signature.HMAC_SHA256
import org.bigbluebutton.lti.Parameter
import org.bigbluebutton.BigbluebuttonService
import org.bigbluebutton.LtiService
import java.text.DateFormat

/*
    BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

    Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).

    This program is free software; you can redistribute it and/or modify it under the
    terms of the GNU Lesser General Public License as published by the Free Software
    Foundation; either version 3.0 of the License, or (at your option) any later
    version.

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABIL ITY or FITNESS FOR A
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along
    with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*/

import java.text.SimpleDateFormat
import java.util.*

class ToolController {
    private static final String CONTROLLER_NAME = 'ToolController'
    private static final String RESP_CODE_SUCCESS = 'SUCCESS'
    private static final String RESP_CODE_FAILED = 'FAILED'
    private static final String REQUEST_METHOD = "request_method";

    LtiService ltiService
    BigbluebuttonService bigbluebuttonService

    def test = {
        log.debug CONTROLLER_NAME + "#test"
        render(text: "<xml></xml>", contentType: "text/xml", encoding: "UTF-8")
    }

    def index = {
        log.debug CONTROLLER_NAME + "#index"
        if (ltiService.consumerMap == null) {
            ltiService.initConsumerMap()
        }
        setLocalization(params)
        params.put(REQUEST_METHOD, request.getMethod().toUpperCase())
        ltiService.logParameters(params)
        // On get requests render the common cartridge.
        if (request.get) {
            render(text: getCartridgeXML(), contentType: "text/xml", encoding: "UTF-8")
            return
        }
        // On post request proceed with the launch.
        def schemeHeader = request.getHeader("X-Forwarded-Proto")
        def scheme = schemeHeader == null ? ltiService.getScheme(request) : schemeHeader
        def endPoint = scheme + "://" + ltiService.endPoint + "/" + grailsApplication.metadata['app.name'] + "/" + params.get("controller") + (params.get("format") != null ? "." + params.get("format") : "")
        log.info "endPoint: " + endPoint
        ArrayList<String> missingParams = new ArrayList<String>()

        if (!hasAllRequiredParams(params, missingParams)) {
            String missingStr = ""
            for (String str:missingParams) {
                missingStr += str + ", ";
            }
            return renderError("MissingRequiredParameter", "Missing parameters [$missingStr]")
        }

        def sanitizedParams = sanitizePrametersForBaseString(params)
        def consumer = ltiService.getConsumer(params.get(Parameter.CONSUMER_ID))
        if (ltiService.hasRestrictedAccess()) {
            if (consumer == null) {
                return renderError("ConsumerNotFound", "Consumer with id = " + params.get(Parameter.CONSUMER_ID) + " was not found.")
            }
            log.debug "Found consumer with key " + consumer.get("key") //+ " and sharedSecret " + consumer.get("secret")
        }
        def validSignature = checkValidSignature(params.get(REQUEST_METHOD), endPoint, consumer.get("secret"), sanitizedParams, params.get(Parameter.OAUTH_SIGNATURE))
        if (ltiService.hasRestrictedAccess()) {
            if (!validSignature) {
                log.debug  "The message has NOT a valid signature."
                return renderError("InvalidSignature", "Invalid signature (" + params.get(Parameter.OAUTH_SIGNATURE) + ").")
            }
            log.debug  "The message has a valid signature."
        } else {
            log.debug  "Access not restricted, valid signature is not required."
        }
        def mode = params.containsKey(Parameter.CUSTOM_MODE)? params.get(Parameter.CUSTOM_MODE): ltiService.mode
        if (!"extended".equals(mode)) {
            log.debug  "LTI service running in simple mode."
            def result = doJoinMeeting(params)
            return
        }
        log.debug  "LTI service running in extended mode."
        if (!Boolean.parseBoolean(params.get(Parameter.CUSTOM_RECORD)) && !ltiService.allRecordedByDefault()) {
            log.debug  "Parameter custom_record was not sent; immediately redirecting to BBB session!"
            def result = doJoinMeeting(params)
            return
        }
        session["params"] = params
        render(view: "index", model: ['params': params, 'recordingList': getSanitizedRecordings(params), 'ismoderator': bigbluebuttonService.isModerator(params)])
    }

    def join = {
        if( ltiService.consumerMap == null) ltiService.initConsumerMap()
        log.debug CONTROLLER_NAME + "#join"
        def result
        def sessionParams = session["params"]
        if( sessionParams != null ) {
            log.debug "params: " + params
            log.debug "sessionParams: " + sessionParams
            result = doJoinMeeting(sessionParams)
        } else {
            result = new HashMap<String, String>()
            result.put("messageKey", "InvalidSession")
            result.put("message", "Invalid session. User can not execute this action.")
        }
        if (result != null && result.containsKey("messageKey")) {
            log.debug "Error [messageKey:'" + result.get("messageKey") + "', message:'" + result.get("message") + "']"
            render(view: "error", model: ['messageKey': result.get("messageKey"), 'message': result.get("message")])
        }
    }

    def publish = {
        log.debug CONTROLLER_NAME + "#publish"
        Map<String, String> result
        def sessionParams = session["params"]
        if( sessionParams == null ) {
            result = new HashMap<String, String>()
            result.put("messageKey", "InvalidSession")
            result.put("message", "Invalid session. User can not execute this action.")
        } else if ( !bigbluebuttonService.isModerator(sessionParams) ) {
            result = new HashMap<String, String>()
            result.put("messageKey", "NotAllowed")
            result.put("message", "User not allowed to execute this action.")
        } else {
            // Execute the publish command
            result = bigbluebuttonService.doPublishRecordings(params)
        }
        if( result.containsKey("messageKey")) {
            log.debug "Error [messageKey:'" + result.get("messageKey") + "', message:'" + result.get("message") + "']"
            render(view: "error", model: ['messageKey': result.get("messageKey"), 'message': result.get("message")])
        } else {
            render(view: "index", model: ['params': sessionParams, 'recordingList': getSanitizedRecordings(sessionParams), 'ismoderator': bigbluebuttonService.isModerator(sessionParams)])
        }
    }

    def delete = {
        log.debug CONTROLLER_NAME + "#delete"
        Map<String, String> result
        def sessionParams = session["params"]
        if( sessionParams == null ) {
            result = new HashMap<String, String>()
            result.put("messageKey", "InvalidSession")
            result.put("message", "Invalid session. User can not execute this action.")
        } else if ( !bigbluebuttonService.isModerator(sessionParams) ) {
            result = new HashMap<String, String>()
            result.put("messageKey", "NotAllowed")
            result.put("message", "User not allowed to execute this action.")
        } else {
            // Execute the delete command.
            result = bigbluebuttonService.doDeleteRecordings(params)
        }
        if( result.containsKey("messageKey")) {
            log.debug "Error [messageKey:'" + result.get("messageKey") + "', message:'" + result.get("message") + "']"
            render(view: "error", model: ['messageKey': result.get("messageKey"), 'message': result.get("message")])
        } else {
            render(view: "index", model: ['params': sessionParams, 'recordingList': getSanitizedRecordings(sessionParams), 'ismoderator': bigbluebuttonService.isModerator(sessionParams)])
        }
    }

    private void setLocalization(Map<String, String> params){
        String locale = params.get(Parameter.LAUNCH_LOCALE)
        locale = (locale == null || locale.equals("")?"en":locale)
        String[] localeCodes = locale.split("[_-]")
        // Localize the default welcome message
        session['org.springframework.web.servlet.i18n.SessionLocaleResolver.LOCALE'] = new Locale(localeCodes[0])
        if (localeCodes.length > 1) {
            session['org.springframework.web.servlet.i18n.SessionLocaleResolver.LOCALE'] = new Locale(localeCodes[0], localeCodes[1])
        }
    }

    private Object doJoinMeeting(Map<String, String> params) {
        setLocalization(params)
        String welcome = message(code: "bigbluebutton.welcome.header", args: ["\"{0}\"", "\"{1}\""]) + "<br>"
        // Check for [custom_]welcome parameter being passed from the LTI
        if (params.containsKey(Parameter.CUSTOM_WELCOME) && params.get(Parameter.CUSTOM_WELCOME) != null) {
            welcome = params.get(Parameter.CUSTOM_WELCOME) + "<br>"
            log.debug "Overriding default welcome message with: [" + welcome + "]"
        }
        if (params.containsKey(Parameter.CUSTOM_RECORD) && Boolean.parseBoolean(params.get(Parameter.CUSTOM_RECORD)) || ltiService.allRecordedByDefault()) {
            welcome += "<br><b>" + message(code: "bigbluebutton.welcome.record") + "</b><br>"
            log.debug "Adding record warning to welcome message, welcome is now: [" + welcome + "]"
        }
        if (params.containsKey(Parameter.CUSTOM_DURATION) && Integer.parseInt(params.get(Parameter.CUSTOM_DURATION)) > 0) {
            welcome += "<br><b>" + message(code: "bigbluebutton.welcome.duration", args: [params.get(Parameter.CUSTOM_DURATION)]) + "</b><br>"
            log.debug "Adding duration warning to welcome message, welcome is now: [" + welcome + "]"
        }
        welcome += "<br>" + message(code: "bigbluebutton.welcome.footer") + "<br>"
        String destinationURL = bigbluebuttonService.getJoinURL(params, welcome, ltiService.mode)
        if (destinationURL == null) {
            Map<String, String> result = new HashMap<String, String>()
            result.put("messageKey", "BigBlueButtonServerError")
            result.put("message", "The join could not be completed")
            return result
        }
        log.debug "It is redirecting to " + destinationURL
        redirect(url:destinationURL)
    }

    /**
     * Assemble all parameters passed that is required to sign the request.
     * @param the HTTP request parameters
     * @return the key:val pairs needed for Basic LTI
     */
    private Properties sanitizePrametersForBaseString(Map<String, String> params) {
        Properties reqProp = new Properties();
        for (String key : params.keySet()) {
            if (key == "action" || key == "controller" || key == "format") {
                // Ignore as these are the grails controller and action tied to this request.
                continue
            }
            if (key == "oauth_signature") {
                // We don't need this as part of the base string.
                continue
            }
            if (key == "request_method") {
                // As this is was added by the controller, we don't want it as part of the base string.
                continue
            }
            reqProp.setProperty(key, params.get(key));
        }
        return reqProp
    }

    /**
     * Check if all required parameters have been passed in the request.
     * @param params - the HTTP request parameters
     * @param missingParams - a list of missing parameters
     * @return - true if all required parameters have been passed in
     */
    private boolean hasAllRequiredParams(Map<String, String> params, ArrayList<String> missingParams) {
        log.debug "Checking for required parameters"
        if (ltiService.hasRestrictedAccess() && !params.containsKey(Parameter.CONSUMER_ID)) {
            missingParams.add(Parameter.CONSUMER_ID);
            return false
        }
        if (ltiService.hasRestrictedAccess() && !params.containsKey(Parameter.OAUTH_SIGNATURE)) {
            missingParams.add(Parameter.OAUTH_SIGNATURE);
            return false
        }
        if (!params.containsKey(Parameter.RESOURCE_LINK_ID)) {
            missingParams.add(Parameter.RESOURCE_LINK_ID);
            return false
        }
        return true
    }

    /**
     * Check if the passed signature is valid.
     * Checks both SHA1 and SHA256 signatures.
     * @param method - POST or GET method used to make the request
     * @param URL - The target URL for the Basic LTI tool
     * @param conSecret - The consumer secret key
     * @param postProp - the parameters passed in from the tool
     * @param signature - the passed in signature calculated from the client
     * @return - TRUE if the SHA1 or the SHA256 signatures match the calculated signature
     */
    private boolean checkValidSignature(String method, String url, String conSecret, Properties postProp, String signature) {
        if (!ltiService.hasRestrictedAccess()) {
            return true;
        }
        try {
            OAuthMessage oam = new OAuthMessage(method, url, postProp.entrySet())

            HMAC_SHA1 hmac = new HMAC_SHA1()
			HMAC_SHA256 hmac256 = new HMAC_SHA256()

            hmac.setConsumerSecret(conSecret)
			hmac256.setConsumerSecret(conSecret) 
			
            log.debug "SHA1 Base Message String = [ " + hmac.getBaseString(oam) + " ]\n"
            String calculatedSignature = hmac.getSignature(hmac.getBaseString(oam))
            log.debug "Calculated: " + calculatedSignature + " Received: " + signature
			
	    log.debug "SHA256 Base Message String = [ " + hmac256.getBaseString(oam) + " ]\n"
	    String calculatedSignature256 = hmac256.getSignature(hmac256.getBaseString(oam))
	    log.debug "Calculated: " + calculatedSignature256 + " Received: " + signature
		
            return calculatedSignature.equals(signature) || calculatedSignature256.equals(signature)
        } catch( Exception e ) {
            log.debug "Exception error: " + e.message
            return false
        }
    }

    /**
     * Assemble all recordings to be rendered by the view.
     * @param the HTTP request parameters
     * @return the key:val pairs needed for Basic LTI
     */
    private List<Object> getSanitizedRecordings(Map<String, String> params) {
        def recordings = new ArrayList<Object>()
        def getRecordingsResponse = bigbluebuttonService.getRecordings(params)
        if (getRecordingsResponse == null) {
            return recordings
        }
        Object response = (Object)getRecordingsResponse.get("recording")
        if (response instanceof Map<?,?>) {
            recordings.add(response)
        }
        if (response instanceof Collection<?>) {
            recordings = response
        }
        // Sanitize recordings
        for (recording in recordings) {
            // Calculate duration.
            long endTime = Long.parseLong((String)recording.get("endTime"))
            endTime -= (endTime % 1000)
            long startTime = Long.parseLong((String)recording.get("startTime"))
            startTime -= (startTime % 1000)
            int duration = (endTime - startTime) / 60000
            // Add duration.
            recording.put("duration", duration )
            // Calculate reportDate.
            DateFormat df = new SimpleDateFormat(message(code: "tool.view.dateFormat"))
            String reportDate = df.format(new Date(startTime))
            // Add reportDate.
            recording.put("reportDate", reportDate)
            recording.put("unixDate", startTime / 1000)
            // Add sanitized thumbnails
            recording.put("thumbnails", sanitizeThumbnails(recording.playback.format))
            recording.put("playbacks", sanitizePlayback(recording.playback.format))
        }
        return recordings
    }

    private List<Object> sanitizePlayback(Object format) {
        def response = new ArrayList<Object>()
        if (format instanceof Map<?,?>) {
            response.add(format)
        } else if (format instanceof Collection<?>) {
            response = new ArrayList(format)
        } else {
            response = format
        }
        return response
    }

    private List<Object> sanitizeThumbnails(Object format) {
        if (format.preview == null || format.preview.images == null || format.preview.images.image == null) {
            return new ArrayList()
        }
        if (format.preview.images.image instanceof Map<?,?>) {
            return new ArrayList(format.preview.images.image)
        }
        return format.preview.images.image
    }

    private String getCartridgeXML(){
        def lti_endpoint = ltiService.retrieveBasicLtiEndpoint() + '/' + grailsApplication.metadata['app.name']
        def launch_url = 'http://' + lti_endpoint + '/tool'
        def secure_launch_url = 'https://' + lti_endpoint + '/tool'
        def icon = 'http://' + lti_endpoint + '/assets/icon.ico'
        def secure_icon = 'https://' + lti_endpoint + '/assets/icon.ico'
        def isSSLEnabled = ltiService.isSSLEnabled('https://' + lti_endpoint + '/tool/test')
        def extension_url = isSSLEnabled ? secure_launch_url : launch_url
        def extension_icon = isSSLEnabled ? secure_icon : icon
        def canvasPlacements = ''
        def canvasPlacementsList = ltiService.canvasPlacements
        if (canvasPlacementsList.length > 0) {
            canvasPlacements += '' +
                '    <blti:extensions platform="canvas.instructure.com">'
            canvasPlacementsList.each { placement ->
                canvasPlacements += '' +
                    '        <lticm:options name="' + placement + '">' +
                    '          <lticm:property name="canvas_icon_class">icon-lti</lticm:property>' +
                    '          <lticm:property name="icon_url">' + extension_icon + '</lticm:property>' +
                    '          <lticm:property name="text">' + ltiService.canvasPlacementName + '</lticm:property>' +
                    '          <lticm:property name="url">' + extension_url + '</lticm:property>' +
                    '        </lticm:options>'
            }
            canvasPlacements += '' +
                '    </blti:extensions>'
        }

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
                '    <blti:launch_url>' + launch_url + '</blti:launch_url>' +
                (isSSLEnabled? '    <blti:secure_launch_url>' + secure_launch_url + '</blti:secure_launch_url>': '') +
                '    <blti:icon>' + icon + '</blti:icon>' +
                (isSSLEnabled? '    <blti:secure_icon>' + secure_icon + '</blti:secure_icon>': '') +
                '    <blti:vendor>' +
                '        <lticp:code>bigbluebutton</lticp:code>' +
                '        <lticp:name>BigBlueButton</lticp:name>' +
                '        <lticp:description>Open source web conferencing system for distance learning.</lticp:description>' +
                '        <lticp:url>http://www.bigbluebutton.org/</lticp:url>' +
                '    </blti:vendor>' +
                canvasPlacements +
                '    <cartridge_bundle identifierref="BLTI001_Bundle"/>' +
                '    <cartridge_icon identifierref="BLTI001_Icon"/>' +
                '</cartridge_basiclti_link>'

        return cartridge
    }

    private void renderError(key, message) {
        log.debug "Error [resultMessageKey:'" + key + "', resultMessage:'" + message + "']"
        render(view: "error", model: ['resultMessageKey': key, 'resultMessage': message])
    }
}
