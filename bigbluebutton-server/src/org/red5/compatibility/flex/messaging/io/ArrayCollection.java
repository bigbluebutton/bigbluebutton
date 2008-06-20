package org.red5.compatibility.flex.messaging.io;

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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.red5.io.amf3.IDataInput;
import org.red5.io.amf3.IDataOutput;
import org.red5.io.amf3.IExternalizable;

// TODO: Auto-generated Javadoc
/**
 * Flex <code>ArrayCollection</code> compatibility class.
 * 
 * @see <a href="http://livedocs.adobe.com/flex/2/langref/mx/collections/ArrayCollection.html">Adobe Livedocs (external)</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class ArrayCollection<T> extends ArrayList<T> implements Collection<T>, IExternalizable {

	/** Serial number. */
	private static final long serialVersionUID = -9086041828446362637L;
	
	/** {@inheritDoc} */
	@SuppressWarnings("unchecked")
	public void readExternal(IDataInput input) {
		clear();
		addAll((List) input.readObject());
	}

	/** {@inheritDoc} */
	public void writeExternal(IDataOutput output) {
		output.writeObject(this.toArray());
	}

}
