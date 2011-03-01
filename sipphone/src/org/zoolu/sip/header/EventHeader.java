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


import org.zoolu.sip.address.*;
import org.zoolu.tools.Parser;


/** SIP Event header (RFC 3265).
  * <p>Event is a request header field (request-header).
  * It appears in SUBSCRIBE and NOTIFY requests. It provides a event-package name. */
public class EventHeader extends ParametricHeader
{
   /** State delimiters. */
   private static final char [] delim={',', ';', ' ', '\t', '\n', '\r'};

   /** Costructs a new EventHeader. */
   public EventHeader(String event_package)
   {  super(SipHeaders.Event,event_package);
   }

   /** Costructs a new EventHeader. */
   public EventHeader(String event_package, String id)
   {  super(SipHeaders.Event,event_package);
      if (id!=null) this.setParameter("id",id);
   }

   /** Costructs a new EventHeader. */
   public EventHeader(Header hd)
   {  super(hd);
   }

   /** Gets the event name. */
   public String getEvent()
   {  return new Parser(value).getWord(delim);
   }
   
   /** Gets 'id' parameter. */
   public String getId()
   {  return this.getParameter("id");
   }
   
   /** Whether it has 'id' parameter. */
   public boolean hasId()
   {  return this.hasParameter("id");
   }

}

