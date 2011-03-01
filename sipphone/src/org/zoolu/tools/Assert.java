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




/** Class Assert provides some static methods to check some inline conditions.
  * When an assertion fails an AssertionException is throws.
  * <p/> Such a tool could be helpful for debugging.
  */  
public class Assert
{
   /** Check that <i>exp</i> is true, otherwise an AssertionException is thrown.  */
   public final static void isTrue(boolean exp)
   {  if(!exp) onError("Assertion failed");
   }

   /** Check that <i>exp</i> is false, otherwise an AssertionException is thrown.  */
   public final static void isFalse(boolean exp)
   {  if(exp) onError("Assertion failed");
   }

   /** Check that <i>exp</i> is true, otherwise an AssertionException is thrown.  */
   public final static void isTrue(boolean exp, String msg)
   {  if(!exp) onError("Assertion failed: "+msg);
   }

   /** Check that <i>exp</i> is false, otherwise an AssertionException is thrown.  */
   public final static void isFalse(boolean exp, String msg)
   {  if(exp) onError("Assertion failed: "+msg);
   }

   private static void onError(String msg)
   {  throw new AssertException(msg);
   }

}
