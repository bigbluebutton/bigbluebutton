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
        log.debug CONTROLLER_NAME + "#index" + ltiService.consumerMap
        log.debug "params: " + params
        
        params.put(REQUEST_METHOD, request.getMethod().toUpperCase())
        Map<String, String> result
        if( !"extended".equals(ltiService.mode) ) {
            log.debug  "LTI service running in simple mode."
            result = doJoinMeeting(params) 
        } else {
            log.debug  "LTI service running in extended mode."
        }    
        
        if( result != null ) {
            log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
            render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])
            
        } else {
            session["params"] = params
            def recordings = bigbluebuttonService.getRecordings(params)
            log.debug "Recordings " + recordings
            
            render(view: "index", model: ['params': params, 'recordings': recordings])
        }
    }
    
    def join = {
        log.debug CONTROLLER_NAME + "#join"
        def sessionParams = session["params"]
        log.debug "sessionParams: " + sessionParams
        
        Map<String, String> result = doJoinMeeting(sessionParams)

        log.debug "Error [resultMessageKey:'" + result.get("resultMessageKey") + "', resultMessage:'" + result.get("resultMessage") + "']"
        render(view: "error", model: ['resultMessageKey': result.get("resultMessageKey"), 'resultMessage': result.get("resultMessage")])

    }
    
    def test = {
        log.debug CONTROLLER_NAME + "#index"
        
        response.addHeader("Cache-Control", "no-cache")
        withFormat {
            xml {
                render(contentType:"text/xml") {
                    response() {
                        returncode(false)
                        messageKey('RequestInvalid')
                        message('The request is not supported.')
                    }
                }
            }
        }

    }
    
    private Object doJoinMeeting(params) {
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
                    String welcome = message(code: "bigbluebutton.welcome", args: ["\"{0}\"", "\"{1}\""])
                    log.debug "Localized default welcome message: [" + welcome + "]"
            
                    String destinationURL = bigbluebuttonService.getJoinURL(params, welcome, ltiService.mode)
                    log.debug "redirecting to " + destinationURL
                    
                    if( destinationURL != null ) {
                        redirect(url:destinationURL)
                    } else {
                        result.put("resultMessageKey", "BigBlueButtonServerError")
                        result.put("resultMessage", "The join could not be completed")
                    }
                    
                } else {
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
        OAuthMessage oam = new OAuthMessage(method, URL, ((Properties)postProp).entrySet());
        HMAC_SHA1 hmac = new HMAC_SHA1();
        hmac.setConsumerSecret(conSecret);

        log.debug("Base Message String = [ " + hmac.getBaseString(oam) + " ]\n");
        String calculatedSignature = hmac.getSignature(hmac.getBaseString(oam))
        log.debug("Calculated: " + calculatedSignature + " Received: " + signature);
        return calculatedSignature.equals(signature)
    }

}
