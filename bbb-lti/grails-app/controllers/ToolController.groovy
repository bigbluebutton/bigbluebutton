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
    
    LtiService ltiService
    BigbluebuttonService bigbluebuttonService
    
    def index = { 
        if( ltiService.consumerMap == null) ltiService.initConsumerMap()
        log.debug CONTROLLER_NAME + "#index" + ltiService.consumerMap
        log.debug params
        
        def resultMessageKey = "init"
        def resultMessage = "init"
        def success = false
        def consumer
        ArrayList<String> missingParams = new ArrayList<String>()
        log.debug "Checking for required parameters"
        if (hasAllRequiredParams(params, missingParams)) {
            def sanitizedParams = sanitizePrametersForBaseString(params)

            consumer = ltiService.getConsumer(params.get(Parameter.CONSUMER_ID))
            if (consumer != null) {
                log.debug "Found consumer with key " + consumer.get("key") //+ " and sharedSecret " + consumer.get("secret")
                if (checkValidSignature(request.getMethod().toUpperCase(), retrieveLtiEndpoint(), consumer.get("secret"), sanitizedParams, params.get(Parameter.OAUTH_SIGNATURE))) {
                    if (hasValidStudentId(params, consumer)) {
                        log.debug  "The message has a valid signature."
                        
                        String locale = params.get(Parameter.LAUNCH_LOCALE)
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
                
                        //String destinationURL = "http://www.bigbluebutton.org/"
                        String destinationURL = bigbluebuttonService.getJoinURL(params, welcome)
                        
                        log.debug "redirecting to " + destinationURL
                        if( destinationURL != null ) {
                            success = true
                            redirect(url:destinationURL)
                        } else {
                            resultMessageKey = 'BigBlueButtonServerError'
                            resultMessage = "The join could not be completed"
                            log.debug resultMessage
                        }
                        
                    } else {
                        resultMessageKey = 'InvalidStudentId'
                        resultMessage = "Can not determine user because of missing student id or email."
                    }

                } else {
                    resultMessageKey = 'InvalidSignature'
                    resultMessage = "Invalid signature (" + params.get(Parameter.OAUTH_SIGNATURE) + ")."
                    log.debug resultMessage
                }
                
            } else {
                resultMessageKey = 'CustomerNotFound'
                resultMessage = "Customer with id = " + params.get(Parameter.CONSUMER_ID) + " was not found."
                log.debug resultMessage
            }

        } else {
            resultMessageKey = 'MissingRequiredParameter'
            String missingStr = ""
            for(String str:missingParams)
                missingStr += str + ", ";

            resultMessage = "Missing parameters [$missingStr]"
            log.debug resultMessage
        }

        if (!success) {
            log.debug "Error"
            response.addHeader("Cache-Control", "no-cache")
            withFormat {
                xml {
                    render(contentType:"text/xml") {
                        response() {
                            returncode(success)
                            messageKey(resultMessageKey)
                            message(resultMessage)
                        }
                    }
                }
            }

        } 
        

    }
    
    def retrieveLtiEndpoint() {
        String endPoint = ltiService.endPoint
        return endPoint
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

        if (! ((Map<String, String>)params).containsKey(Parameter.USER_ID) && ! ((Map<String, String>)params).containsKey(Parameter.CUSTOM_USER_ID)) {
            if (! ((Map<String, String>)params).containsKey(Parameter.USER_EMAIL)) {
                ((ArrayList<String>)missingParams).add(Parameter.USER_EMAIL);
                if (! ((Map<String, String>)params).containsKey(Parameter.USER_ID)) { 
                    ((ArrayList<String>)missingParams).add(Parameter.USER_ID);
                } else {  
                    ((ArrayList<String>)missingParams).add(Parameter.CUSTOM_USER_ID);
                }

                hasAllParams = false;
            }

        }

        if (! ((Map<String, String>)params).containsKey(Parameter.COURSE_ID)) {
            ((ArrayList<String>)missingParams).add(Parameter.COURSE_ID);
            hasAllParams = false;
        }

        if (! ((Map<String, String>)params).containsKey(Parameter.OAUTH_SIGNATURE)) {
            ((ArrayList<String>)missingParams).add(Parameter.OAUTH_SIGNATURE);
            hasAllParams = false;
        }

        return hasAllParams
    }

    private boolean hasValidStudentId(params, consumer) {
        if (((Map<String, String>)params).containsKey(Parameter.USER_ID) || ((Map<String, String>)params).containsKey(Parameter.CUSTOM_USER_ID)) {
            return true;
        }

        if (((Map<String, String>)params).containsKey(Parameter.USER_EMAIL)) {
            ((Map<String, String>)params).put(Parameter.USER_ID, ((Map<String, String>)consumer).get(Parameter.USER_EMAIL))
            return true
        }

        return false
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
