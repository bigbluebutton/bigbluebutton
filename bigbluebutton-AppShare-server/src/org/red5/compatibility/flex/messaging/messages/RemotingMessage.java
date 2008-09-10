package org.red5.compatibility.flex.messaging.messages;

// TODO: Auto-generated Javadoc
/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 *
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this library; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */

/**
 * Flex compatibility message that is sent by the <code>mx:RemoteObject</code> mxml tag.
 * 
 * @see <a href="http://osflash.org/documentation/amf3">osflash documentation (external)</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RemotingMessage extends AsyncMessage {

	/** Method to execute. */
	public String operation;
	
	/** Value of the <code>source</code> attribute of mx:RemoteObject that sent the message. */
	public String source;

	/** {@inheritDoc} */
	protected void addParameters(StringBuilder result) {
		super.addParameters(result);
		result.append(",operation="+operation);
		result.append(",source="+source);
	}

}
