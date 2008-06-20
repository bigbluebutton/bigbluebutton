package org.red5.io.amf;

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
 * These are the core AMF data types supported by Red5.
 * 
 * For detailed specification please see the link below.
 * 
 * @see <a href="http://osflash.org/amf/astypes">AMF specification (external)</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class AMF {

    /** UTF-8 is used. */
    public static final Charset CHARSET = Charset.forName("UTF-8");

    /** Max string lenght constant. */
    public static final int LONG_STRING_LENGTH = 65535;

    /** Number marker constant. */
    public static final byte TYPE_NUMBER = 0x00;

    /** Boolean value marker constant. */
    public static final byte TYPE_BOOLEAN = 0x01;

    /** String marker constant. */
    public static final byte TYPE_STRING = 0x02;

    /** Object marker constant. */
    public static final byte TYPE_OBJECT = 0x03;

    /** MovieClip marker constant. */
    public static final byte TYPE_MOVIECLIP = 0x04;

    /** Null marker constant. */
    public static final byte TYPE_NULL = 0x05;

    /** Undefined marker constant. */
    public static final byte TYPE_UNDEFINED = 0x06;

    /** Object reference marker constant. */
    public static final byte TYPE_REFERENCE = 0x07;

    /** Mixed array marker constant. */
    public static final byte TYPE_MIXED_ARRAY = 0x08;

    /** End of object marker constant. */
    public static final byte TYPE_END_OF_OBJECT = 0x09;

    /** Array marker constant. */
    public static final byte TYPE_ARRAY = 0x0A;

    /** Date marker constant. */
    public static final byte TYPE_DATE = 0x0B;

    /** Long string marker constant. */
    public static final byte TYPE_LONG_STRING = 0x0C;

    /** Unsupported type marker constant. */
    public static final byte TYPE_UNSUPPORTED = 0x0D;

    /** Recordset marker constant. */
    public static final byte TYPE_RECORDSET = 0x0E;

    /** XML marker constant. */
    public static final byte TYPE_XML = 0x0F;

    /** Class marker constant. */
    public static final byte TYPE_CLASS_OBJECT = 0x10;

    /** Object marker constant (for AMF3). */
    public static final byte TYPE_AMF3_OBJECT = 0x11;

    /** true marker constant. */
    public static final byte VALUE_TRUE = 0x01;

    /** false marker constant. */
    public static final byte VALUE_FALSE = 0x00;

}
