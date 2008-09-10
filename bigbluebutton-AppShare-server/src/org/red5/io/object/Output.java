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

import java.util.Collection;
import java.util.Date;
import java.util.Map;

import org.red5.io.amf3.ByteArray;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * Output interface which defines contract methods to be implemented.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public interface Output {

	/**
	 * Supports data type.
	 * 
	 * @param type the type
	 * 
	 * @return true, if successful
	 */
	boolean supportsDataType(byte type);

	/**
	 * Put string.
	 * 
	 * @param string the string
	 */
	void putString(String string);

	// Basic Data Types
    /**
	 * Write number.
	 * 
	 * @param num       Number
	 */
    void writeNumber(Number num);

    /**
     * Write boolean.
     * 
     * @param bol       Boolean
     */
    void writeBoolean(Boolean bol);

    /**
     * Write string.
     * 
     * @param string    String
     */
    void writeString(String string);

    /**
     * Write date.
     * 
     * @param date      Date
     */
    void writeDate(Date date);

	/**
	 * Write null.
	 */
	void writeNull();

    /**
     * Write array.
     * 
     * @param array     	Array to write.
     * @param serializer Serializer to use for subobjects.
     */
    void writeArray(Collection<?> array, Serializer serializer);

    /**
     * Write array.
     * 
     * @param array     	Array to write.
     * @param serializer Serializer to use for subobjects.
     */
    void writeArray(Object[] array, Serializer serializer);

    /**
     * Write primitive array.
     * 
     * @param array     	Array to write.
     * @param serializer Serializer to use for subobjects.
     */
    void writeArray(Object array, Serializer serializer);

    /**
     * Write map.
     * 
     * @param map 		Map to write
     * @param serializer Serializer to use for subobjects.
     */
    void writeMap(Map<Object, Object> map, Serializer serializer);

    /**
     * Write array as map.
     * 
     * @param array 		Array to write
     * @param serializer Serializer to use for subobjects.
     */
    void writeMap(Collection<?> array, Serializer serializer);

    /**
     * Write object.
     * 
     * @param object 	Object to write
     * @param serializer Serializer to use for subobjects.
     */
    void writeObject(Object object, Serializer serializer);

    /**
     * Write map as object.
     * 
     * @param map 		Map to write
     * @param serializer Serializer to use for subobjects.
     */
    void writeObject(Map<Object, Object> map, Serializer serializer);

    /**
     * Write recordset.
     * 
     * @param recordset 	Recordset to write.
     * @param serializer Serializer to use for subobjects.
     */
    void writeRecordSet(RecordSet recordset, Serializer serializer);

    /**
     * Write XML object.
     * 
     * @param xml      XML document
     */
    void writeXML(Document xml);

    /**
     * Write ByteArray object (AMF3 only).
     * 
     * @param array 	object to write
     */
    void writeByteArray(ByteArray array);
    
    /**
     * Write reference to complex data type.
     * 
     * @param obj   Referenced object
     */
	void writeReference(Object obj);

    /**
     * Whether object is custom.
     * 
     * @param custom           Object
     * 
     * @return                 true if object is of user type, false otherwise
     */
	boolean isCustom(Object custom);

    /**
     * Write custom (user) object.
     * 
     * @param custom     Custom data type object
     */
    void writeCustom(Object custom);

    /**
     * Clear references.
     */
    void clearReferences();
}
