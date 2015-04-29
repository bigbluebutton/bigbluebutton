/*
 * Copyright 2007 Google, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.oauth.signature;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.EncodedKeySpec;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import net.oauth.OAuth;
import net.oauth.OAuthAccessor;
import net.oauth.OAuthException;
import net.oauth.signature.pem.PEMReader;
import net.oauth.signature.pem.PKCS1EncodedKeySpec;

/**
 * Class to handle RSA-SHA1 signatures on OAuth requests. A consumer
 * that wishes to use public-key signatures on messages does not need
 * a shared secret with the service provider, but it needs a private
 * RSA signing key. You create it like this:
 *
 * OAuthConsumer c = new OAuthConsumer(callback_url, consumer_key,
 *                                     null, provider);
 * c.setProperty(RSA_SHA1.PRIVATE_KEY, consumer_privateRSAKey);
 *
 * consumer_privateRSAKey must be an RSA signing key and
 * of type java.security.PrivateKey, String, byte[] or InputStream. 
 * The key must either PKCS#1 or PKCS#8 encoded.
 * 
 * A service provider that wishes to verify signatures made by such a
 * consumer does not need a shared secret with the consumer, but it needs
 * to know the consumer's public key. You create the necessary
 * OAuthConsumer object (on the service provider's side) like this:
 *
 * OAuthConsumer c = new OAuthConsumer(callback_url, consumer_key,
 *                                     null, provider);
 * c.setProperty(RSA_SHA1.PUBLIC_KEY, consumer_publicRSAKey);
 *
 * consumer_publicRSAKey must be the consumer's public RSAkey and
 * of type java.security.PublicKey, String, or byte[]. In the latter two
 * cases, the key must be X509-encoded (byte[]) or X509-encoded and
 * then Base64-encoded (String).
 *
 * Alternatively, a service provider that wishes to verify signatures made
 * by such a consumer can use a X509 certificate containing the consumer's
 * public key. You create the necessary OAuthConsumer object (on the service
 * provider's side) like this:
 *
 * OAuthConsumer c = new OAuthConsumer(callback_url, consumer_key,
 *                                     null, provider);
 * c.setProperty(RSA_SHA1.X509_CERTIFICATE, consumer_cert);
 *
 * consumer_cert must be a X509 Certificate containing the consumer's public
 * key and be of type java.security.cert.X509Certificate, String,
 * or byte[]. In the latter two cases, the certificate must be DER-encoded
 * (byte[]) or PEM-encoded (String).
 *
 * @author Dirk Balfanz
 *
 */
public class RSA_SHA1 extends OAuthSignatureMethod {

    final static public String PRIVATE_KEY = "RSA-SHA1.PrivateKey";
    final static public String PUBLIC_KEY = "RSA-SHA1.PublicKey";
    final static public String X509_CERTIFICATE = "RSA-SHA1.X509Certificate";

    private PrivateKey privateKey = null;
    private PublicKey publicKey = null;
    
    @Override
    protected void initialize(String name, OAuthAccessor accessor)
    throws OAuthException {
        super.initialize(name, accessor);

        // Due to the support of PEM input stream, the keys must be cached. 
        // The stream may not be markable so it can't be read again.
        try {
            Object privateKeyObject = accessor.consumer.getProperty(PRIVATE_KEY);
            if (privateKeyObject != null) {
                privateKey = loadPrivateKey(privateKeyObject);
            }

            Object publicKeyObject = accessor.consumer.getProperty(PUBLIC_KEY);
            if (publicKeyObject != null) {
                publicKey = loadPublicKey(publicKeyObject, false);
            } else {  // public key was null. perhaps they gave us a X509 cert.
                Object certObject = accessor.consumer.getProperty(X509_CERTIFICATE);
                if (certObject != null) {
                    publicKey = loadPublicKey(certObject, true);
                }
            }
        } catch (GeneralSecurityException e) {
            throw new OAuthException(e);
        } catch (IOException e) {
            throw new OAuthException(e);
        }
    }

