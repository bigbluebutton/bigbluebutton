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

package org.zoolu.sip.message;




/** Class SipResponses provides all raeson-phrases
  * corrspondent to the various SIP response codes */
public class SipResponses extends BaseSipResponses
{   
   private static boolean is_init=false;

   public static void init()
   {  if (is_init) return;
      //else
            
      BaseSipResponses.init();
      
      // New response codes
      //reasons[xxx]="This Reason";
      //reasons[yyy]="A Second Reason";
      //..

      // Success
      reasons[202]="Accepted";

      // Failure
      reasons[489]="Bad Event";

      is_init=true;
   }


   /** Gets the reason phrase of a response code */
   public static String reasonOf(int code)
   {  if (!is_init) init();
      return BaseSipResponses.reasonOf(code);
   }  
   
}
