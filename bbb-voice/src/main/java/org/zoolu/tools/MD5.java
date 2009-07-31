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



/** MD5 hash algorithm.
  * <p> Implements the RSA Data Security, Inc. MD5 Message-Digest Algorithm.
  * This is almoust straight implementation of the reference implementation
  * given in RFC1321 by RSA.
  */
public class MD5 extends MessageDigest
{

   // ********************** Mangle functions **********************

   /** Rotates w, shifting n bits left. */
   //private static int rotateLeft(int w, int n) {  return (w << n) | (w >>> (32-n));  }

   /** Rotates w, shifting n bits right. */
   //private static int rotateRight(int w, int n) {  return (w >>> n) | (w << (32-n));  }

   /** Rotates an array of words, shifting 1 word left. */
   /*private static int[] rotateLeft(int[] w)
   {  int len=w.length;
      int w1=w[len-1];
      for (int i=len-1; i>0; i--) w[i]=w[i-1];
      w[0]=w1;
      return w;
   }*/

   /** Rotates an array of words, shifting 1 word right. */
   /*private static int[] rotateRight(int[] w)
   {  int len=w.length;
      int w0=w[0];
      for (int i=1; i<len; i++) w[i-1]=w[i];
      w[len-1]=w0;
      return w;
   }*/

   /** Gets the unsigned representatin of a byte (into a short) */
   //public static short uByte(byte b) {  return (short)(((short)b+256)%256);  } 

   /** Gets the unsigned representatin of a 32-bit word (into a long) */
   /*public static long uWord(int n)
   {  long wmask=0x10000;
      wmask*=wmask;
      return (long)(((long)n+wmask)%wmask);
   }*/ 

   /** Copies all bytes of array <i>src</i> into array <i>dst</i> with offset <i>offset</i> */
   //public static void copyBytes(byte[] src, byte[] dst, int offset) { for (int k=0; k<src.length; k++) dst[offset+k]=src[k]; }

   /** Copies the first <i>len</i> bytes of array <i>src</i> into array <i>dst</i> with offset <i>offset</i> */
   //public static void copyBytes(byte[] src, byte[] dst, int offset, int len) { for (int k=0; k<len; k++) dst[offset+k]=src[k]; }

   /** Transforms a 4-bytes array into a 32-bit word (with the more significative byte at left) */
   //public static long bytesToWord(byte[] b, int offset) {  return ((((((long)uByte(b[offset+3])<<8)+uByte(b[offset+2]))<<8)+uByte(b[offset+1]))<<8)+uByte(b[offset+0]);  }

   /** Transforms a 4-bytes array into a 32-bit word (with the more significative byte at left) */
   //public static long bytesToWord(byte[] b) {  return ((((((long)uByte(b[3])<<8)+uByte(b[2]))<<8)+uByte(b[1]))<<8)+uByte(b[0]);  }
   
   /** Transforms a 32-bit word (with the more significative byte at left) into a 4-bytes array */
   /*public static byte[] wordToBytes(long n)
   {  byte[] b=new byte[4];
      b[3]=(byte)(n>>24);
      b[2]=(byte)((n>>16)%256);
      b[1]=(byte)((n>>8)%256);
      b[0]=(byte)(n%256);
      return b;
   }*/


   // ************************* Attributes *************************

   /** The digest */
   byte[] message_digest;

   /** byte counter mod 2^64 */
   long count;

   /** 128bit state (A,B,C, and D words) */
   int state[];

   /** 64B (512 bits) chunk of the input message */
   byte block[];

   /** Number of bytes remained into the chunk */
   int block_offset;

   /** Padding */
   static byte zeropadding[]= { (byte)0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };


   /* Constants for MD5 transformation */
   /*
   static final int S11=7;
   static final int S12=12;
   static final int S13=17;
   static final int S14=22;
   static final int S21=5;
   static final int S22=9;
   static final int S23=14;
   static final int S24=20;
   static final int S31=4;
   static final int S32=11;
   static final int S33=16;
   static final int S34=23;
   static final int S41=6;
   static final int S42=10;
   static final int S43=15;
   static final int S44=21;
   */

   
   // *********************** Public methods ***********************

