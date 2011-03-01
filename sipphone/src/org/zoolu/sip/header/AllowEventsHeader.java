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


import java.util.Vector;


/** SIP Header Allow-Events */
public class AllowEventsHeader extends ListHeader
{
   public AllowEventsHeader(String hvalue)
   {  super(SipHeaders.Allow_Events,hvalue);
   }

   public AllowEventsHeader(Header hd)
   {  super(hd);
   }

   /** Gets list of events (as Vector of Strings). */
   public Vector getEvents()
   {  return super.getElements();
   }

   /** Sets the list of events. */
   public void setEvents(Vector events)
   {  super.setElements(events);
   }

   /** Adds a new event to the event list. */
   public void addEvent(String event)
   {  super.addElement(event);
   }
}
