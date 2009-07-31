/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This file is part of MjSip (http://www.mjsip.org)
 * 
 * MjSip is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * MjSip is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MjSip; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package org.zoolu.tools;



/** Generic hash/message-digest algorithm.
  */
public abstract class MessageDigest
{  
   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   abstract public MessageDigest update(byte[] buffer, int offset, int len);


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   public MessageDigest update(String str)
   {  byte[] buf=str.getBytes();
      return update(buf,0,buf.length);
   }


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   public MessageDigest update(byte[] buffer)
   {  return update(buffer,0,buffer.length);
   }


   /** MessageDigest finalization. Ends a message-digest operation, writing the
     * the message digest and zeroizing the context. */
   abstract public byte[] doFinal();


   /** Gets the MessageDigest. The same as doFinal(). */
   public byte[] getDigest()
   {  return doFinal();
   }


   /** Gets the Message Digest as string of hex values. */
   public String asHex()
   {   return asHex(doFinal());
   }


   /** Transforms an array of bytes into a string of hex values. */
   public static String asHex(byte[] buf)
   {  String str=new String();
      for (int i=0; i<buf.length; i++)
      {  str+=Integer.toHexString((buf[i]>>>4)&0x0F);
         str+=Integer.toHexString(buf[i]&0x0F);
      }
      return str;
   }

}