   /** Constructor */
   public MD5()
   {  init();
   }


   /** Constructor */
   public MD5(byte[] buffer)
   {  init();
      update(buffer);
   }


   /** Constructor */
   public MD5(byte[] buffer, int offset, int len)
   {  init();
      update(buffer,offset,len);
   }


   /** Constructor */
   public MD5(String str)
   {  init();
      update(str);
   }


   /** Inits the MD5 */
   private void init()
   {  count=0;
      // init the first block
      block=new byte[64];
      block_offset=0;
      // load magic initialization constants 
      state=new int[4];
      state[0]=0x67452301;
      state[1]=0xefcdab89;
      state[2]=0x98badcfe;
      state[3]=0x10325476;
      
      message_digest=null;
   }


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   /*public MD5 update(String str)
   {  byte[] buf=str.getBytes();
      return update(buf,0,buf.length);
   }*/


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   /*public MD5 update(byte[] buffer)
   {  return update(buffer,0,buffer.length);
   }*/


   /** MessageDigest block update operation.
     * Continues a message-digest operation,
     * processing another message block, and updating the context. */
   public MessageDigest update(byte[] buffer, int offset, int len)
   {
      if (message_digest!=null) return this;
      //else
       
      count+=len;
      
      // num of remaining bytes to be processed
      int size=block.length-block_offset;

      while(len>=size)
      {  // fill a block
         for (int i=0; i<size; i++) block[block_offset+i]=buffer[offset+i];

         // process the block
         transform(state,block);
         
         // update offset, len, etc.
         offset+=size;
         len-=size;
         block_offset=0;
         size=block.length-block_offset;
      }
      // copy the remaining bytes
      for (int i=0; i<len; i++) block[block_offset+i]=buffer[offset+i];
      block_offset+=len;     

      return this;
   }


   /** Gets the MessageDigest. The same as doFinal(). */
   /*public byte[] getDigest()
   {  return doFinal();
   }*/


   /** MessageDigest finalization. Ends a message-digest operation, writing the
     * the message digest and zeroizing the context. */
   public byte[] doFinal()
   {
      if (message_digest!=null) return message_digest;
      //else

      // num of padding zeros (node: block_offset is at most 64) 
      int npad=64-((block_offset+8)%64);
      
      // set total bit length into the last 8 bytes
      long len=count*8;
      byte[] len_field=new byte[8];    
      for (int i=0; i<8; i++) {  len_field[i]=(byte)(len%256); len>>=8;  }

      // process the last chunk, i.e. zero-pading(1-64B) + length-field(8B) (1 or 2 blocks) 
      update(zeropadding,0,npad);
      update(len_field,0,8);
      
      message_digest=new byte[16];
      // convert 4 words to 16 bytes
      //for (int i=0; i<4; i++) {  copyBytes(wordToBytes(state[i]),message_digest,i*4);  }
      int k=0;
      for (int i=0; i<4; i++)
      {  message_digest[k++]=(byte)((state[i]) & 0xff);
         message_digest[k++]=(byte)((state[i]>>>8) & 0xff);
         message_digest[k++]=(byte)((state[i]>>>16) & 0xff);
         message_digest[k++]=(byte)((state[i]>>>24) & 0xff);
      }
      return message_digest;
   }


