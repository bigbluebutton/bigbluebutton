package org.bigbluebutton.api.meeting.stuns.turn;

import org.apache.commons.codec.binary.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SignatureException;

public class TurnServer {

  private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
  private static final String COLON = ":";
  
  private final String secretKey;
  private final String url;
  private final int ttl;

  public TurnServer(String secretKey, String url, int ttl) {
    this.secretKey = secretKey;
    this.url = url;
    this.ttl = ttl;
  }

  public TurnEntry generatePasswordFor(String userId) {
    TurnEntry turn = null;
    
    try {
      long expiryTime = System.currentTimeMillis() / 1000 + ttl;
      String username = expiryTime + COLON + userId;
      String password = calculateRFC2104HMAC(username, secretKey);
      turn = new TurnEntry(username, password, ttl, url);
    } catch (SignatureException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    return turn;
  }




  /**
   * Computes RFC 2104-compliant HMAC signature.
   * * @param data
   * The data to be signed.
   * @param key
   * The signing key.
   * @return
   * The Base64-encoded RFC 2104-compliant HMAC signature.
   * @throws
   * SignatureException when signature generation fails
   */
  private String calculateRFC2104HMAC(String data, String key)
      throws SignatureException
      {
    String result;
    try {

      // get an hmac_sha1 key from the raw key bytes
      SecretKeySpec signingKey = new SecretKeySpec(key.getBytes(), HMAC_SHA1_ALGORITHM);

      // get an hmac_sha1 Mac instance and initialize with the signing key
      Mac mac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
      mac.init(signingKey);

      // compute the hmac on input data bytes
      byte[] rawHmac = mac.doFinal(data.getBytes());

      // base64-encode the hmac
      result = new String(Base64.encodeBase64(rawHmac));

    } catch (Exception e) {
      throw new SignatureException("Failed to generate HMAC : " + e.getMessage());
    }
    return result;
      }
}
