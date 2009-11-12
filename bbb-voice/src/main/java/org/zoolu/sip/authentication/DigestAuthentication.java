package org.zoolu.sip.authentication;


import org.zoolu.sip.header.AuthenticationHeader;
import org.zoolu.sip.header.AuthorizationHeader;
import org.zoolu.sip.header.ProxyAuthorizationHeader;
import org.zoolu.sip.header.WwwAuthenticateHeader;
import org.zoolu.tools.MD5;


/** The HTTP Digest Authentication as defined in RFC2617.
  * It can be used to i) calculate an authentication response
  * from an authentication request, or ii) validate an authentication response.
  * <br/> in the former case the DigestAuthentication is created based on
  * a WwwAuthenticationHeader (or ProxyAuthenticationHeader),
  * while in the latter case it is created based on an AuthorizationHeader
  * (or ProxyAuthorizationHeader).
  */
public class DigestAuthentication
{
   protected String method;
   protected String username;
   protected String passwd;

   protected String realm;   
   protected String nonce; // e.g. base 64 encoding of time-stamp H(time-stamp ":" ETag ":" private-key)
   //protected String[] domain;
   protected String opaque;
   //protected boolean stale; // "true" | "false"
   protected String algorithm; // "MD5" | "MD5-sess" | token

   protected String qop; // "auth" | "auth-int" | token
   
   protected String uri;  
   protected String cnonce;
   protected String nc;
   protected String response;

   protected String body;


   /** Costructs a new DigestAuthentication. */
   protected DigestAuthentication()
   {
   }

   /** Costructs a new DigestAuthentication. */
   public DigestAuthentication(String method, AuthorizationHeader ah, String body, String passwd)
   {  init(method,ah,body,passwd);
   }

   /** Costructs a new DigestAuthentication. */
   public DigestAuthentication(String method, String uri, WwwAuthenticateHeader ah, String qop, String body, String username, String passwd)
   {  init(method,ah,body,passwd);
      this.uri=uri;
      this.qop=qop;
      this.username=username;
   }

   /** Costructs a new DigestAuthentication. */
   private void init(String method, AuthenticationHeader ah, String body, String passwd)
   {  this.method=method;
      this.username=ah.getUsernameParam();
      this.passwd=passwd;    
      this.realm=ah.getRealmParam();
      this.opaque=ah.getOpaqueParam();
      this.nonce=ah.getNonceParam();
      this.algorithm=ah.getAlgorithParam();
      this.qop=ah.getQopParam();
      this.uri=ah.getUriParam();
      this.cnonce=ah.getCnonceParam();
      this.nc=ah.getNcParam();
      this.response=ah.getResponseParam();
      this.body=body;
   }


   /** Gets a String representation of the object. */
   public String toString()
   {  StringBuffer sb=new StringBuffer();
      sb.append("method=").append(method).append("\n");
      sb.append("username=").append(username).append("\n");
      sb.append("passwd=").append(passwd).append("\n");
      sb.append("realm=").append(realm).append("\n");
      sb.append("nonce=").append(nonce).append("\n");
      sb.append("opaque=").append(opaque).append("\n");
      sb.append("algorithm=").append(algorithm).append("\n");
      sb.append("qop=").append(qop).append("\n");
      sb.append("uri=").append(uri).append("\n");
      sb.append("cnonce=").append(cnonce).append("\n");
      sb.append("nc=").append(nc).append("\n");
      sb.append("response=").append(response).append("\n");
      sb.append("body=").append(body).append("\n");
      return sb.toString();
   }


   /** Whether the digest-response in the 'response' parameter in correct. */
   public boolean checkResponse()
   {  if (response==null) return false;
      else return response.equals(getResponse());
   }


   /** Gets a new AuthorizationHeader based on current authentication attributes. */
   public AuthorizationHeader getAuthorizationHeader()
   {  AuthorizationHeader ah=new AuthorizationHeader("Digest");
      ah.addUsernameParam(username);
      ah.addRealmParam(realm);
      ah.addNonceParam(nonce);
      ah.addUriParam(uri);
      if (algorithm!=null) ah.addAlgorithParam(algorithm);
      if (opaque!=null) ah.addOpaqueParam(opaque);
      /*
      if (qop!=null) ah.addQopParam(qop);
      if (nc!=null) ah.addNcParam(nc);
      */

      if (qop!=null)
	        {
	      	  ah.addQopParam(qop);
	      	  if (qop.equalsIgnoreCase("auth-int") || qop.equalsIgnoreCase("auth"))
	      	  {
	      		  // qop requires cnonce and nc as per rfc2617
	  	    	  cnonce=HEX(MD5(Long.toString(System.currentTimeMillis()))); // unique hopefully
	  	    	  ah.addCnonceParam(cnonce);
	  	    	  nc="00000001"; // always 1 since cnonce should be unique - avoids having to have a static counter
	  	    	  ah.addNcParam(nc);
	      	  }
      }


      String response=getResponse();
      ah.addResponseParam(response);
      return ah;
   }


   /** Gets a new ProxyAuthorizationHeader based on current authentication attributes. */
   public ProxyAuthorizationHeader getProxyAuthorizationHeader()
   {  return new ProxyAuthorizationHeader(getAuthorizationHeader().getValue());
   }