   /** MD5 basic transformation. Transforms state based on block. */
   private static void transform(int[] state, byte[] block)
   {
      int a=state[0];
      int b=state[1];
      int c=state[2];
      int d=state[3];

      int[] x=new int[16];
      x[0]=((int) (block[0] & 0xff)) |
          (((int) (block[1] & 0xff)) << 8) |
          (((int) (block[2] & 0xff)) << 16) |
          (((int) (block[3])) << 24);
      x[1]=((int) (block[4] & 0xff)) |
          (((int) (block[5] & 0xff)) << 8) |
          (((int) (block[6] & 0xff)) << 16) |
          (((int) (block[7])) << 24);
      x[2]=((int) (block[8] & 0xff)) |
          (((int) (block[9] & 0xff)) << 8) |
          (((int) (block[10] & 0xff)) << 16) |
          (((int) (block[11])) << 24);
      x[3]=((int) (block[12] & 0xff)) |
          (((int) (block[13] & 0xff)) << 8) |
          (((int) (block[14] & 0xff)) << 16) |
          (((int) (block[15])) << 24);
      x[4]=((int) (block[16] & 0xff)) |
          (((int) (block[17] & 0xff)) << 8) |
          (((int) (block[18] & 0xff)) << 16) |
          (((int) (block[19])) << 24);
      x[5]=((int) (block[20] & 0xff)) |
          (((int) (block[21] & 0xff)) << 8) |
          (((int) (block[22] & 0xff)) << 16) |
          (((int) (block[23])) << 24);
      x[6]=((int) (block[24] & 0xff)) |
          (((int) (block[25] & 0xff)) << 8) |
          (((int) (block[26] & 0xff)) << 16) |
          (((int) (block[27])) << 24);
      x[7]=((int) (block[28] & 0xff)) |
          (((int) (block[29] & 0xff)) << 8) |
          (((int) (block[30] & 0xff)) << 16) |
          (((int) (block[31])) << 24);
      x[8]=((int) (block[32] & 0xff)) |
          (((int) (block[33] & 0xff)) << 8) |
          (((int) (block[34] & 0xff)) << 16) |
          (((int) (block[35])) << 24);
      x[9]=((int) (block[36] & 0xff)) |
          (((int) (block[37] & 0xff)) << 8) |
          (((int) (block[38] & 0xff)) << 16) |
          (((int) (block[39])) << 24);
      x[10]=((int)(block[40] & 0xff)) |
          (((int) (block[41] & 0xff)) << 8) |
          (((int) (block[42] & 0xff)) << 16) |
          (((int) (block[43])) << 24);
      x[11]=((int)(block[44] & 0xff)) |
          (((int) (block[45] & 0xff)) << 8) |
          (((int) (block[46] & 0xff)) << 16) |
          (((int) (block[47])) << 24);
      x[12]=((int)(block[48] & 0xff)) |
          (((int) (block[49] & 0xff)) << 8) |
          (((int) (block[50] & 0xff)) << 16) |
          (((int) (block[51])) << 24);
      x[13]=((int)(block[52] & 0xff)) |
          (((int) (block[53] & 0xff)) << 8) |
          (((int) (block[54] & 0xff)) << 16) |
          (((int) (block[55])) << 24);
      x[14]=((int)(block[56] & 0xff)) |
          (((int) (block[57] & 0xff)) << 8) |
          (((int) (block[58] & 0xff)) << 16) |
          (((int) (block[59])) << 24);
      x[15]=((int)(block[60] & 0xff)) |
          (((int) (block[61] & 0xff)) << 8) |
          (((int) (block[62] & 0xff)) << 16) |
          (((int) (block[63])) << 24);
                 
      /* Round 1 */
      a+= ((b & c) | (~b & d)) + x[ 0] + 0xd76aa478;
      a = ((a << 7) | (a >>> 25)) + b;
      d+= ((a & b) | (~a & c)) + x[ 1] + 0xe8c7b756;
      d = ((d << 12) | (d >>> 20)) + a;
      c+= ((d & a) | (~d & b)) + x[ 2] + 0x242070db;
      c = ((c << 17) | (c >>> 15)) + d;
      b+= ((c & d) | (~c & a)) + x[ 3] + 0xc1bdceee;
      b = ((b << 22) | (b >>> 10)) + c;
      
      a+= ((b & c) | (~b & d)) + x[ 4] + 0xf57c0faf;
      a = ((a << 7) | (a >>> 25)) + b;
      d+= ((a & b) | (~a & c)) + x[ 5] + 0x4787c62a;
      d = ((d << 12) | (d >>> 20)) + a;
      c+= ((d & a) | (~d & b)) + x[ 6] + 0xa8304613;
      c = ((c << 17) | (c >>> 15)) + d;
      b+= ((c & d) | (~c & a)) + x[ 7] + 0xfd469501;
      b = ((b << 22) | (b >>> 10)) + c;
      
      a+= ((b & c) | (~b & d)) + x[ 8] + 0x698098d8;
      a = ((a << 7) | (a >>> 25)) + b;
      d+= ((a & b) | (~a & c)) + x[ 9] + 0x8b44f7af;
      d = ((d << 12) | (d >>> 20)) + a;
      c+= ((d & a) | (~d & b)) + x[10] + 0xffff5bb1;
      c = ((c << 17) | (c >>> 15)) + d;
      b+= ((c & d) | (~c & a)) + x[11] + 0x895cd7be;
      b = ((b << 22) | (b >>> 10)) + c;
      
      a+= ((b & c) | (~b & d)) + x[12] + 0x6b901122;
      a = ((a << 7) | (a >>> 25)) + b;
      d+= ((a & b) | (~a & c)) + x[13] + 0xfd987193;
      d = ((d << 12) | (d >>> 20)) + a;
      c+= ((d & a) | (~d & b)) + x[14] + 0xa679438e;
      c = ((c << 17) | (c >>> 15)) + d;
      b+= ((c & d) | (~c & a)) + x[15] + 0x49b40821;
      b = ((b << 22) | (b >>> 10)) + c;
      
      
      /* Round 2 */
      a+= ((b & d) | (c & ~d)) + x[ 1] + 0xf61e2562;
      a = ((a << 5) | (a >>> 27)) + b;
      d+= ((a & c) | (b & ~c)) + x[ 6] + 0xc040b340;
      d = ((d << 9) | (d >>> 23)) + a;
      c+= ((d & b) | (a & ~b)) + x[11] + 0x265e5a51;
      c = ((c << 14) | (c >>> 18)) + d;
      b+= ((c & a) | (d & ~a)) + x[ 0] + 0xe9b6c7aa;
      b = ((b << 20) | (b >>> 12)) + c;
      
      a+= ((b & d) | (c & ~d)) + x[ 5] + 0xd62f105d;
      a = ((a << 5) | (a >>> 27)) + b;
      d+= ((a & c) | (b & ~c)) + x[10] + 0x02441453;
      d = ((d << 9) | (d >>> 23)) + a;
      c+= ((d & b) | (a & ~b)) + x[15] + 0xd8a1e681;
      c = ((c << 14) | (c >>> 18)) + d;
      b+= ((c & a) | (d & ~a)) + x[ 4] + 0xe7d3fbc8;
      b = ((b << 20) | (b >>> 12)) + c;
      
      a+= ((b & d) | (c & ~d)) + x[ 9] + 0x21e1cde6;
      a = ((a << 5) | (a >>> 27)) + b;
      d+= ((a & c) | (b & ~c)) + x[14] + 0xc33707d6;
      d = ((d << 9) | (d >>> 23)) + a;
      c+= ((d & b) | (a & ~b)) + x[ 3] + 0xf4d50d87;
      c = ((c << 14) | (c >>> 18)) + d;
      b+= ((c & a) | (d & ~a)) + x[ 8] + 0x455a14ed;
      b = ((b << 20) | (b >>> 12)) + c;
      
      a+= ((b & d) | (c & ~d)) + x[13] + 0xa9e3e905;
      a = ((a << 5) | (a >>> 27)) + b;
      d+= ((a & c) | (b & ~c)) + x[ 2] + 0xfcefa3f8;
      d = ((d << 9) | (d >>> 23)) + a;
      c+= ((d & b) | (a & ~b)) + x[ 7] + 0x676f02d9;
      c = ((c << 14) | (c >>> 18)) + d;
      b+= ((c & a) | (d & ~a)) + x[12] + 0x8d2a4c8a;
      b = ((b << 20) | (b >>> 12)) + c;
      
      
      /* Round 3 */
      a+= (b ^ c ^ d) + x[ 5] + 0xfffa3942;
      a = ((a << 4) | (a >>> 28)) + b;
      d+= (a ^ b ^ c) + x[ 8] + 0x8771f681;
      d = ((d << 11) | (d >>> 21)) + a;
      c+= (d ^ a ^ b) + x[11] + 0x6d9d6122;
      c = ((c << 16) | (c >>> 16)) + d;
      b+= (c ^ d ^ a) + x[14] + 0xfde5380c;
      b = ((b << 23) | (b >>> 9)) + c;
      
      a+= (b ^ c ^ d) + x[ 1] + 0xa4beea44;
      a = ((a << 4) | (a >>> 28)) + b;
      d+= (a ^ b ^ c) + x[ 4] + 0x4bdecfa9;
      d = ((d << 11) | (d >>> 21)) + a;
      c+= (d ^ a ^ b) + x[ 7] + 0xf6bb4b60;
      c = ((c << 16) | (c >>> 16)) + d;
      b+= (c ^ d ^ a) + x[10] + 0xbebfbc70;
      b = ((b << 23) | (b >>> 9)) + c;
      
      a+= (b ^ c ^ d) + x[13] + 0x289b7ec6;
      a = ((a << 4) | (a >>> 28)) + b;
      d+= (a ^ b ^ c) + x[ 0] + 0xeaa127fa;
      d = ((d << 11) | (d >>> 21)) + a;
      c+= (d ^ a ^ b) + x[ 3] + 0xd4ef3085;
      c = ((c << 16) | (c >>> 16)) + d;
      b+= (c ^ d ^ a) + x[ 6] + 0x04881d05;
      b = ((b << 23) | (b >>> 9)) + c;
      
      a+= (b ^ c ^ d) + x[ 9] + 0xd9d4d039;
      a = ((a << 4) | (a >>> 28)) + b;
      d+= (a ^ b ^ c) + x[12] + 0xe6db99e5;
      d = ((d << 11) | (d >>> 21)) + a;
      c+= (d ^ a ^ b) + x[15] + 0x1fa27cf8;
      c = ((c << 16) | (c >>> 16)) + d;
      b+= (c ^ d ^ a) + x[ 2] + 0xc4ac5665;
      b = ((b << 23) | (b >>> 9)) + c;
      
      
      /* Round 4 */
      a+= (c ^ (b | ~d)) + x[ 0] + 0xf4292244;
      a = ((a << 6) | (a >>> 26)) + b;
      d+= (b ^ (a | ~c)) + x[ 7] + 0x432aff97;
      d = ((d << 10) | (d >>> 22)) + a;
      c+= (a ^ (d | ~b)) + x[14] + 0xab9423a7;
      c = ((c << 15) | (c >>> 17)) + d;
      b+= (d ^ (c | ~a)) + x[ 5] + 0xfc93a039;
      b = ((b << 21) | (b >>> 11)) + c;
      
      a+= (c ^ (b | ~d)) + x[12] + 0x655b59c3;
      a = ((a << 6) | (a >>> 26)) + b;
      d+= (b ^ (a | ~c)) + x[ 3] + 0x8f0ccc92;
      d = ((d << 10) | (d >>> 22)) + a;
      c+= (a ^ (d | ~b)) + x[10] + 0xffeff47d;
      c = ((c << 15) | (c >>> 17)) + d;
      b+= (d ^ (c | ~a)) + x[ 1] + 0x85845dd1;
      b = ((b << 21) | (b >>> 11)) + c;
      
      a+= (c ^ (b | ~d)) + x[ 8] + 0x6fa87e4f;
      a = ((a << 6) | (a >>> 26)) + b;
      d+= (b ^ (a | ~c)) + x[15] + 0xfe2ce6e0;
      d = ((d << 10) | (d >>> 22)) + a;
      c+= (a ^ (d | ~b)) + x[ 6] + 0xa3014314;
      c = ((c << 15) | (c >>> 17)) + d;
      b+= (d ^ (c | ~a)) + x[13] + 0x4e0811a1;
      b = ((b << 21) | (b >>> 11)) + c;
      
      a+= (c ^ (b | ~d)) + x[ 4] + 0xf7537e82;
      a = ((a << 6) | (a >>> 26)) + b;
      d+= (b ^ (a | ~c)) + x[11] + 0xbd3af235;
      d = ((d << 10) | (d >>> 22)) + a;
      c+= (a ^ (d | ~b)) + x[ 2] + 0x2ad7d2bb;
      c = ((c << 15) | (c >>> 17)) + d;
      b+= (d ^ (c | ~a)) + x[ 9] + 0xeb86d391;
      b = ((b << 21) | (b >>> 11)) + c;
      
      state[0]+= a;
      state[1]+= b;
      state[2]+= c;
      state[3]+= d;
   }