    private PublicKey getPublicKeyFromDerCert(byte[] certObject)
            throws GeneralSecurityException {
        CertificateFactory fac = CertificateFactory.getInstance("X509");
        ByteArrayInputStream in = new ByteArrayInputStream(certObject);
        X509Certificate cert = (X509Certificate)fac.generateCertificate(in);
        return cert.getPublicKey();
    }

    private PublicKey getPublicKeyFromDer(byte[] publicKeyObject)
            throws GeneralSecurityException {
        KeyFactory fac = KeyFactory.getInstance("RSA");
        EncodedKeySpec pubKeySpec = new X509EncodedKeySpec(publicKeyObject);
        return fac.generatePublic(pubKeySpec);
    }

    private PublicKey getPublicKeyFromPem(String pem) 
    throws GeneralSecurityException, IOException {

        InputStream stream = new ByteArrayInputStream(
                pem.getBytes("UTF-8"));

        PEMReader reader = new PEMReader(stream);
        byte[] bytes = reader.getDerBytes(); 	
        PublicKey pubKey;

        if (PEMReader.PUBLIC_X509_MARKER.equals(reader.getBeginMarker())) {
            KeySpec keySpec = new X509EncodedKeySpec(bytes);
            KeyFactory fac = KeyFactory.getInstance("RSA");
            pubKey = fac.generatePublic(keySpec);
        } else if (PEMReader.CERTIFICATE_X509_MARKER.equals(reader.getBeginMarker())) {
            pubKey = getPublicKeyFromDerCert(bytes);
        } else {
            throw new IOException("Invalid PEM fileL: Unknown marker for " + 
                    " public key or cert " + reader.getBeginMarker());
        }

        return pubKey;
    }

    private PrivateKey getPrivateKeyFromDer(byte[] privateKeyObject)
            throws GeneralSecurityException {
        KeyFactory fac = KeyFactory.getInstance("RSA");
        EncodedKeySpec privKeySpec = new PKCS8EncodedKeySpec(privateKeyObject);
        return fac.generatePrivate(privKeySpec);
    }

    private PrivateKey getPrivateKeyFromPem(String pem)
    throws GeneralSecurityException, IOException {

        InputStream stream = new ByteArrayInputStream(
                pem.getBytes("UTF-8"));

        PEMReader reader = new PEMReader(stream);
        byte[] bytes = reader.getDerBytes();
        KeySpec keySpec;

        if (PEMReader.PRIVATE_PKCS1_MARKER.equals(reader.getBeginMarker())) {
            keySpec = (new PKCS1EncodedKeySpec(bytes)).getKeySpec();
        } else if (PEMReader.PRIVATE_PKCS8_MARKER.equals(reader.getBeginMarker())) {
            keySpec = new PKCS8EncodedKeySpec(bytes);
        } else {
            throw new IOException("Invalid PEM file: Unknown marker " +
                    "for private key " + reader.getBeginMarker());
        }

        KeyFactory fac = KeyFactory.getInstance("RSA");
        return fac.generatePrivate(keySpec);
    }

    @Override
    protected String getSignature(String baseString) throws OAuthException {
        try {
            byte[] signature = sign(baseString.getBytes(OAuth.ENCODING));
            return base64Encode(signature);
        } catch (UnsupportedEncodingException e) {
            throw new OAuthException(e);
        } catch (GeneralSecurityException e) {
            throw new OAuthException(e);
        }
    }

    @Override
    protected boolean isValid(String signature, String baseString)
            throws OAuthException {
        try {
            return verify(decodeBase64(signature),
                          baseString.getBytes(OAuth.ENCODING));
        } catch (UnsupportedEncodingException e) {
            throw new OAuthException(e);
        } catch (GeneralSecurityException e) {
            throw new OAuthException(e);
        }
    }

