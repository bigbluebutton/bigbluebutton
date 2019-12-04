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

import java.util.Map;

import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac

import org.apache.commons.codec.binary.Base64

class LtiService {

    boolean transactional = false

    def endPoint = "localhost"
    def consumers = "demo:welcome"
    def mode = "simple"
    def restrictedAccess = "true"
    def recordedByDefault = "false"
    def canvasPlacements = ""
    def canvasPlacementName = "BigBlueButton"

    Map<String, String> consumerMap

    def retrieveIconEndpoint() {
        return endPoint.replaceFirst("tool", "images/icon.ico")
    }

    def retrieveBasicLtiEndpoint() {
        return endPoint
    }

    private Map<String, String> getConsumer(consumerId) {
        Map<String, String> consumer = null
        if (this.consumerMap.containsKey(consumerId)) {
            consumer = new HashMap<String, String>()
            consumer.put("key", consumerId);
            consumer.put("secret",  this.consumerMap.get(consumerId))
        }
        return consumer
    }

    private void initConsumerMap() {
        this.consumerMap = new HashMap<String, String>()
        String[] consumers = this.consumers.split(",")
        if ( consumers.length > 0 ) {
            int i = 0;
            String[] consumer = consumers[i].split(":")
            if( consumer.length == 2 ){
                this.consumerMap.put(consumer[0], consumer[1])
            }
        }
    }

    public String sign(String sharedSecret, String data)
        throws Exception {
        Mac mac = setKey(sharedSecret)
        // Signed String must be BASE64 encoded.
        byte[] signBytes = mac.doFinal(data.getBytes("UTF8"));
        String signature = encodeBase64(signBytes);
        return signature;
    }

    private Mac setKey(String sharedSecret)
        throws Exception {
        Mac mac = Mac.getInstance("HmacSHA1");
        byte[] keyBytes = sharedSecret.getBytes("UTF8");
        SecretKeySpec signingKey = new SecretKeySpec(keyBytes, "HmacSHA1");
        mac.init(signingKey);
        return mac
    }

    private String encodeBase64(byte[] signBytes) {
        return Base64.encodeBase64URLSafeString(signBytes)
    }

    def logParameters(Object params, boolean debug = false) {
        def divider = "----------------------------------"
        Map<String, String> ordered_params = new LinkedHashMap<String, String>(params)
        ordered_params = ordered_params.sort {it.key}
        if( debug ) log.debug divider else log.info divider
        for( param in ordered_params ) {
            if( debug ) {
                log.debug "${param.getKey()}=${param.getValue()}"
            } else {
                log.info "${param.getKey()}=${param.getValue()}"
            }
        }
        if( debug ) log.debug divider else log.info divider
    }

    def boolean isSSLEnabled(String query) {
        def ssl_enabled = false
        log.debug("Pinging SSL connection")
        try {
            // open connection
            StringBuilder urlStr = new StringBuilder(query)
            URL url = new URL(urlStr.toString())
            HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection()
            httpConnection.setUseCaches(false)
            httpConnection.setDoOutput(true)
            httpConnection.setRequestMethod("HEAD")
            httpConnection.setConnectTimeout(5000)
            httpConnection.connect()
            int responseCode = httpConnection.getResponseCode()
            if (responseCode == HttpURLConnection.HTTP_OK) {
                ssl_enabled = true
            } else {
                log.debug("HTTPERROR: Message=" + "BBB server responded with HTTP status code " + responseCode)
            }
        } catch(IOException e) {
            log.debug("IOException: Message=" + e.getMessage())
        } catch(IllegalArgumentException e) {
            log.debug("IllegalArgumentException: Message=" + e.getMessage())
        } catch(Exception e) {
            log.debug("Exception: Message=" + e.getMessage())
        }

        return ssl_enabled
    }

    def boolean hasRestrictedAccess() {
        return Boolean.parseBoolean(this.restrictedAccess);
    }

    def boolean allRecordedByDefault() {
        return Boolean.parseBoolean(this.recordedByDefault);
    }

    def String getScheme(request) {
        return request.isSecure() ? "https" : "http"
    }

    def String[] getCanvasPlacements() {
        return this.canvasPlacements
    }
}

