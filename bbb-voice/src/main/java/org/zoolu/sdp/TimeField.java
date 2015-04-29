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

package org.zoolu.sdp;


import org.zoolu.tools.Parser;


/** SDP attribute field.
  * <p>
  * <BLOCKQUOTE><PRE>
  *    time-fields = 1*( "t=" start-time SP stop-time *(CRLF repeat-fields) CRLF) [zone-adjustments CRLF]
  * </PRE></BLOCKQUOTE>
  */
public class TimeField extends SdpField
{  
   /** Creates a new TimeField. */
   public TimeField(String time_field)
   {  super('t',time_field);
   }

   /** Creates a new TimeField. */
   public TimeField(String start, String stop)
   {  super('t',start+" "+stop);
   }

   /** Creates a new void TimeField. */
   public TimeField()
   {  super('t',"0 0");
   }

   /** Creates a new TimeField. */
   public TimeField(SdpField sf)
   {  super(sf);
   }
      
   /** Gets the start time. */
   public String getStartTime()
   {  return (new Parser(value)).getString();
   }

   /** Gets the stop time. */
   public String getStopTime()
   {  return (new Parser(value)).skipString().getString();
   }

}
