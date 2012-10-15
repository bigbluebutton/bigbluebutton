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
package org.bigbluebutton.web.controllers
import java.util.ArrayList
import java.util.HashMap
import java.util.List
import java.util.Map
import java.util.Properties

import org.apache.commons.codec.digest.DigestUtils

import net.oauth.OAuthMessage
import net.oauth.signature.OAuthSignatureMethod;
import net.oauth.signature.HMAC_SHA1;

import org.bigbluebutton.web.services.BigbluebuttonService
import org.bigbluebutton.web.services.LtiService

class ToolController {
    private static final String CONTROLLER_NAME = 'ToolController'
    private static final String RESP_CODE_SUCCESS = 'SUCCESS'
    private static final String RESP_CODE_FAILED = 'FAILED'
    
    public static final String OAUTH_SIGNATURE = 'oauth_signature'
    public static final String CUSTOMER_ID = 'oauth_consumer_key'
    public static final String USER_FULL_NAME = 'lis_person_name_full'
    public static final String USER_LASTNAME = 'lis_person_name_family'
    public static final String USER_EMAIL = 'lis_person_contact_email_primary'
    public static final String USER_ID = 'lis_person_sourcedid'
    public static final String USER_FIRSTNAME = 'lis_person_name_given'
    public static final String COURSE_ID = 'context_id'
    public static final String COURSE_TITLE = 'context_title'
    public static final String RESOURCE_LINK_ID = 'resource_link_id'
    public static final String RESOURCE_LINK_TITLE = 'resource_link_title'
    public static final String RESOURCE_LINK_DESCRIPTION = 'resource_link_description'
    public static final String ROLES = 'roles'
    
    public static final String LAUNCH_LOCALE = "launch_presentation_locale"
    public static final String LAUNCH_DOCUMENT_TARGET = "launch_presentation_document_target"
    public static final String LAUNCH_CSS_URL = "launch_presentation_css_url"
    public static final String LAUNCH_RETURN_URL = "launch_presentation_return_url"
    
    public static final String CUSTOM_USER_ID = 'custom_lis_person_sourcedid'
    
    LtiService ltiService
    BigbluebuttonService bigbluebuttonService
    
    def index = { 
        log.debug CONTROLLER_NAME + "#index"

        def resultMessageKey = "init"
        def resultMessage = "init"
        def success = false
        def consumer
        ArrayList<String> missingParams = new ArrayList<String>()
        log.debug "Checking for required parameters"
        if (hasAllRequiredParams(params, missingParams)) {
            def sanitizedParams = sanitizePrametersForBaseString(params)

            consumer = getConsumer(params)
            if (consumer != null) {
                log.debug "Found consumer with key " + consumer.get("key") + " with secret " + consumer.get("secret")
                if (checkValidSignature(request.getMethod().toUpperCase(), retrieveBasicLtiEndpoint(), consumer.get("secret"), sanitizedParams, params.get(OAUTH_SIGNATURE))) {
                    if (hasValidStudentId(params, consumer)) {
                        // We have a valid signature.
                        session['org.springframework.web.servlet.i18n.SessionLocaleResolver.LOCALE'] = new Locale(params.get(LAUNCH_LOCALE))
                        String welcome = message(code: "bigbluebutton.welcome", args: [params.get(RESOURCE_LINK_TITLE), params.get(COURSE_TITLE)])
                        log.debug welcome
                        String destinationURL = bigbluebuttonService.getJoinURL(params.get(RESOURCE_LINK_TITLE), 
                            params.get(RESOURCE_LINK_ID), 
                            DigestUtils.shaHex("ap" + params.get(RESOURCE_LINK_ID)), 
                            DigestUtils.shaHex("mp"+params.get(RESOURCE_LINK_ID)),
                            welcome,
                            params.get(LAUNCH_RETURN_URL), 
                            params.get(USER_FULL_NAME), params.get(ROLES))
                        
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
                    resultMessage = "Invalid signature (" + params.get(OAUTH_SIGNATURE) + ")."
                    log.debug resultMessage
                }
                
            } else {
                resultMessageKey = 'CustomerNotFound'
                resultMessage = "Customer with id = " + params.get(CUSTOMER_ID) + " was not found."
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
    public Properties sanitizePrametersForBaseString(Object params) {
        
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
    public boolean hasAllRequiredParams(Object params, Object missingParams) {
        boolean hasAllParams = true
        if (! ((Map<String, String>)params).containsKey(CUSTOMER_ID)) {
            ((ArrayList<String>)missingParams).add(CUSTOMER_ID);
            hasAllParams = false;
        }

        if (! ((Map<String, String>)params).containsKey(USER_ID) && ! ((Map<String, String>)params).containsKey(CUSTOM_USER_ID)) {
            if (! ((Map<String, String>)params).containsKey(USER_EMAIL)) {
                ((ArrayList<String>)missingParams).add(USER_EMAIL);
                if (! ((Map<String, String>)params).containsKey(USER_ID)) { 
                    ((ArrayList<String>)missingParams).add(USER_ID);
                } else {  
                    ((ArrayList<String>)missingParams).add(CUSTOM_USER_ID);
                }

                hasAllParams = false;
            }

        }

        if (! ((Map<String, String>)params).containsKey(COURSE_ID)) {
            ((ArrayList<String>)missingParams).add(COURSE_ID);
            hasAllParams = false;
        }

        if (! ((Map<String, String>)params).containsKey(OAUTH_SIGNATURE)) {
            ((ArrayList<String>)missingParams).add(OAUTH_SIGNATURE);
            hasAllParams = false;
        }

        return hasAllParams
    }

    private boolean hasValidStudentId(params, consumer) {
        if (((Map<String, String>)params).containsKey(USER_ID) || ((Map<String, String>)params).containsKey(CUSTOM_USER_ID)) {
            return true;
        }

        if (((Map<String, String>)params).containsKey(USER_EMAIL)) {
            ((Map<String, String>)params).put(USER_ID, ((Map<String, String>)consumer).get(USER_EMAIL))
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
    public boolean checkValidSignature(String method, String URL, String conSecret, Object postProp, String signature) {
        OAuthMessage oam = new OAuthMessage(method, URL, ((Properties)postProp).entrySet());
        HMAC_SHA1 hmac = new HMAC_SHA1();
        hmac.setConsumerSecret(conSecret);

        //log.debug("Base Message String = [ " + hmac.getBaseString(oam) + " ]\n");
        String calculatedSignature = hmac.getSignature(hmac.getBaseString(oam))
        //log.debug("Calculated: " + calculatedSignature + " Received: " + signature);
        return calculatedSignature.equals(signature)
    }

    private Map<String, String> getConsumer(params) {
        Map<String, String> consumer = new HashMap<String, String>()
        
        consumer.put("key", "demo");
        consumer.put("secret", "welcome")
        
        return consumer
    }

    def retrieveBasicLtiEndpoint() {
        String basicLtiEndPoint = "http://192.168.0.153/lti/tool.xml"
        log.debug "basicLtiEndPoint [" + basicLtiEndPoint + "]"
        return basicLtiEndPoint
    }

}
