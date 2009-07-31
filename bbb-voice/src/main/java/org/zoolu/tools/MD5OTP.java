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


import java.io.*;
import java.util.Random;


/** OTP (One Time Pad) encryption algorithm based on MD5 hash function.
  * It uses a PRG (Pseudo-Random-Generator) function in OFB (Output Feadback) 
  * to genarate a byte-stream (the OTP) that is XORed with the plaintext. 
  *<br> The PRG is based on MD5.
  *
  * <p> The OTP is calculated starting from a key and an IV, as follows:
  *<br> h_0=hash(skey|iv)
  *<br> h_i=hash(skey|h_i-1)  
  *
  * <p> where:
  *<br> hash(.)==MD5(.)
  *<br> skey==key
  *
  * <p> while the ciphertext is calculated as follows:
  *<br> c_0=iv
  *<br> c_i=m_i XOR h_i   with i=1,2,..
  *
  * <p> Note that optionally it could modified initializing the skey as follows:
  *<br> skey==hash(key|iv)
  *<br> in order to not keep in memory the secret key for long time
  */
public class MD5OTP
{
   /** Block size in bytes */
   static int size;
   /** the OTP stream key */
   byte[] skey;
   /** pseudorandom-stream (OTP) block */
   byte[] h;
   /** index within a single block */
   int index;
   
   /** Creates a new MD5OTP */
   /*public MD5OTP(int bsize, byte[] key, byte[] iv)
   {  init(bsize,key,iv);
   }*/

   /** Creates a new MD5OTP */
   public MD5OTP(byte[] skey, byte[] iv)
   {  init(16,skey,iv);
   }

   /** Creates a new MD5OTP with IV=0 */
   public MD5OTP(byte[] skey)
   {  init(16,skey,null);
   }
   
   /** Inits the MD5OTP algorithm */
   private void init(int size, byte[] skey, byte[] iv)
   {  this.size=size;
      if (iv==null) { iv=new byte[size]; for (int i=0; i<size; i++) iv[i]=0; }
      this.skey=skey;
      //skey=hash(cat(key,iv));
      h=clone(iv);
      index=size-1;
   }

   /** Makes a clone of a byte array */
   private static byte[] clone(byte[] bb)
   {  byte[] cc=new byte[bb.length];
      for (int i=0; i<bb.length; i++) cc[i]=bb[i];
      return cc;
   }   
   
   /** Concatenates two byte arrays */
   private static byte[] cat(byte[] aa, byte[] bb)
   {  byte[] cc=new byte[aa.length+bb.length];
      for (int i=0; i<aa.length; i++) cc[i]=aa[i];
      for (int i=0; i<bb.length; i++) cc[i+aa.length]=bb[i];
      return cc;
   }   

   /** Returns a sub array */
   private static byte[] sub(byte[] bb, int begin, int end)
   {  byte[] cc=new byte[end-begin];
      for (int i=begin; i<end; i++) cc[i-begin]=bb[i];
      return cc;
   }   

   /** Return an hash of the byte array */
   private static byte[] hash(byte[] bb)
   {  return MD5.digest(bb);
   }

   /** Encrypts a block of bytes */
   public byte[] update(byte[] m)
   {  byte[] c=new byte[m.length];
      for (int i=0; i<m.length; i++)
      {  index++;
         if (index==size)
         {  // calculate new h_block
            h=hash(cat(skey,h));
            index=0;
         }
         c[i]=(byte)(m[i]^h[index]);
      }
      return c;
   }
   
   /** Encrypts a byte stream */
   public void update(InputStream in, OutputStream out)
   {  byte[] buff=new byte[2048];
      int len;
      try
      {  while ((len=in.read(buff))>0)
            out.write(update(sub(buff,0,len)));
      }
      catch (IOException e) { e.printStackTrace(); }
   }

   /** Encrypts an array of bytes. An IV is chosen and saved at top. */
   public static byte[] encrypt(byte[] m, byte[] key)
   {  // choose a random IV
      byte[] iv=MD5.digest(Long.toString((new Random()).nextLong()));
      // do encryption    
      byte[] c=(new MD5OTP(key,iv)).update(m);
      return cat(iv,c);
   }

 
   /** Decrypts an array of bytes with the IV at top. */
   public static byte[] decrypt(byte[] c, byte[] key)
   {  // read the IV
      byte[] iv=sub(c,0,16);
      byte[] buf=sub(c,16,c.length); 
      return (new MD5OTP(key,iv)).update(buf);
   } 


   /** Returns an hex representation of the byte array */
   private static String asHex(byte[] bb)
   {  StringBuffer buf=new StringBuffer(bb.length*2);
      for (int i=0; i<bb.length; i++)
      {  if (((int)bb[i] & 0xff) < 0x10) buf.append("0");
         //buf.append(Long.toString((int)bb[i] & 0xff, 16));
         buf.append(Integer.toHexString((int)bb[i] & 0xff));
      }
      return buf.toString();
   }

   public static void main(String[] args)
   {  
      if (args.length<2)
      {  System.out.println("Usage:\n\n   java MD5OTP <message> <pass_phrase> [<iv>]");
         System.exit(0);
      } 
   
      byte[] msg=args[0].getBytes();     
      byte[] key=args[1].getBytes();
      byte[] iv=null;
      if (args.length>2) iv=args[2].getBytes();
      
      System.out.println("m= "+asHex(msg)+" ("+new String(msg)+")");
      byte[] cip=(new MD5OTP(key,iv)).update(msg);
      System.out.println("c= "+asHex(cip));
      cip=(new MD5OTP(key,iv)).update(cip);
      System.out.println("m= "+asHex(cip)+" ("+new String(cip)+")");
   } 
   
}
