package org.red5.io.mock;

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

import java.util.Iterator;
import java.util.List;

import org.red5.io.object.DataTypes;

// TODO: Auto-generated Javadoc
/**
 * The Class Mock.
 */
public class Mock {

	/** The Constant TYPE_END_OF_OBJECT. */
	public static final byte TYPE_END_OF_OBJECT = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x01);

	/** The Constant TYPE_END_OF_ARRAY. */
	public static final byte TYPE_END_OF_ARRAY = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x02);

	/** The Constant TYPE_ELEMENT_SEPARATOR. */
	public static final byte TYPE_ELEMENT_SEPARATOR = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x03);

	/** The Constant TYPE_PROPERTY_SEPARATOR. */
	public static final byte TYPE_PROPERTY_SEPARATOR = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x04);

	/** The Constant TYPE_ITEM_SEPARATOR. */
	public static final byte TYPE_ITEM_SEPARATOR = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x05);

	/** The Constant TYPE_END_OF_MAP. */
	public static final byte TYPE_END_OF_MAP = (byte) (DataTypes.CUSTOM_MOCK_MASK + 0x06);

	/**
	 * To string value.
	 * 
	 * @param dataType the data type
	 * 
	 * @return the string
	 */
	public static String toStringValue(byte dataType) {

		switch (dataType) {
			case TYPE_END_OF_OBJECT:
				return "End of Object";
			case TYPE_END_OF_ARRAY:
				return "End of Array";
			case TYPE_ELEMENT_SEPARATOR:
			case TYPE_ITEM_SEPARATOR:
				return ",";
			case TYPE_PROPERTY_SEPARATOR:
				return "::";
			default:
				return "MOCK[" + (dataType - DataTypes.CUSTOM_MOCK_MASK) + ']';
		}
	}

	/**
	 * List to string.
	 * 
	 * @param list the list
	 * 
	 * @return the string
	 */
	public static String listToString(List<Object> list) {
		StringBuffer sb = new StringBuffer();
		Iterator<Object> it = list.iterator();
		while (it.hasNext()) {
			Object val = it.next();
			if (val instanceof Byte) {
				byte type = ((Byte) val).byteValue();
				if (type < DataTypes.CUSTOM_MOCK_MASK) {
					sb.append(DataTypes.toStringValue(type));
				} else {
					sb.append(toStringValue(type));
				}
			} else {
				if (val != null) {
					sb.append(val.getClass().getName());
				}
				sb.append(" { ");
				sb.append(val == null ? null : val.toString());
				sb.append(" } ");
			}
			sb.append(" | ");
		}
		return sb.toString();
	}
}
