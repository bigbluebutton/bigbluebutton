package org.bigbluebutton.web.services
import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac
import org.apache.commons.codec.binary.Base64

class LtiService {

    boolean transactional = true

    public String sign(String sharedSecret, String data) throws Exception
    {
        Mac mac = setKey(sharedSecret)
        
        // Signed String must be BASE64 encoded.
        byte[] signBytes = mac.doFinal(data.getBytes("UTF8"));
        String signature = encodeBase64(signBytes);
        return signature;
    }
    
    private Mac setKey(String sharedSecret) throws Exception
    {
        Mac mac = Mac.getInstance("HmacSHA1");
        byte[] keyBytes = sharedSecret.getBytes("UTF8");
        SecretKeySpec signingKey = new SecretKeySpec(keyBytes, "HmacSHA1");
        mac.init(signingKey);
        return mac
    }

    private String encodeBase64(byte[] signBytes) {
        return Base64.encodeBase64URLSafeString(signBytes)
    }
}