    private byte[] sign(byte[] message) throws GeneralSecurityException {
        if (privateKey == null) {
            throw new IllegalStateException("need to set private key with " +
                                            "OAuthConsumer.setProperty when " +
                                            "generating RSA-SHA1 signatures.");
        }
        Signature signer = Signature.getInstance("SHA1withRSA");
        signer.initSign(privateKey);
        signer.update(message);
        return signer.sign();
    }

    private boolean verify(byte[] signature, byte[] message)
            throws GeneralSecurityException {
        if (publicKey == null) {
            throw new IllegalStateException("need to set public key with " +
                                            " OAuthConsumer.setProperty when " +
                                            "verifying RSA-SHA1 signatures.");
        }
        Signature verifier = Signature.getInstance("SHA1withRSA");
        verifier.initVerify(publicKey);
        verifier.update(message);
        return verifier.verify(signature);
    }
    
    /**
     * Load private key from various sources, including
     * <ul>
     * <li>A PrivateKey object
     * <li>A string buffer for PEM
     * <li>A byte array with PKCS#8 encoded key
     * </ul>
     * @param privateKeyObject
     * @return The private key
     * @throws IOException
     * @throws GeneralSecurityException
     */
    private PrivateKey loadPrivateKey(Object privateKeyObject) 
    throws IOException, GeneralSecurityException {

        PrivateKey privateKey;

        if (privateKeyObject instanceof PrivateKey) {
            privateKey = (PrivateKey)privateKeyObject;
        } else if (privateKeyObject instanceof String) {
            try {
                // PEM Reader's native string constructor is for filename.
                privateKey = getPrivateKeyFromPem((String)privateKeyObject);
            } catch (IOException e) {
                // Check if it's PEM with markers stripped
                privateKey = getPrivateKeyFromDer(
                        decodeBase64((String)privateKeyObject));
            }
        } else if (privateKeyObject instanceof byte[]) {
            privateKey = getPrivateKeyFromDer((byte[])privateKeyObject);
        } else {
            throw new IllegalArgumentException(
                    "Private key set through RSA_SHA1.PRIVATE_KEY must be of " +
                    "type PrivateKey, String or byte[] and not " +
                    privateKeyObject.getClass().getName());
        }

        return privateKey;
    }

    /**
     * Load a public key from key file or certificate. It can load from
     * different sources depending on the type of the input,
     * <ul>
     * <li>A PublicKey object
     * <li>A X509Certificate object
     * <li>A string buffer for PEM
     * <li>A byte array with X509 encoded key or certificate
     * </ul>
     * 
     * @param publicKeyObject The object for public key or certificate
     * @param isCert True if this object is provided as Certificate
     * @return The public key
     * @throws IOException
     * @throws GeneralSecurityException
     */
    private PublicKey loadPublicKey(Object publicKeyObject, boolean isCert) 
    throws IOException, GeneralSecurityException {

        PublicKey publicKey;

        if (publicKeyObject instanceof PublicKey) {
            publicKey = (PublicKey)publicKeyObject;
        } else if (publicKeyObject instanceof X509Certificate) {
            publicKey = ((X509Certificate) publicKeyObject).getPublicKey();
        } else if (publicKeyObject instanceof String) {
            try {
                publicKey = getPublicKeyFromPem((String)publicKeyObject);
            } catch (IOException e) {
                // Check if it's marker-stripped PEM for public key
                if (isCert) 
                    throw e;
                publicKey = getPublicKeyFromDer(
                        decodeBase64((String)publicKeyObject));
            }
        } else if (publicKeyObject instanceof byte[]) { 
            if (isCert)
                publicKey = getPublicKeyFromDerCert((byte[])publicKeyObject);
            else
                publicKey = getPublicKeyFromDer((byte[])publicKeyObject);
        } else {
            String source;
            if (isCert)
                source = "RSA_SHA1.X509_CERTIFICATE";
            else
                source = "RSA_SHA1.PUBLIC_KEY";
            throw new IllegalArgumentException(
                    "Public key or certificate set through " + source + " must be of " +
                    "type PublicKey, String or byte[], and not " +
                    publicKeyObject.getClass().getName());
        }

        return publicKey;
    }
}