   /** F MD5 function. */
   //private static int F(int x, int y, int z) {  return (x & y) | ((~x) & z);  }
   /** G MD5 function. */
   //private static int G(int x, int y, int z) {  return (x & z) | (y & (~z));  }
   /** H MD5 function. */
   //private static int H(int x, int y, int z) {  return (x ^ y ^ z);  }
   /** I MD5 function. */
   //private static int I(int x, int y, int z) {  return y ^ (x | (~z));  }


   /** FF transformation for round 1.
       Rotation is separate from addition to prevent recomputation. */
   /*private static int[] FF(int[] w, int x, int s, int t)
   {  w[0] += F(w[1],w[2],w[3]) + x + t;
      w[0] = rotateLeft(w[0],s) + w[1];
      return rotateLeft(w);
   }*/
   /** GG transformation for round 2.
       Rotation is separate from addition to prevent recomputation. */
   /*private static int[] GG(int[] w, int x, int s, int t)
   {  w[0] += G(w[1],w[2],w[3]) + x + t;
      w[0] = rotateLeft(w[0],s) + w[1];
      return rotateLeft(w);
   }*
   /** HH transformation for round 3.
       Rotation is separate from addition to prevent recomputation. */
   /*private static int[] HH(int[] w, int x, int s, int t)
   {  w[0] += H(w[1],w[2],w[3]) + x + t;
      w[0] = rotateLeft(w[0],s) + w[1];
      return rotateLeft(w);
   }*
   /** II transformation for round 4.
       Rotation is separate from addition to prevent recomputation. */
   /*private static int[] II(int[] w, int x, int s, int t)
   {  w[0] += I(w[1],w[2],w[3]) + x + t;
      w[0] = rotateLeft(w[0],s) + w[1];
      return rotateLeft(w);
   }*/


