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

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.mina.common.ByteBuffer;
import org.red5.io.amf.AMF;
import org.red5.io.object.DataTypes;
import org.red5.io.object.Deserializer;
import org.red5.io.utils.ObjectMap;
import org.red5.io.utils.XMLUtils;
import org.red5.server.service.ConversionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * Input for Red5 data (AMF3) types.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class Input extends org.red5.io.amf.Input implements org.red5.io.object.Input {

	/**
	 * Holds informations about already deserialized classes.
	 */
	protected class ClassReference {
		
		/** Name of the deserialized class. */
		protected String className;
		
		/** Type of the class. */
		protected int type;
		
		/** Names of the attributes of the class. */
		protected List<String> attributeNames;
		
		/**
		 * Create new informations about a class.
		 * 
		 * @param className the class name
		 * @param type the type
		 * @param attributeNames the attribute names
		 */
		public ClassReference(String className, int type, List<String> attributeNames) {
			this.className = className;
			this.type = type;
			this.attributeNames = attributeNames;
		}
	}
	
	/**
	 * Dummy class that is stored as reference for objects currently
	 * being deserialized that reference themselves.
	 */
	protected class PendingObject {
		
		/**
		 * The Class PendingProperty.
		 */
		class PendingProperty {
			
			/** The obj. */
			Object obj;
			
			/** The klass. */
			Class<?> klass;
			
			/** The name. */
			String name;
			
			/**
			 * Instantiates a new pending property.
			 * 
			 * @param obj the obj
			 * @param klass the klass
			 * @param name the name
			 */
			PendingProperty(Object obj, Class<?> klass, String name) {
				this.obj = obj;
				this.klass = klass;
				this.name = name;
			}
		}
		
		/** The properties. */
		private List<PendingProperty> properties;
		
		/**
		 * Adds the pending property.
		 * 
		 * @param obj the obj
		 * @param klass the klass
		 * @param name the name
		 */
		public void addPendingProperty(Object obj, Class<?> klass, String name) {
			if (properties == null) {
				properties = new ArrayList<PendingProperty>();
			}
			properties.add(new PendingProperty(obj, klass, name));
		}
		
		/**
		 * Resolve properties.
		 * 
		 * @param result the result
		 */
		public void resolveProperties(Object result) {
			if (properties == null)
				// No pending properties
				return;
			
			for (PendingProperty prop: properties) {
				try {
					try {
						prop.klass.getField(prop.name).set(prop.obj, result);
					} catch (Exception e) {
						BeanUtils.setProperty(prop.obj, prop.name, result);
					}
				} catch (Exception e) {
					log.error("Error mapping property: {} ({})", prop.name, result);
				}
			}
			properties.clear();
		}
	}
	
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(Input.class);
	
	/** Set to a value above <tt>0</tt> to enforce AMF3 decoding mode. */
	private int amf3_mode;
	
	/** List of string values found in the input stream. */
	private List<String> stringReferences;
	
	/** Informations about already deserialized classes. */
	private List<ClassReference> classReferences;

	/**
	 * Creates Input object for AMF3 from byte buffer.
	 * 
	 * @param buf        Byte buffer
	 */
	public Input(ByteBuffer buf) {
		super(buf);
		amf3_mode = 0;
		stringReferences = new ArrayList<String>();
		classReferences = new ArrayList<ClassReference>();
	}

	/**
	 * Provide access to raw data.
	 * 
	 * @return ByteBuffer
	 */
	protected ByteBuffer getBuffer() {
		return buf;
	}
	
	/**
	 * Reads the data type.
	 * 
	 * @return byte      Data type
	 */
	@Override
	public byte readDataType() {

		if (buf == null) {
			log.error("Why is buf null?");
		}

		currentDataType = buf.get();
		byte coreType;

		if (currentDataType == AMF.TYPE_AMF3_OBJECT) {
			currentDataType = buf.get();
		} else if (amf3_mode == 0) {
			// AMF0 object
			return readDataType(currentDataType);
		}

		switch (currentDataType) {
			case AMF3.TYPE_NULL:
				coreType = DataTypes.CORE_NULL;
				break;

			case AMF3.TYPE_INTEGER:
			case AMF3.TYPE_NUMBER:
				coreType = DataTypes.CORE_NUMBER;
				break;

			case AMF3.TYPE_BOOLEAN_TRUE:
			case AMF3.TYPE_BOOLEAN_FALSE:
				coreType = DataTypes.CORE_BOOLEAN;
				break;

			case AMF3.TYPE_STRING:
				coreType = DataTypes.CORE_STRING;
				break;
			// TODO check XML_SPECIAL
			case AMF3.TYPE_XML:
			case AMF3.TYPE_XML_SPECIAL:
                coreType = DataTypes.CORE_XML;
				break;
			case AMF3.TYPE_OBJECT:
				coreType = DataTypes.CORE_OBJECT;
				break;

			case AMF3.TYPE_ARRAY:
				// should we map this to list or array?
				coreType = DataTypes.CORE_ARRAY;
				break;

			case AMF3.TYPE_DATE:
				coreType = DataTypes.CORE_DATE;
				break;

			case AMF3.TYPE_BYTEARRAY:
				coreType = DataTypes.CORE_BYTEARRAY;
				break;
				
			default:
				log.info("Unknown datatype: {}", currentDataType);
				// End of object, and anything else lets just skip
				coreType = DataTypes.CORE_SKIP;
				break;
		}

		return coreType;
	}

	// Basic

	/**
	 * Reads a null (value).
	 * 
	 * @return Object    null
	 */
	@Override
	public Object readNull() {
		return null;
	}

	/**
	 * Reads a boolean.
	 * 
	 * @return boolean     Boolean value
	 */
	@Override
	public Boolean readBoolean() {
		return (currentDataType == AMF3.TYPE_BOOLEAN_TRUE) ? Boolean.TRUE
				: Boolean.FALSE;
	}

	/**
	 * Reads a Number.
	 * 
	 * @return Number      Number
	 */
	@Override
	public Number readNumber() {
		if (currentDataType == AMF3.TYPE_NUMBER) {
			return buf.getDouble();
		} else {
			// we are decoding an int
			return readAMF3Integer();
		}
	}

	/**
	 * Reads a string.
	 * 
	 * @return String       String
	 */
	@Override
	public String readString() {
		int len = readAMF3Integer();
		if (len == 1)
			// Empty string
			return "";
		
		if ((len & 1) == 0) {
			// Reference
			return stringReferences.get(len >> 1);
		}
		len >>= 1;
		int limit = buf.limit();
		final java.nio.ByteBuffer strBuf = buf.buf();
		strBuf.limit(strBuf.position() + len);
		final String string = AMF3.CHARSET.decode(strBuf).toString();
		buf.limit(limit); // Reset the limit
		stringReferences.add(string);
		return string;
	}

	/* (non-Javadoc)
	 * @see org.red5.io.amf.Input#getString()
	 */
	public String getString() {
		return readString();
	}
	
	/**
	 * Returns a date.
	 * 
	 * @return Date        Date object
	 */
	@Override
	public Date readDate() {
		int ref = readAMF3Integer();
		if ((ref & 1) == 0) {
			// Reference to previously found date
			return (Date) getReference(ref >> 1);
		}
		
		long ms = (long) buf.getDouble();
		Date date = new Date(ms);
		storeReference(date);
		return date;
	}

	// Array

	/**
	 * Returns an array.
	 * 
	 * @param deserializer the deserializer
	 * 
	 * @return int        Length of array
	 */
    public Object readArray(Deserializer deserializer) {
		int count = readAMF3Integer();
		if ((count & 1) == 0) {
			// Reference
			return getReference(count >> 1);
		}
		
		count = (count >> 1);
		String key = readString();
		amf3_mode += 1;
		Object result;
		if (key.equals("")) {
			// normal array
			List<Object> resultList = new ArrayList<Object>(count);
			storeReference(resultList);
			for (int i=0; i<count; i++) {
				final Object value = deserializer.deserialize(this, Object.class);
				resultList.add(value);
			}
			result = resultList;
		} else {
			// associative array
			Map<Object, Object> resultMap = new HashMap<Object, Object>();
			storeReference(resultMap);
			while (!key.equals("")) {
				final Object value = deserializer.deserialize(this, Object.class);
				resultMap.put(key, value);
				key = readString();
			}
			for (int i=0; i<count; i++) {
				final Object value = deserializer.deserialize(this, Object.class);
				resultMap.put(i, value);
			}
			result = resultMap;
		}
		amf3_mode -= 1;
		return result;			
	}

    /* (non-Javadoc)
     * @see org.red5.io.amf.Input#readMap(org.red5.io.object.Deserializer)
     */
    public Object readMap(Deserializer deserializer) {
    	throw new RuntimeException("AMF3 doesn't support maps.");
    }
    
	// Object

    /* (non-Javadoc)
	 * @see org.red5.io.amf.Input#readObject(org.red5.io.object.Deserializer)
	 */
	@SuppressWarnings("unchecked")
	public Object readObject(Deserializer deserializer) {
		int type = readAMF3Integer();
		if ((type & 1) == 0) {
			// Reference
			return getReference(type >> 1);
		}
		
		type >>= 1;
		List<String> attributes = null;
		String className;
		Object result = null;
		boolean inlineClass = (type & 1) == 1;
		if (!inlineClass) {
			ClassReference info = classReferences.get(type >> 1);
			className = info.className;
			attributes = info.attributeNames;
			type = info.type;
			if (attributes != null) {
				type |= attributes.size() << 2;
			}
		} else {
			type >>= 1;
			className = readString();
		}
		amf3_mode += 1;
        Object instance  = newInstance(className);
        Map<String, Object> properties = null;
        PendingObject pending = new PendingObject();
		int tempRefId = storeReference(pending);
		switch (type & 0x03) {
		case AMF3.TYPE_OBJECT_PROPERTY:
			// Load object properties into map
			int count = type >> 2;
			properties = new ObjectMap<String, Object>();
			if (attributes == null) {
				attributes = new ArrayList<String>(count);
				for (int i=0; i<count; i++) {
					attributes.add(readString());					
				}
				classReferences.add(new ClassReference(className, AMF3.TYPE_OBJECT_PROPERTY, attributes));
			}
            for (int i=0; i<count; i++) {
                String name = attributes.get(i);
                properties.put(name, deserializer.deserialize(this, getPropertyType(instance, name)));
			}
			break;
		case AMF3.TYPE_OBJECT_EXTERNALIZABLE:
			// Use custom class to deserialize the object
			if ("".equals(className))
				throw new RuntimeException("need a classname to load an externalizable object");
			
			result = newInstance(className);
			if (result == null)
				throw new RuntimeException("could not instantiate class");
			
			if (!(result instanceof IExternalizable))
				throw new RuntimeException("the class must implement the IExternalizable interface");
			
			classReferences.add(new ClassReference(className, AMF3.TYPE_OBJECT_EXTERNALIZABLE, null));
			storeReference(tempRefId, result);
			((IExternalizable) result).readExternal(new DataInput(this, deserializer));
			break;
		case AMF3.TYPE_OBJECT_VALUE:
			// Load object properties into map
			classReferences.add(new ClassReference(className, AMF3.TYPE_OBJECT_VALUE, null));
			properties = new ObjectMap<String, Object>();
			attributes = new LinkedList<String>();
			String key = readString();
			while (!"".equals(key)) {
				attributes.add(key);
				Object value = deserializer.deserialize(this, getPropertyType(instance, key));
				properties.put(key, value);
				key = readString();
			}
			break;
		default:
		case AMF3.TYPE_OBJECT_PROXY:
			if ("".equals(className))
				throw new RuntimeException("need a classname to load an externalizable object");
			
			result = newInstance(className);
			if (result == null)
				throw new RuntimeException("could not instantiate class");
			
			if (!(result instanceof IExternalizable))
				throw new RuntimeException("the class must implement the IExternalizable interface");
			
			classReferences.add(new ClassReference(className, AMF3.TYPE_OBJECT_PROXY, null));
			storeReference(tempRefId, result);
			((IExternalizable) result).readExternal(new DataInput(this, deserializer));
		}
		amf3_mode -= 1;
		
		if (result == null) {
			// Create result object based on classname
			if ("".equals(className)) {
				// "anonymous" object, load as Map
				// Resolve circular references
				for (Map.Entry<String, Object> entry: properties.entrySet()) {
					if (entry.getValue() == pending) {
						entry.setValue(properties);
					}
				}
				
				storeReference(tempRefId, properties);
				result = properties;
			} else if ("RecordSet".equals(className)) {
				// TODO: how are RecordSet objects encoded?
				throw new RuntimeException("Objects of type RecordSet not supported yet.");
			} else if ("RecordSetPage".equals(className)) {
				// TODO: how are RecordSetPage objects encoded?
				throw new RuntimeException("Objects of type RecordSetPage not supported yet.");
			} else {
				// Apply properties to object
				result = newInstance(className);
				if (result != null) {
					storeReference(tempRefId, result);
					Class resultClass = result.getClass();
					pending.resolveProperties(result);
					for (Map.Entry<String, Object> entry: properties.entrySet()) {
						// Resolve circular references
						final String key = entry.getKey();
						Object value = entry.getValue();
						if (value == pending) {
							value = result;
						}
						
						if (value instanceof PendingObject) {
							// Deferr setting of value until real object is created
							((PendingObject) value).addPendingProperty(result, resultClass, key);
							continue;
						}
						
						try {
							try {
								final Field field = resultClass.getField(key);
								final Class fieldType = field.getType();
								if (!fieldType.isAssignableFrom(value.getClass())) {
									value = ConversionUtils.convert(value, fieldType);
								}
								field.set(result, value);
							} catch (Exception e) {
								BeanUtils.setProperty(result, key, value);
							}
						} catch (Exception e) {
							log.error("Error mapping property: {} ({})", key, value);
						}
					}
				} // else fall through
			}
		}
		return result;
    }

    /* (non-Javadoc)
     * @see org.red5.io.amf.Input#readByteArray()
     */
    public ByteArray readByteArray() {
		int type = readAMF3Integer();
		if ((type & 1) == 0) {
			// Reference
			return (ByteArray) getReference(type >> 1);
		}
		
		type >>= 1;
		ByteArray result = new ByteArray(buf, type);
		storeReference(result);
		return result;
	}

	// Others

	/**
	 * Reads Custom.
	 * 
	 * @return Object     Custom type object
	 */
	@Override
	public Object readCustom() {
		// Return null for now
		return null;
	}

	/** {@inheritDoc} */
	public Object readReference() {
		throw new RuntimeException("AMF3 doesn't support direct references.");
	}

	/**
	 * Resets map.
	 */
	@Override
	public void reset() {
		super.reset();
		stringReferences.clear();
	}

	/**
	 * Parser of AMF3 "compressed" integer data type.
	 * 
	 * @return a converted integer value
	 * 
	 * @see <a href="http://osflash.org/amf3/parsing_integers">parsing AMF3
	 * integers (external)</a>
	 */
	private int readAMF3Integer() {
		int n = 0;
		int b = buf.get();
		int result = 0;

		while ((b & 0x80) != 0 && n < 3) {
			result <<= 7;
			result |= (b & 0x7f);
			b = buf.get();
			n++;
		}
		if (n < 3) {
			result <<= 7;
			result |= b;
		} else {
			/* Use all 8 bits from the 4th byte */
			result <<= 8;
			result |= b;

			/* Check if the integer should be negative */
			if ((result & 0x10000000) != 0) {
				/* and extend the sign bit */
				result |= 0xe0000000;
			}
		}

		return result;
	}

	/** {@inheritDoc} */
	protected Object newInstance(String className) {
		log.debug("newInstance {}", className);
		if (className.startsWith("flex.")) {
			// Use Red5 compatibility class instead
			className = "org.red5.compatibility." + className;
		}
		
		return super.newInstance(className);
	}

	/** {@inheritDoc} */
	public Document readXML() {
		int len = readAMF3Integer();
		if (len == 1)
			// Empty string, should not happen
			return null;
		
		if ((len & 1) == 0) {
			// Reference
			return (Document) getReference(len >> 1);
		}
		len >>= 1;
		int limit = buf.limit();
		final java.nio.ByteBuffer strBuf = buf.buf();
		strBuf.limit(strBuf.position() + len);
		final String xmlString = AMF3.CHARSET.decode(strBuf).toString();
		buf.limit(limit); // Reset the limit
		Document doc = null;
		try {
			doc = XMLUtils.stringToDoc(xmlString);
		} catch (IOException ioex) {
			log.error("IOException converting xml to dom", ioex);
		}
		storeReference(doc);
		return doc;
	}

}
