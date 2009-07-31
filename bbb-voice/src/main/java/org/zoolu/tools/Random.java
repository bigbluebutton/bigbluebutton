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



/** Class Random collects some static methods for generating
  * random numbers and other stuff.
  */
public class Random
{
   /** The random seed */
   static final long seed=System.currentTimeMillis();
   //static final long seed=0;
   
   static java.util.Random rand=new java.util.Random(seed);
   //static java.util.Random rand=new java.util.Random();

   /** Returns a random integer between 0 and n-1 */
   /*static public int nextInt(int n)
   {  seed=(seed*37)%987654321;
      return (int)(seed%n);
   }*/  

   /** Returns true or false respectively with probability p/100 and (1-p/100) */
   /*static boolean percent(int p)
   {  return integer(100)<p;
   }*/

   /** Sets the seed of this random number generator using a single long seed */
   public static void setSeed(long seed)
   {  rand.setSeed(seed);
   }

   /** Returns a random integer */
   public static int nextInt()
   {  return rand.nextInt();
   }

   /** Returns a random integer between 0 and n-1 */
   public static int nextInt(int n)
   {  return Math.abs(rand.nextInt())%n;
   }

   /** Returns a random long */
   public static long nextLong()
   {  return rand.nextLong();
   }

   /** Returns a random boolean */
   public static boolean nextBoolean()
   {  return rand.nextInt(2)==1;
   }

   /** Returns a random array of bytes */
   public static byte[] nextBytes(int len)
   {  byte[] buff=new byte[len];
      for (int i=0; i<len; i++) buff[i]=(byte)nextInt(256);
      return buff;
   }

   /** Returns a random String */
   public static String nextString(int len)
   {  byte[] buff=new byte[len];
      for (int i=0; i<len; i++)
      {  int n=nextInt(62);
         buff[i]=(byte)((n<10)? 48+n : ((n<36)? 55+n : 61+n));
      }
      return new String(buff);
   }

   /** Returns a random numeric String */
   public static String nextNumString(int len)
   {  byte[] buff=new byte[len];
      for (int i=0; i<len; i++) buff[i]=(byte)(48+nextInt(10));
      return new String(buff);
   }

   /** Returns a random hexadecimal String */
   public static String nextHexString(int len)
   {  byte[] buff=new byte[len];
      for (int i=0; i<len; i++)
      {  int n=nextInt(16);
         buff[i]=(byte)((n<10)? 48+n : 87+n);
      }
      return new String(buff);
   }
}
