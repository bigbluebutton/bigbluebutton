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


import java.io.ByteArrayOutputStream;
import java.io.PrintStream;


/** Class ExceptionPrinter just contains method <i>getStackTrace(Exception e)</i>
  * for getting a String reporting the stack-trace and description of Exception <i>e</i>. 
  */
public class ExceptionPrinter
{
   /** Gets the stack-trace and description of Exception <i>e</i>.
     * @return It returns a String with the stack-trace and description of the Exception. */
   public static String getStackTraceOf(Exception e)
   {  //return e.toString();
      ByteArrayOutputStream err=new ByteArrayOutputStream();
      e.printStackTrace(new PrintStream(err));
      return err.toString();
   }
}


