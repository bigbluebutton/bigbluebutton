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


/** DialogIdentifier is used to address specific dialogs to the SipProvider.
  */
public class DialogIdentifier extends Identifier
{
   /** Costructs a new DialogIdentifier based on call-id, local and remote tags. */
   public DialogIdentifier(String call_id, String local_tag, String remote_tag)
   {  id=call_id+"-"+local_tag+"-"+remote_tag;
   }

   /** Costructs a new DialogIdentifier. */
   public DialogIdentifier(DialogIdentifier i)
   {  super(i);
   }
}
