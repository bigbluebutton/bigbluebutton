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
import java.util.Vector;
import java.util.Random;


/** Mangle collects some static methods for mangling binary-data structures 
  */
public class Mangle
{

   /** Compares two arrays of bytes */
   public static boolean compare(byte[] a, byte[] b)
   {  if (a.length!=b.length) return false;
      for (int i=0; i<a.length; i++)
         if (a[i]!=b[i]) return false;
      return true;
   }
   
   /** Initalizes a byte array with value <i>value</i> */
   public static byte[] initBytes(byte[] b, int value)
   {  for (int i=0; i<b.length; i++) b[i]=(byte)value;
      return b;
   }

   /** Gets the unsigned representatin of a byte (into a short) */
   public static short uByte(byte b)
   {  return (short)(((short)b+256)%256);
   } 

   /** Gets the unsigned representatin of a 32-bit word (into a long) */
   public static long uWord(int n)
   {  long wmask=0x10000;
      wmask*=wmask;
      return (long)(((long)n+wmask)%wmask);
   } 

   /** Rotates w left n bits. */
   private static int rotateLeft(int w, int n)
   {  return (w << n) | (w >>> (32-n));
   }

   /** Rotates w right n bits. */
   private static int rotateRight(int w, int n)
   {  return (w >>> n) | (w << (32-n));
   }

   /** Rotates an array of int (words), shifting 1 word left. */
   private static int[] rotateLeft(int[] w)
   {  int len=w.length;
      int w1=w[len-1];
      for (int i=len-1; i>1; i--) w[i]=w[i-1];
      w[0]=w1;
      return w;
   }

   /** Rotates an array of int (words), shifting 1 word right. */
   private static int[] rotateRight(int[] w)
   {  int len=w.length;
      int w0=w[0];
      for (int i=1; i<len; i++) w[i-1]=w[i];
      w[len-1]=w0;
      return w;
   }

   /** Rotates an array of bytes, shifting 1 byte left. */
   private static byte[] rotateLeft(byte[] b)
   {  int len=b.length;
      byte b1=b[len-1];
      for (int i=len-1; i>1; i--) b[i]=b[i-1];
      b[0]=b1;
      return b;
   }

   /** Rotates an array of bytes, shifting 1 byte right. */
   private static byte[] rotateRight(byte[] b)
   {  int len=b.length;
      byte b0=b[0];
      for (int i=1; i<len; i++) b[i-1]=b[i];
      b[len-1]=b0;
      return b;
   }

   /** Returns a copy of an array of bytes <i>b</i> */
   public static byte[] clone(byte[] b) { return getBytes(b,0,b.length); }

   /** Returns a <i>len</i>-byte array from array <i>b</i> with offset <i>offset</i> */
   public static byte[] getBytes(byte[] b, int offset, int len) { byte[] bb=new byte[len]; for (int k=0; k<len; k++) bb[k]=b[offset+k]; return bb; }
   
   /** Returns a 2-byte array from array <i>b</i> with offset <i>offset</i> */
   public static byte[] twoBytes(byte[] b, int offset) { return getBytes(b,offset,2); }
   
   /** Returns a 4-byte array from array <i>b</i> with offset <i>offset</i> */
   public static byte[] fourBytes(byte[] b, int offset) { return getBytes(b,offset,4); }
   
   /** Copies all bytes of array <i>src</i> into array <i>dst</i> with offset <i>offset</i> */
   public static void copyBytes(byte[] src, byte[] dst, int offset) { for (int k=0; k<src.length; k++) dst[offset+k]=src[k]; }

   /** Copies the first <i>len</i> bytes of array <i>src</i> into array <i>dst</i> with offset <i>offset</i> */
   public static void copyBytes(byte[] src, byte[] dst, int offset, int len) { for (int k=0; k<len; k++) dst[offset+k]=src[k]; }
   
   /** Copies the first 2 bytes of array <i>src</i> into array <i>dst</i> with offset <i>offset</i> */
   public static void copyTwoBytes(byte[] src, byte[] dst, int offset) { copyBytes(src,dst,offset,2); }
   
   /** Copies a the first 4 bytes of array <i>src</i> into array <i>dst</i> with offset <i>index</i> */
   public static void copyFourBytes(byte[] src, byte[] dst, int offset) { copyBytes(src,dst,offset,4); }


   /** Transforms the first <i>len</i> bytes of an array into a string of hex values */
   public static String bytesToHexString(byte[] b, int len)
   {  String s=new String();
      for (int i=0; i<len; i++)
      {  s+=Integer.toHexString((((b[i]+256)%256)/16)%16);
         s+=Integer.toHexString(((b[i]+256)%256)%16);
      }
      return s;
   }

   /** Transforms a byte array into a string of hex values */
   public static String bytesToHexString(byte[] b)
   {  return bytesToHexString(b,b.length);
   }
       
