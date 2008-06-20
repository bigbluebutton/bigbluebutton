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


import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;

import org.apache.commons.collections.BeanMap;
import org.apache.commons.collections.map.LRUMap;
import org.apache.mina.common.ByteBuffer;
import org.red5.annotations.Anonymous;
import org.red5.annotations.DontSerialize;
import org.red5.io.amf3.ByteArray;
import org.red5.io.object.BaseOutput;
import org.red5.io.object.ICustomSerializable;
import org.red5.io.object.RecordSet;
import org.red5.io.object.Serializer;
import org.red5.io.utils.XMLUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * The Class Output.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class Output extends BaseOutput implements org.red5.io.object.Output {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(Output.class);

	/** Cache encoded strings. */
	protected static Map<String, byte[]> stringCache = (Map<String, byte[]>) new LRUMap(10000, true);

    /** Output buffer. */
    protected ByteBuffer buf;

    /**
     * Creates output with given byte buffer.
     * 
     * @param buf         Bute buffer
     */
    public Output(ByteBuffer buf) {
		super();
		this.buf = buf;
	}

	/** {@inheritDoc} */
    public boolean isCustom(Object custom) {
		// TODO Auto-generated method stub
		return false;
	}

    /**
     * Check write reference.
     * 
     * @param obj the obj
     * 
     * @return true, if successful
     */
    protected boolean checkWriteReference(Object obj) {
    	if (hasReference(obj)) {
    		writeReference(obj);
    		return true;
    	} else
    		return false;
    }

	/** {@inheritDoc} */
	public void writeArray(Collection<?> array, Serializer serializer) {
		if (checkWriteReference(array))
			return;

		storeReference(array);
		buf.put(AMF.TYPE_ARRAY);
		buf.putInt(array.size());
		for (Object item : array) {
			serializer.serialize(this, item);
		}
	}

	/** {@inheritDoc} */
	public void writeArray(Object[] array, Serializer serializer) {
		if (checkWriteReference(array))
			return;

		storeReference(array);
		buf.put(AMF.TYPE_ARRAY);
		buf.putInt(array.length);
		for (Object item : array) {
			serializer.serialize(this, item);
		}
	}

	/** {@inheritDoc} */
    public void writeArray(Object array, Serializer serializer) {
		if (checkWriteReference(array))
			return;

		storeReference(array);
		buf.put(AMF.TYPE_ARRAY);
		buf.putInt(Array.getLength(array));
		for (int i=0; i<Array.getLength(array); i++) {
			serializer.serialize(this, Array.get(array, i));
		}
    }

	/** {@inheritDoc} */
	public void writeMap(Map<Object, Object> map, Serializer serializer) {
		if (checkWriteReference(map))
			return;

		storeReference(map);
		buf.put(AMF.TYPE_MIXED_ARRAY);
		int maxInt=-1;
		for (int i=0; i<map.size(); i++) {
			try {
				if (!map.containsKey(i))
					break;
			} catch (ClassCastException err) {
				// Map has non-number keys.
				break;
			}

			maxInt = i;
		}
		buf.putInt(maxInt+1);
		for (Map.Entry<Object, Object> entry : map.entrySet()) {
			final String key = entry.getKey().toString();
			if ("length".equals(key))
				continue;

			putString(key);
			serializer.serialize(this, entry.getValue());
		}
		if (maxInt >= 0) {
			putString("length");
			serializer.serialize(this, maxInt+1);
		}
		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
	}

	/** {@inheritDoc} */
	public void writeMap(Collection<?> array, Serializer serializer) {
		if (checkWriteReference(array))
			return;

		storeReference(array);
		buf.put(AMF.TYPE_MIXED_ARRAY);
		buf.putInt(array.size()+1);
		int idx=0;
		for (Object item: array) {
			if (item != null) {
				putString(String.valueOf(idx++));
				serializer.serialize(this, item);
			} else {
				idx++;
			}
		}
		putString("length");
		serializer.serialize(this, array.size()+1);

		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
	}

	/** {@inheritDoc} */
    public void writeRecordSet(RecordSet recordset, Serializer serializer) {
		if (checkWriteReference(recordset))
			return;

		storeReference(recordset);
        // Write out start of object marker
		buf.put(AMF.TYPE_CLASS_OBJECT);
		putString("RecordSet");
        // Serialize
        Map<String, Object> info = recordset.serialize();
        // Write out serverInfo key
        putString("serverInfo");
        // Serialize
        serializer.serialize(this, info);
        // Write out end of object marker
		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
    }

	/** {@inheritDoc} */
    public boolean supportsDataType(byte type) {
		// TODO Auto-generated method stub
		return false;
	}

	/** {@inheritDoc} */
	public void writeBoolean(Boolean bol) {
		buf.put(AMF.TYPE_BOOLEAN);
		buf.put(bol ? AMF.VALUE_TRUE : AMF.VALUE_FALSE);
	}

	/** {@inheritDoc} */
    public void writeCustom(Object custom) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public void writeDate(Date date) {
		buf.put(AMF.TYPE_DATE);
		buf.putDouble(date.getTime());
		buf
				.putShort((short) (TimeZone.getDefault().getRawOffset() / 60 / 1000));
	}

	/** {@inheritDoc} */
	public void writeNull() {
		// System.err.println("Write null");
		buf.put(AMF.TYPE_NULL);
	}

	/** {@inheritDoc} */
	public void writeNumber(Number num) {
		buf.put(AMF.TYPE_NUMBER);
		buf.putDouble(num.doubleValue());
	}

	/** {@inheritDoc} */
    public void writeReference(Object obj) {
		if (log.isDebugEnabled()) {
			log.debug("Write reference");
		}
		buf.put(AMF.TYPE_REFERENCE);
		buf.putShort(getReferenceId(obj));
	}

	/** {@inheritDoc} */
    public void writeObject(Object object, Serializer serializer) {
		if (checkWriteReference(object))
			return;

		storeReference(object);
        // Create new map out of bean properties
        BeanMap beanMap = new BeanMap(object);
        // Set of bean attributes
        Set<BeanMap.Entry<?, ?>> set = beanMap.entrySet();
		if ((set.size() == 0) || (set.size() == 1 && beanMap.containsKey("class"))) {
			// BeanMap is empty or can only access "class" attribute, skip it
			writeArbitraryObject(object, serializer);
			return;
		}

        // Write out either start of object marker for class name or "empty" start of object marker
		Class<?> objectClass = object.getClass();
		if (!objectClass.isAnnotationPresent(Anonymous.class)) {
			buf.put(AMF.TYPE_CLASS_OBJECT);
			putString(buf, objectClass.getName());
		} else {
			buf.put(AMF.TYPE_OBJECT);
		}

        if (object instanceof ICustomSerializable) {
        	((ICustomSerializable) object).serialize(this, serializer);
    		buf.put((byte) 0x00);
    		buf.put((byte) 0x00);
    		buf.put(AMF.TYPE_END_OF_OBJECT);
    		return;
        }

        // Iterate thru entries and write out property names with separators
		for (BeanMap.Entry<?, ?> entry: set) {
			if (entry.getKey().toString().equals("class")) {
				continue;
			}

			String keyName = entry.getKey().toString();
			// Check if the Field corresponding to the getter/setter pair is transient
            if (dontSerializeField(objectClass, keyName)) continue;

			putString(buf, keyName);
			serializer.serialize(this, entry.getValue());
		}
        // Write out end of object mark
		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
	}

    /**
     * Dont serialize field.
     * 
     * @param objectClass the object class
     * @param keyName the key name
     * 
     * @return true, if successful
     */
    protected boolean dontSerializeField(Class<?> objectClass, String keyName) {
        for (Class<?> clazz = objectClass; !clazz.equals(Object.class); clazz = clazz.getSuperclass()) {
            try {
                Field field = clazz.getDeclaredField(keyName);
                boolean dontSerialize = field.isAnnotationPresent(DontSerialize.class);
                boolean isTransient = Modifier.isTransient(field.getModifiers());

                if (dontSerialize && log.isDebugEnabled()) log.debug("Skipping " + field.getName() + " because its marked with @DontSerialize");
                if (isTransient) log.warn("Using \"transient\" to declare fields not to be serialized is deprecated and will be removed in Red5 0.8, use \"@DontSerialize\" instead.");

                return dontSerialize || isTransient;
            } catch (NoSuchFieldException nfe) {
                // Ignore this exception and use the default behaviour
                log.debug("writeObject caught NoSuchFieldException");
            }
        }

        return false;
    }

    /** {@inheritDoc} */
    public void writeObject(Map<Object, Object> map, Serializer serializer) {
		if (checkWriteReference(map))
			return;

		storeReference(map);
		buf.put(AMF.TYPE_OBJECT);
		boolean isBeanMap = (map instanceof BeanMap);
		for (Map.Entry<Object, Object> entry : map.entrySet()) {
			if (isBeanMap && "class".equals(entry.getKey()))
				continue;

			putString(entry.getKey().toString());
			serializer.serialize(this, entry.getValue());
		}
		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
    }

	/**
	 * Writes an arbitrary object to the output.
	 * 
	 * @param serializer    Output writer
	 * @param object        Object to write
	 */
	protected void writeArbitraryObject(Object object, Serializer serializer) {
		if (log.isDebugEnabled()) {
			log.debug("writeObject");
		}
        // If we need to serialize class information...
		Class<?> objectClass = object.getClass();
		if (!objectClass.isAnnotationPresent(Anonymous.class)) {
            // Write out start object marker for class name
			buf.put(AMF.TYPE_CLASS_OBJECT);
			putString(buf, objectClass.getName());
		} else {
            // Write out start object marker without class name
			buf.put(AMF.TYPE_OBJECT);
		}

		// Get public field values
		Map<String, Object> values = new HashMap<String, Object>();
        // Iterate thru fields of an object to build "name-value" map from it
        for (Field field : objectClass.getFields()) {
			if (field.isAnnotationPresent(DontSerialize.class)) {
				if (log.isDebugEnabled()) {
					log.debug("Skipping " + field.getName() + " because its marked with @DontSerialize");
				}
				continue;
			} else {
				int modifiers = field.getModifiers();
				if (Modifier.isTransient(modifiers)) {
					log.warn("Using \"transient\" to declare fields not to be serialized is " +
						"deprecated and will be removed in Red5 0.8, use \"@DontSerialize\" instead.");
					continue;
				}
			}

			Object value;
			try {
                // Get field value
                value = field.get(object);
			} catch (IllegalAccessException err) {
                // Swallow on private and protected properties access exception
                continue;
			}
            // Put field to the map of "name-value" pairs
            values.put(field.getName(), value);
		}

		// Output public values
		Iterator<Map.Entry<String, Object>> it = values.entrySet().iterator();
        // Iterate thru map and write out properties with separators
        while (it.hasNext()) {
			Map.Entry<String, Object> entry = it.next();
            // Write out prop name
			putString(buf, entry.getKey());
            // Write out
            serializer.serialize(this, entry.getValue());
		}
        // Write out end of object marker
		buf.put((byte) 0x00);
		buf.put((byte) 0x00);
		buf.put(AMF.TYPE_END_OF_OBJECT);
	}


	/** {@inheritDoc} */
    public void writeString(String string) {
    	final byte[] encoded = encodeString(string);
		final int len = encoded.length;
		if (len < AMF.LONG_STRING_LENGTH) {
			buf.put(AMF.TYPE_STRING);
			buf.putShort((short) len);
		} else {
			buf.put(AMF.TYPE_LONG_STRING);
			buf.putInt(len);
		}
		buf.put(encoded);
	}

    /** {@inheritDoc} */
    public void writeByteArray(ByteArray array) {
		throw new RuntimeException("ByteArray objects not supported with AMF0");
    }

    /**
     * Encode string.
     * 
     * @param string the string
     * 
     * @return encoded string
     */
    protected static byte[] encodeString(String string) {
    	byte[] encoded;
    	synchronized (stringCache) {
    		encoded = stringCache.get(string);
    	}
    	if (encoded == null) {
    		java.nio.ByteBuffer buf = AMF.CHARSET.encode(string);
    		encoded = new byte[buf.limit()];
    		buf.get(encoded);
    		synchronized (stringCache) {
    			stringCache.put(string, encoded);
    		}
    	}
    	return encoded;
    }

    /**
     * Write out string.
     * 
     * @param buf         Byte buffer to write to
     * @param string      String to write
     */
    public static void putString(ByteBuffer buf, String string) {
    	final byte[] encoded = encodeString(string);
		buf.putShort((short) encoded.length);
		buf.put(encoded);
	}

    /** {@inheritDoc} */
	public void putString(String string) {
		putString(buf, string);
	}

    /** {@inheritDoc} */
	public void writeXML(Document xml) {
		buf.put(AMF.TYPE_XML);
		putString(XMLUtils.docToString(xml));
	}

    /**
     * Return buffer of this Output object.
     * 
     * @return        Byte buffer of this Output object
     */
    public ByteBuffer buf() {
		return this.buf;
	}

    /**
     * Reset.
     */
    public void reset() {
    	clearReferences();
    }

}
