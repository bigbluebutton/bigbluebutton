/****************************************************************************
 * Copyright (c) 1998-2009 AOL LLC. 
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
 *
 ****************************************************************************
 * 
 * @author:     zhang
 * @version:    $Revision: 73016 $
 * @created:    Apr 24, 2009
 *
 * Description: A KeySpec for PKCS#1 encoded RSA private key
 * 
 ****************************************************************************/
package net.oauth.signature.pem;

import java.io.IOException;
import java.math.BigInteger;
import java.security.spec.RSAPrivateCrtKeySpec;

/**
 * PKCS#1 encoded private key is commonly used with OpenSSL. It provides CRT parameters
 * so the private key operation can be much faster than using exponent/modulus alone, 
 * which is the case for PKCS#8 encoded key.
 * 
 * <p/>Unfortunately, JCE doesn't have an API to decode the DER. This class takes DER
 * buffer and decoded into CRT key.
 * 
 * @author zhang
 */
public class PKCS1EncodedKeySpec {

    private RSAPrivateCrtKeySpec keySpec;

    /**
     * Create a PKCS#1 keyspec from DER encoded buffer
     * 
     * @param keyBytes DER encoded octet stream
     * @throws IOException
     */
    public PKCS1EncodedKeySpec(byte[] keyBytes) throws IOException {
        decode(keyBytes);
    }

    /**
     * Get the key spec that JCE understands.
     * 
     * @return CRT keyspec defined by JCE
     */
    public RSAPrivateCrtKeySpec getKeySpec() {
        return keySpec;
    }

    /**
     * Decode PKCS#1 encoded private key into RSAPrivateCrtKeySpec.
     * 
     * <p/>The ASN.1 syntax for the private key with CRT is
     * 
     * <pre>
     * -- 
     * -- Representation of RSA private key with information for the CRT algorithm.
     * --
     * RSAPrivateKey ::= SEQUENCE {
     *   version           Version, 
     *   modulus           INTEGER,  -- n
     *   publicExponent    INTEGER,  -- e
     *   privateExponent   INTEGER,  -- d
     *   prime1            INTEGER,  -- p
     *   prime2            INTEGER,  -- q
     *   exponent1         INTEGER,  -- d mod (p-1)
     *   exponent2         INTEGER,  -- d mod (q-1) 
     *   coefficient       INTEGER,  -- (inverse of q) mod p
     *   otherPrimeInfos   OtherPrimeInfos OPTIONAL 
     * }
     * </pre>
     * 
     * @param keyBytes PKCS#1 encoded key
     * @throws IOException
     */

    private void decode(byte[] keyBytes) throws IOException  {

        DerParser parser = new DerParser(keyBytes);

        Asn1Object sequence = parser.read();
        if (sequence.getType() != DerParser.SEQUENCE)
            throw new IOException("Invalid DER: not a sequence"); //$NON-NLS-1$

        // Parse inside the sequence
        parser = sequence.getParser();

        parser.read(); // Skip version
        BigInteger modulus = parser.read().getInteger();
        BigInteger publicExp = parser.read().getInteger();
        BigInteger privateExp = parser.read().getInteger();
        BigInteger prime1 = parser.read().getInteger();
        BigInteger prime2 = parser.read().getInteger();
        BigInteger exp1 = parser.read().getInteger();
        BigInteger exp2 = parser.read().getInteger();
        BigInteger crtCoef = parser.read().getInteger();

        keySpec = new RSAPrivateCrtKeySpec(
                modulus, publicExp, privateExp, prime1, prime2,
                exp1, exp2, crtCoef);
    }    
}
