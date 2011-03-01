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

package org.zoolu.sip.header;


import org.zoolu.tools.Parser;
//import org.zoolu.sip.provider.SipStack;


/** SIP Header Max-Forwards
  * The Max-Forwards header field serves to limit the number of hops a
  * request can transit on the way to its destination.  It consists of an
  * integer that is decremented by one at each hop.  If the Max-Forwards
  * value reaches 0 before the request reaches its destination, it will
  * be rejected with a 483(Too Many Hops) error response.
  * A default Max-Forwards value 70 is used.
  */
public class MaxForwardsHeader extends Header
{
   /** Creates a MaxForwardsHeader with value=<b>SipStack.max_forwards</b>
     * (the default value is 70, as recommended in RFC3261) */
   //public MaxForwardsHeader()
   //{  super("Max-Forwards",String.valueOf(SipStack.max_forwards));
   //}

   /** Creates a MaxForwardsHeader with value=<i>n</i> */
   public MaxForwardsHeader(int n)
   {  super(SipHeaders.Max_Forwards,String.valueOf(n));
   }

   public MaxForwardsHeader(String hvalue)
   {  super(SipHeaders.Max_Forwards,hvalue);
   }

   public MaxForwardsHeader(Header hd)
   {  super(hd);
   }
   
   /** Sets Max-Forwards number */
   public void setNumber(int n)
   {  value=String.valueOf(n);
   }

   /** Gets Max-Forwards number */
   public int getNumber()
   {  return (new Parser(value)).getInt();
   }

   /** Decrements the Max-Forwards number */
   public void decrement()
   {  value=String.valueOf(getNumber()-1);
   }
}

