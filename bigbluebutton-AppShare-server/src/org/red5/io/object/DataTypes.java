package org.red5.io.object;

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
 * The core datatypes supported by red5, I have left out undefined (this is
 * up for debate).
 * If a codec returns one of these datatypes its handled by the base
 * serializer.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class DataTypes {

    /** Padding marker. */
    public static final byte CORE_SKIP = 0x00; // padding
    
    /** Null type marker. */
    public static final byte CORE_NULL = 0x01; // no undefined type
    
    /** Boolean type marker. */
    public static final byte CORE_BOOLEAN = 0x02;
    
    /** Number type marker. */
    public static final byte CORE_NUMBER = 0x03;
    
    /** String type marker. */
    public static final byte CORE_STRING = 0x04;
    
    /** Date type marker. */
    public static final byte CORE_DATE = 0x05;

	// Basic stuctures

    /** Array type marker. */
    public static final byte CORE_ARRAY = 0x06;
    
    /** Map type marker. */
    public static final byte CORE_MAP = 0x07;
    
    /** XML type marker. */
    public static final byte CORE_XML = 0x08;
    
    /** Object (Hash) type marker. */
    public static final byte CORE_OBJECT = 0x09;

    /** ByteArray type marker (AMF3 only). */
    public static final byte CORE_BYTEARRAY = 0x10;

    /** Reference type, this is optional for codecs to support. */
    public static final byte OPT_REFERENCE = 0x11;

	// More datatypes can be added but they should be prefixed by the type
	// If a codec return one of these datatypes its handled by a custom
	// serializer

    /** Custom datatype mock mask marker. */
    public static final byte CUSTOM_MOCK_MASK = 0x20;
    
    /** Custom datatype AMF mask. */
    public static final byte CUSTOM_AMF_MASK = 0x30;

    /** Custom datatype RTMP mask. */
    public static final byte CUSTOM_RTMP_MASK = 0x40;
    
    /** Custom datatype JSON mask. */
    public static final byte CUSTOM_JSON_MASK = 0x50;
    
    /** Custom datatype XML mask. */
    public static final byte CUSTOM_XML_MASK = 0x60;

	// Some helper methods..

	/**
	 * Returns the string value of the data type.
	 * 
	 * @param dataType       AS data type as byte
	 * 
	 * @return String        String value of given ActionScript data type
	 */
	public static String toStringValue(byte dataType) {
		switch (dataType) {
			case CORE_SKIP:
				return "skip";
			case CORE_NULL:
				return "null";
			case CORE_BOOLEAN:
				return "Boolean";
			case CORE_NUMBER:
				return "Number";
			case CORE_STRING:
				return "String";
			case CORE_DATE:
				return "Date";
			case CORE_ARRAY:
				return "Array";
			case CORE_MAP:
				return "List";
			case CORE_XML:
				return "XML";
			case CORE_OBJECT:
				return "Object";
			case OPT_REFERENCE:
				return "Reference";
			default:
		}

		if (dataType >= CUSTOM_MOCK_MASK && dataType < CUSTOM_AMF_MASK) {
			return "MOCK[" + (dataType - CUSTOM_MOCK_MASK) + ']';
		}

		if (dataType >= CUSTOM_AMF_MASK && dataType < CUSTOM_RTMP_MASK) {
			return "AMF[" + (dataType - CUSTOM_AMF_MASK) + ']';
		}

		if (dataType >= CUSTOM_RTMP_MASK && dataType < CUSTOM_JSON_MASK) {
			return "RTMP[" + (dataType - CUSTOM_RTMP_MASK) + ']';
		}

		if (dataType >= CUSTOM_JSON_MASK && dataType < CUSTOM_XML_MASK) {
			return "JSON[" + (dataType - CUSTOM_JSON_MASK) + ']';
		}

		return "XML[" + (dataType - CUSTOM_XML_MASK) + ']';

	}

	/**
	 * Returns whether it is a basic data type.
	 * 
	 * @param type           Data type as byte
	 * 
	 * @return boolean       <code>true</code> if data type is primitive, <code>false</code> otherwise
	 */
	public static boolean isBasicType(byte type) {
		return type <= CORE_DATE;
	}

	/**
	 * Returns whether it is a complex data type.
	 * 
	 * @param type           Data type as byte
	 * 
	 * @return boolean       <code>true</code> if data type is complex (non-primitive), <code>false</code> otherwise
	 */
	public static boolean isComplexType(byte type) {
		return type >= CORE_ARRAY || type <= CORE_OBJECT;
	}

	/**
	 * Returns whether it is a custom data type.
	 * 
	 * @param type           Data type as byte
	 * 
	 * @return boolean       Whether given type is of custom type
	 */
	public static boolean isCustomType(byte type) {
		return type >= CUSTOM_AMF_MASK;
	}

}