   /** MD5 basic transformation. Transforms state based on block. */
   /*private static void transform(int[] state, byte[] block)
   {
      int[] x=new int[16];
      for (int i=0; i<16; i++) x[i]=(int)bytesToWord(block,(i*4));
      
      // make a copy of the state
      int[] state_cp=new int[4];
      for (int i=0; i<4; i++) state_cp[i]=state[i];
      
      // Round 1
      FF (state, x[ 0], S11, 0xd76aa478); 
      FF (state, x[ 1], S12, 0xe8c7b756);
      FF (state, x[ 2], S13, 0x242070db);
      FF (state, x[ 3], S14, 0xc1bdceee);
      FF (state, x[ 4], S11, 0xf57c0faf);
      FF (state, x[ 5], S12, 0x4787c62a);
      FF (state, x[ 6], S13, 0xa8304613);
      FF (state, x[ 7], S14, 0xfd469501);
      FF (state, x[ 8], S11, 0x698098d8);
      FF (state, x[ 9], S12, 0x8b44f7af);
      FF (state, x[10], S13, 0xffff5bb1);
      FF (state, x[11], S14, 0x895cd7be);
      FF (state, x[12], S11, 0x6b901122);
      FF (state, x[13], S12, 0xfd987193);
      FF (state, x[14], S13, 0xa679438e);
      FF (state, x[15], S14, 0x49b40821);

      // Round 2
      GG (state, x[ 1], S21, 0xf61e2562);
      GG (state, x[ 6], S22, 0xc040b340);
      GG (state, x[11], S23, 0x265e5a51);
      GG (state, x[ 0], S24, 0xe9b6c7aa);
      GG (state, x[ 5], S21, 0xd62f105d);
      GG (state, x[10], S22,  0x2441453);
      GG (state, x[15], S23, 0xd8a1e681);
      GG (state, x[ 4], S24, 0xe7d3fbc8);
      GG (state, x[ 9], S21, 0x21e1cde6);
      GG (state, x[14], S22, 0xc33707d6);
      GG (state, x[ 3], S23, 0xf4d50d87);
      GG (state, x[ 8], S24, 0x455a14ed);
      GG (state, x[13], S21, 0xa9e3e905);
      GG (state, x[ 2], S22, 0xfcefa3f8);
      GG (state, x[ 7], S23, 0x676f02d9);
      GG (state, x[12], S24, 0x8d2a4c8a);

      // Round 3
      HH (state, x[ 5], S31, 0xfffa3942);
      HH (state, x[ 8], S32, 0x8771f681);
      HH (state, x[11], S33, 0x6d9d6122);
      HH (state, x[14], S34, 0xfde5380c);
      HH (state, x[ 1], S31, 0xa4beea44);
      HH (state, x[ 4], S32, 0x4bdecfa9);
      HH (state, x[ 7], S33, 0xf6bb4b60);
      HH (state, x[10], S34, 0xbebfbc70);
      HH (state, x[13], S31, 0x289b7ec6);
      HH (state, x[ 0], S32, 0xeaa127fa);
      HH (state, x[ 3], S33, 0xd4ef3085);
      HH (state, x[ 6], S34,  0x4881d05);
      HH (state, x[ 9], S31, 0xd9d4d039);
      HH (state, x[12], S32, 0xe6db99e5);
      HH (state, x[15], S33, 0x1fa27cf8);
      HH (state, x[ 2], S34, 0xc4ac5665);

      // Round 4
      II (state, x[ 0], S41, 0xf4292244);
      II (state, x[ 7], S42, 0x432aff97);
      II (state, x[14], S43, 0xab9423a7);
      II (state, x[ 5], S44, 0xfc93a039);
      II (state, x[12], S41, 0x655b59c3);
      II (state, x[ 3], S42, 0x8f0ccc92);
      II (state, x[10], S43, 0xffeff47d);
      II (state, x[ 1], S44, 0x85845dd1);
      II (state, x[ 8], S41, 0x6fa87e4f);
      II (state, x[15], S42, 0xfe2ce6e0);
      II (state, x[ 6], S43, 0xa3014314);
      II (state, x[13], S44, 0x4e0811a1);
      II (state, x[ 4], S41, 0xf7537e82);
      II (state, x[11], S42, 0xbd3af235);
      II (state, x[ 2], S43, 0x2ad7d2bb);
      II (state, x[ 9], S44, 0xeb86d391);
      
      for (int i=0; i<4; i++) state[i]+=state_cp[i];
   }*/


   
   /** Calculates the MD5. */
   public static byte[] digest(byte[] buffer, int offset, int len)
   {  MD5 md5=new MD5(buffer,offset,len);
      return md5.doFinal();
   }


   /** Calculates the MD5. */
   public static byte[] digest(byte[] buffer)
   {  return digest(buffer,0,buffer.length);
   }


   /** Calculates the MD5. */
   public static byte[] digest(String str)
   {  MD5 md5=new MD5(str);
      return md5.doFinal();
   }
   
   
   /** Gets the message-digest as string of hex values */
   /*public String asHex()
   {   return asHex(doFinal());
   }*/


   /** Transforms an array of bytes into a string of hex values */
   /*public static String asHex(byte[] buf)
   {  String str=new String();
      for (int i=0; i<buf.length; i++)
      {  str+=Integer.toHexString((buf[i]>>>4)&0x0F);
         str+=Integer.toHexString(buf[i]&0x0F);
      }
      return str;
   }*/

}
