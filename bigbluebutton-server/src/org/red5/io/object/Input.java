package org.red5.io.object;

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

import java.util.Date;
import java.util.Map;

import org.red5.io.amf3.ByteArray;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * Interface for Input which defines the contract methods which are
 * to be implemented. Input object provides
 * ways to read primitives, complex object and object references from byte buffer.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public interface Input {
    
    /**
     * Read type of data.
     * 
     * @return         Type of data as byte
     */
	byte readDataType();

	/**
	 * Read a string without the string type header.
	 * 
	 * @return         String
	 */
	String getString();

    /**
     * Read Null data type.
     * 
     * @return         Null datatype (AS)
     */
	Object readNull();

    /**
     * Read Boolean value.
     * 
     * @return         Boolean
     */
    Boolean readBoolean();

    /**
     * Read Number object.
     * 
     * @return         Number
     */
    Number readNumber();

    /**
     * Read String object.
     * 
     * @return         String
     */
    String readString();

    /**
     * Read date object.
     * 
     * @return         Date
     */
    Date readDate();

    /**
     * Read an array. This can result in a List or Map being
     * deserialized depending on the array type found.
     * 
     * @param deserializer the deserializer
     * 
     * @return 	   array
     */
    Object readArray(Deserializer deserializer);
    
    /**
     * Read a map containing key - value pairs. This can result
     * in a List or Map being deserialized depending on the
     * map type found.
     * 
     * @param deserializer the deserializer
     * 
     * @return 	   Map
     */
    Object readMap(Deserializer deserializer);
    
    /**
     * Read an object.
     * 
     * @param deserializer the deserializer
     * 
     * @return 	   object
     */
    Object readObject(Deserializer deserializer);

    /**
     * Read XML document.
     * 
     * @return       XML DOM document
     */
	Document readXML();

    /**
     * Read custom object.
     * 
     * @return          Custom object
     */
    Object readCustom();

    /**
     * Read ByteArray object.
     * 
     * @return 	ByteArray object
     */
    ByteArray readByteArray();
    
    /**
     * Read reference to Complex Data Type. Objects that are collaborators (properties) of other
     * objects must be stored as references in map of id-reference pairs.
     * 
     * @return the object
     */
	Object readReference();

    /**
     * Clears all references.
     */
    void clearReferences();

    /**
     * Read key - value pairs. This is required for the RecordSet
     * deserializer.
     * 
     * @param deserializer the deserializer
     * 
     * @return the map< string, object>
     */
    Map<String, Object> readKeyValues(Deserializer deserializer);
    
}
