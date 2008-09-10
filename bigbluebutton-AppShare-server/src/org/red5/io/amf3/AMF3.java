package org.red5.io.amf3;

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

import java.nio.charset.Charset;

// TODO: Auto-generated Javadoc
/**
 * AMF3 data type definitions.
 * 
 * For detailed specification please see the link below.
 * 
 * @see <a href="http://osflash.org/amf3/index">AMF3 specification (external)</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class AMF3 {
    
    /** UTF-8 is used. */
	public static final Charset CHARSET = Charset.forName("UTF-8");

	/** Minimum possible value for integer number encoding. */
	public static final long MIN_INTEGER_VALUE = -268435456;
	
	/** Maximum possible value for integer number encoding. */
	public static final long MAX_INTEGER_VALUE = 268435455;
	
    /** Max string length. */
    public static final int LONG_STRING_LENGTH = 65535;

    /** Null marker. */
    public static final byte TYPE_NULL = 0x01;

    /** Boolean false marker. */
    public static final byte TYPE_BOOLEAN_FALSE = 0x02;

    /** Boolean true marker. */
    public static final byte TYPE_BOOLEAN_TRUE = 0x03;

    /** Integer marker. */
    public static final byte TYPE_INTEGER = 0x04;

    /** Number marker. */
    public static final byte TYPE_NUMBER = 0x05;

    /** String marker. */
    public static final byte TYPE_STRING = 0x06;

	// TODO m.j.m hm..not defined on site, says it's only XML type, so i'll
	// assume it is for the time being..
    /** The Constant TYPE_XML_SPECIAL. */
	public static final byte TYPE_XML_SPECIAL = 0x07;

    /** Date marker. */
    public static final byte TYPE_DATE = 0x08;

    /** Array start marker. */
    public static final byte TYPE_ARRAY = 0x09;

    /** Object start marker. */
    public static final byte TYPE_OBJECT = 0x0A;

    /** XML start marker. */
    public static final byte TYPE_XML = 0x0B;

    /** ByteArray marker. */
    public static final byte TYPE_BYTEARRAY = 0x0C;
    
	//public final static byte TYPE_ZZZ = 0x0D;

	/** Property list encoding.  The remaining integer-data represents the number of class members that exist. The property names are read as string-data. The values are then read as AMF3-data. */
    public static final byte TYPE_OBJECT_PROPERTY = 0x00;

	/** Externalizable object.  What follows is the value of the "inner" object, including type code. This value appears for objects that implement IExternalizable, such as ArrayCollection and ObjectProxy. */
    public static final byte TYPE_OBJECT_EXTERNALIZABLE = 0x01;

	/** Name-value encoding.  The property names and values are encoded as string-data followed by AMF3-data until there is an empty string property name. If there is a class-def reference there are no property names and the number of values is equal to the number of properties in the class-def. */
    public static final byte TYPE_OBJECT_VALUE = 0x02;

	/** Proxy object. */
    public static final byte TYPE_OBJECT_PROXY = 0x03;

}