   /** Calculates the digest-response.
     * <p> If the "qop" value is "auth" or "auth-int":
     * <br>   KD ( H(A1), unq(nonce) ":" nc ":" unq(cnonce) ":" unq(qop) ":" H(A2) )
     *
     * <p> If the "qop" directive is not present:
     * <br>   KD ( H(A1), unq(nonce) ":" H(A2) )
     */
   public String getResponse()
   {  String secret=HEX(MD5(A1()));
      StringBuffer sb=new StringBuffer();
      if (nonce!=null) sb.append(nonce);
      sb.append(":");
      if (qop!=null)
      {  if (nc!=null) sb.append(nc);
         sb.append(":");
         if (cnonce!=null) sb.append(cnonce);
         sb.append(":");
         sb.append(qop);
         sb.append(":");
      }
      sb.append(HEX(MD5(A2())));
      String data=sb.toString();
      return HEX(KD(secret,data));
   }


   /** Calculates KD() value.
     * <p> KD(secret, data) = H(concat(secret, ":", data))
     */
   private byte[] KD(String secret, String data)
   {  StringBuffer sb=new StringBuffer();
      sb.append(secret).append(":").append(data);
      return MD5(sb.toString());
   }


   /** Calculates A1 value.
     * <p> If the "algorithm" directive's value is "MD5" or is unspecified:
     * <br>   A1 = unq(username) ":" unq(realm) ":" passwd
     *
     * <p> If the "algorithm" directive's value is "MD5-sess":
     * <br>   A1 = H( unq(username) ":" unq(realm) ":" passwd ) ":" unq(nonce) ":" unq(cnonce)
     */
   private byte[] A1()
   {  StringBuffer sb=new StringBuffer();
      if (username!=null) sb.append(username);
      sb.append(":");
      if (realm!=null) sb.append(realm);
      sb.append(":");
      if (passwd!=null) sb.append(passwd);

      if (algorithm==null || !algorithm.equalsIgnoreCase("MD5-sess"))
      {  return sb.toString().getBytes();
      }
      else
      {  StringBuffer sb2=new StringBuffer();
         sb2.append(":");
         if (nonce!=null) sb2.append(nonce);
         sb2.append(":");
         if (cnonce!=null) sb2.append(cnonce);
         return cat(MD5(sb.toString()),sb2.toString().getBytes());
      }
   }


   /** Calculates A2 value.
     * <p> If the "qop" directive's value is "auth" or is unspecified:
     * <br>   A2 = Method ":" digest-uri
     *
     * <p> If the "qop" value is "auth-int":
     * <br>   A2 = Method ":" digest-uri ":" H(entity-body)
     */
   private String A2()
   {  StringBuffer sb=new StringBuffer();
      sb.append(method);
      sb.append(":");
      if (uri!=null) sb.append(uri);

      if (qop!=null && qop.equalsIgnoreCase("auth-int"))
      {  sb.append(":");
         if (body==null) sb.append(HEX(MD5("")));
         else sb.append(HEX(MD5(body)));
      }
      return sb.toString();
   }


   /** Concatenates two arrays of bytes. */
   private static byte[] cat(byte[] a, byte[] b)
   {  int len=a.length+b.length;
      byte[ ] c=new byte[len];
      for (int i=0; i<a.length; i++) c[i]=a[i];
      for (int i=0; i<b.length; i++) c[i+a.length]=b[i];
      return c;
   }


   /** Calculates the MD5 of a String. */
   private static byte[] MD5(String str)
   {  return MD5.digest(str);
   }

   /** Calculates the MD5 of an array of bytes. */
   private static byte[] MD5(byte[] bb)
   {  return MD5.digest(bb);
   }

   /** Calculates the HEX of an array of bytes. */
   private static String HEX(byte[] bb)
   {  return MD5.asHex(bb);
   }



   /** Main method.
     * It tests DigestAuthentication with the example provided in the RFC2617. */
   public static void main(String[] args)
   {
/*         Authorization: Digest username="Mufasa",
                 realm="testrealm@host.com",
                 nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
                 uri="/dir/index.html",
                 qop=auth,
                 nc=00000001,
                 cnonce="0a4f113b",
                 response="6629fae49393a05397450978507c4ef1",
                 opaque="5ccc069c403ebaf9f0171e9517f40e41"
*/
      DigestAuthentication a=new DigestAuthentication();
      a.method="GET";
      a.passwd="Circle Of Life";
      a.realm="testrealm@host.com";
      a.nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093";
      a.uri="/dir/index.html";
      a.qop="auth";
      a.nc="00000001";
      a.cnonce="0a4f113b";
      a.username="Mufasa";

      String response1=a.getResponse();
      String response2="6629fae49393a05397450978507c4ef1";
      System.out.println(response1);
      System.out.println(response2);

      System.out.println(" ");


      String ah_str="Digest username=\"Mufasa\", realm=\"testrealm@host.com\", nonce=\"dcd98b7102dd2f0e8b11d0f600bfb0c093\", uri=\"/dir/index.html\", qop=auth, nc=00000001, cnonce=\"0a4f113b\", response=\"6629fae49393a05397450978507c4ef1\", opaque=\"5ccc069c403ebaf9f0171e9517f40e41\"\n";

      AuthorizationHeader ah=new AuthorizationHeader(ah_str);
      a=new DigestAuthentication("GET",ah,null,"Circle Of Life");
      response1=a.getResponse();
      response2="6629fae49393a05397450978507c4ef1";
      System.out.println(response1);
      System.out.println(response2);

      System.out.println(a.checkResponse());

   }
}
