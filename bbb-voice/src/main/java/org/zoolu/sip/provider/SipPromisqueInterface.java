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

package org.zoolu.sip.provider;


import org.zoolu.sip.message.Message;


/** SipPromisqueInterface is the SipInterface for capturing
  * all SIP messages in PROMISQUE mode.
  * All incoming messages are passed to the listener associated to the SipPromisqueInterface
  * regardless of any other opened SipInterface.
  * <p/>
  * More than one SipPromisqueInterface can be open concurrently.
  */
public class SipPromisqueInterface extends SipInterface
{
   /** Creates a new SipPromisqueInterface. */ 
   public SipPromisqueInterface(SipProvider sip_provider, SipInterfaceListener listener)
   {  super(sip_provider,SipProvider.PROMISQUE,listener);
   }
}