   /** Transforms a string of hex values into an array of bytes of max length <i>len</i>.
     * The string may include ':' chars. 
     * If <i>len</i> is set to -1, all string is converted. */
   public static byte[] hexStringToBytes(String str, int len)
   {  // if the string is of the form xx:yy:zz:ww.., remove all ':' first
      if (str.indexOf(":")>=0)
      {  String aux="";
         char c;
         for (int i=0; i<str.length(); i++) if ((c=str.charAt(i))!=':') aux+=c;
         str=aux;
      }
      // if len=-1, set the len value
      if (len<0) len=str.length()/2; 
      byte[] b=new byte[len];
      for (int i=0; i<len; i++)
      {  if (len<str.length()/2) b[i]=(byte)Integer.parseInt(str.substring(i*2,i*2+2),16);
         else b[i]=0;
      }
      return b;
   }
   
   /** Transforms a string of hex values into an array of bytes.
     * The string may include ':' chars. */
   public static byte[] hexStringToBytes(String str)
   {  return hexStringToBytes(str,-1); 
   }

   /** Transforms a four-bytes array into a dotted four-decimals string */
   public static String bytesToAddress(byte[] b)
   {  return Integer.toString(uByte(b[0]))+"."+Integer.toString(uByte(b[1]))+"."+Integer.toString(uByte(b[2]))+"."+Integer.toString(uByte(b[3]));
   }
   
   /** Transforms a dotted four-decimals string into a four-bytes array */
   public static byte[] addressToBytes(String addr)
   {  int begin=0, end;
      byte[] b=new byte[4];
      for (int i=0; i<4; i++)
      {  String num;
         if (i<3)
         {  end=addr.indexOf('.',begin);
            b[i]=(byte)Integer.parseInt(addr.substring(begin,end));
            begin=end+1;
         }
      else b[3]=(byte)Integer.parseInt(addr.substring(begin));
      }
      return b;
   } 
   
   /** Transforms a 4-bytes array into a 32-bit int */
   public static long bytesToInt(byte[] b)
   {  return ((((((long)uByte(b[0])<<8)+uByte(b[1]))<<8)+uByte(b[2]))<<8)+uByte(b[3]);
   }
   
   /** Transforms a 32-bit int into a 4-bytes array */
   public static byte[] intToBytes(long n)
   {  byte[] b=new byte[4];
      b[0]=(byte)(n>>24);
      b[1]=(byte)((n>>16)%256);
      b[2]=(byte)((n>>8)%256);
      b[3]=(byte)(n%256);
      return b;
   }

   /** Transforms a 4-bytes array into a 32-bit word (with the more significative byte at left) */
   public static long bytesToWord(byte[] b, int offset)
   {  return ((((((long)uByte(b[offset+3])<<8)+uByte(b[offset+2]))<<8)+uByte(b[offset+1]))<<8)+uByte(b[offset+0]);
   }

   /** Transforms a 4-bytes array into a 32-bit word (with the more significative byte at left) */
   public static long bytesToWord(byte[] b)
   {  return ((((((long)uByte(b[3])<<8)+uByte(b[2]))<<8)+uByte(b[1]))<<8)+uByte(b[0]);
   }
   
   /** Transforms a 32-bit word (with the more significative byte at left) into a 4-bytes array */
   public static byte[] wordToBytes(long n)
   {  byte[] b=new byte[4];
      b[3]=(byte)(n>>24);
      b[2]=(byte)((n>>16)%256);
      b[1]=(byte)((n>>8)%256);
      b[0]=(byte)(n%256);
      return b;
   }
   
   
   

   private static void print(String str)
   {  System.out.println(str);
   }
   

   // *************************** MAIN ****************************


   private static void decode(byte buffer[], int[] out)
   {  int offset=0; 
      int len=64;
      for (int i = 0; offset < len; i++, offset += 4)
      {  out[i] = ((int) (buffer[offset] & 0xff)) |
         (((int) (buffer[offset + 1] & 0xff)) << 8) |
         (((int) (buffer[offset + 2] & 0xff)) << 16) |
         (((int)  buffer[offset + 3]) << 24);
      }
   }


   public static void main(String[] args)
   {  
      byte[] buff=new byte[64];
      for (int i=0; i<64; i++) buff[i]=(byte)i;
      
      int[] x=new int[16];
      for (int i=0; i<16; i++) x[i]=(int)bytesToWord(buff,(i*4));
      
      for (int i=0; i<16; i++) print("x["+i+"]: "+bytesToHexString(wordToBytes(x[i]))); 
      decode(buff,x);      
      for (int i=0; i<16; i++) print("x["+i+"]: "+bytesToHexString(wordToBytes(x[i]))); 
   }
}
