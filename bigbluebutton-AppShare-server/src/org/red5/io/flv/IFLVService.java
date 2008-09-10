package org.red5.io.flv;

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

import org.red5.io.IStreamableFileService;
import org.red5.io.object.Deserializer;
import org.red5.io.object.Serializer;

// TODO: Auto-generated Javadoc
/**
 * A FLVService sets up the service and hands out FLV objects to
 * its callers.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Dominick Accattato (daccattato@gmail.com)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public interface IFLVService extends IStreamableFileService {

	/**
	 * Sets the serializer.
	 * 
	 * @param serializer        Serializer object
	 */
	public void setSerializer(Serializer serializer);

	/**
	 * Sets the deserializer.
	 * 
	 * @param deserializer      Deserializer object
	 */
	public void setDeserializer(Deserializer deserializer);

}
