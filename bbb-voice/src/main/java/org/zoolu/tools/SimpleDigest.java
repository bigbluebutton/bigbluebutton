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



/** Simple and fast hash/message-digest algorithm.
  */
public class SimpleDigest extends MessageDigest
{

   // ************************* Attributes *************************

   /** The digest */
   byte[] message_digest;

   /** Whether is finalized. */
   boolean is_done;

   /** Index within the message_digest. */
   int index;

   /** Add term */
   byte add_term;

   
   // *********************** Public methods ***********************

   /** Constructor */
   public SimpleDigest(int size)
   {  init(size);
   }


   /** Constructor */
   public SimpleDigest(int size, byte[] buffer)
   {  init(size);
      update(buffer);
   }


   /** Constructor */
   public SimpleDigest(int size, byte[] buffer, int offset, int len)
   {  init(size);
      update(buffer,offset,len);
   }


   /** Constructor */
   public SimpleDigest(int size, String str)
   {  init(size);
      update(str);
   }


   /** Inits the SimpleDigest */
   private void init(int size)
   {  is_done=false;
      message_digest=new byte[size];
      for (int i=0; i<size; i++) message_digest[i]=(byte)(i);
      index=0;
      add_term=0;
   }


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   public MessageDigest update(byte[] buffer, int offset, int len)
   {
      if (is_done) return this;
      //else
       
      for (int i=0; i<len; i++)
      {  if (index==message_digest.length) index=0;
         add_term+=buffer[offset+i];
         message_digest[index]=(byte)(message_digest[index]^add_term);
         index++;
      }
      return this;
   }


   /** MessageDigest finalization. Ends a message-digest operation, writing the
     * the message digest and zeroizing the context. */
   public byte[] doFinal()
   {
      if (is_done) return message_digest;
      //else

      int k=message_digest.length-index;
      while (index<message_digest.length)
      {  message_digest[index]=(byte)(message_digest[index]^(k));
         index++;
         k++;
      }     
      for (int i=0; i<message_digest.length; i++) message_digest[i]=(byte)(message_digest[i]^add_term);    

      return message_digest;
   }

   
   /** Calculates the SimpleDigest. */
   public static byte[] digest(int size, byte[] buffer, int offset, int len)
   {  MessageDigest md=new SimpleDigest(size,buffer,offset,len);
      return md.doFinal();
   }


   /** Calculates the SimpleDigest. */
   public static byte[] digest(int size, byte[] buffer)
   {  return digest(size,buffer,0,buffer.length);
   }


   /** Calculates the SimpleDigest. */
   public static byte[] digest(int size, String str)
   {  MessageDigest md=new SimpleDigest(size,str);
      return md.doFinal();
   }
   
}
