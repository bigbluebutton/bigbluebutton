package org.red5.server.jmx;

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

import java.lang.management.ManagementFactory;

import javax.management.MBeanServer;
import javax.management.MBeanServerFactory;
import javax.management.ObjectName;
import javax.management.StandardMBean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Provides access to the MBeanServer as well as registration
 * and creation of new MBean instances. For most classes the creation
 * and registration is performed using StandardMBean wrappers.
 * <br />
 * References:
 * http://www.onjava.com/pub/a/onjava/2004/09/29/tigerjmx.html?page=1
 * http://java.sun.com/developer/JDCTechTips/2005/tt0315.html#2
 * <br />
 * Examples:
 * http://java.sun.com/javase/6/docs/technotes/guides/jmx/examples.html
 * <br />
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class JMXFactory {

	/** The domain. */
	private static String domain = "org.red5.server";

	/** The log. */
	private static Logger log = LoggerFactory.getLogger(JMXFactory.class);

	/** The mbs. */
	private static MBeanServer mbs;

	static {
		// try the first mbean server before grabbing platform, this should
		// make things easier when using jboss or tomcats built in jmx.
		try {
			mbs = (MBeanServer) MBeanServerFactory.findMBeanServer(null).get(0);
		} catch (Exception e) {
			// grab a reference to the "platform" MBeanServer
			mbs = ManagementFactory.getPlatformMBeanServer();
		}
	}

	/**
	 * Creates a new JMX object.
	 * 
	 * @param className the class name
	 * @param attributes the attributes
	 * 
	 * @return the object name
	 */
	public static ObjectName createMBean(String className, String attributes) {
		log.info("Create the {} MBean within the MBeanServer", className);
		ObjectName objectName = null;
		try {
			StringBuilder objectNameStr = new StringBuilder(domain);
			objectNameStr.append(":type=");
			objectNameStr.append(className
					.substring(className.lastIndexOf(".") + 1));
			objectNameStr.append(",");
			objectNameStr.append(attributes);
			log.info("ObjectName = {}", objectNameStr);
			objectName = new ObjectName(objectNameStr.toString());
			if (!mbs.isRegistered(objectName)) {
				mbs.createMBean(className, objectName);
			} else {
				log.debug("MBean has already been created: {}", objectName);
			}
		} catch (Exception e) {
			log.error("Could not create the {} MBean. {}", className, e);
		}
		return objectName;
	}

	/**
	 * Creates a new JMX object.
	 * 
	 * @param strings the strings
	 * 
	 * @return the object name
	 */
	public static ObjectName createObjectName(String... strings) {
		ObjectName objName = null;
		StringBuilder sb = new StringBuilder(domain);
		sb.append(':');
		for (int i = 0, j = 1; i < strings.length; i += 2, j += 2) {
			//log.debug("------------" + strings[i] + " " + strings[j]);
			//sb.append(ObjectName.quote(strings[i]));
			sb.append(strings[i]);
			sb.append('=');
			//sb.append(ObjectName.quote(strings[j]));
			sb.append(strings[j]);
			sb.append(',');
		}
		sb.deleteCharAt(sb.length() - 1);
		try {
			log.info("Object name: {}", sb.toString());
			objName = new ObjectName(sb.toString());
		} catch (Exception e) {
			log.warn("Exception creating object name", e);
		}
		return objName;
	}

	/**
	 * Creates a new JMX object.
	 * 
	 * @param className the class name
	 * @param objectNameStr the object name str
	 * 
	 * @return the object name
	 */
	public static ObjectName createSimpleMBean(String className,
			String objectNameStr) {
		log.info("Create the {} MBean within the MBeanServer", className);
		log.info("ObjectName = {}", objectNameStr);
		try {
			ObjectName objectName = ObjectName.getInstance(objectNameStr);
			if (!mbs.isRegistered(objectName)) {
				mbs.createMBean(className, objectName);
			} else {
				log.debug("MBean has already been created: {}", objectName);
			}
			return objectName;
		} catch (Exception e) {
			log.error("Could not create the {} MBean. {}", className, e);
		}
		return null;
	}

	/**
	 * Gets the default domain.
	 * 
	 * @return the default domain
	 */
	public static String getDefaultDomain() {
		return domain;
	}

	/**
	 * Gets the m bean server.
	 * 
	 * @return the m bean server
	 */
	public static MBeanServer getMBeanServer() {
		return mbs;
	}

	/**
	 * Register new m bean.
	 * 
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * 
	 * @return true, if successful
	 */
	public static boolean registerNewMBean(String className,
			Class interfaceClass) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: " + cName);
			mbs.registerMBean(new StandardMBean(Class.forName(className)
					.newInstance(), interfaceClass), new ObjectName(domain
					+ ":type=" + cName));
			status = true;
		} catch (Exception e) {
			log.error("Could not register the " + className + " MBean", e);
		}
		return status;
	}

	/**
	 * Register new m bean.
	 * 
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public static boolean registerNewMBean(String className,
			Class interfaceClass, ObjectName name) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: " + cName);
			mbs.registerMBean(new StandardMBean(Class.forName(className)
					.newInstance(), interfaceClass), name);
			status = true;
		} catch (Exception e) {
			log.error("Could not register the " + className + " MBean", e);
		}
		return status;
	}

	/**
	 * Register new m bean.
	 * 
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public static boolean registerNewMBean(String className,
			Class interfaceClass, String name) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: " + cName);
			mbs.registerMBean(new StandardMBean(Class.forName(className)
					.newInstance(), interfaceClass), new ObjectName(domain
					+ ":type=" + cName + ",name=" + name));
			status = true;
		} catch (Exception e) {
			log.error("Could not register the " + className + " MBean", e);
		}
		return status;
	}

	/**
	 * Gets the domain.
	 * 
	 * @return the domain
	 */
	public String getDomain() {
		return domain;
	}

	/**
	 * Sets the domain.
	 * 
	 * @param domain the new domain
	 */
	public void setDomain(String domain) {
		JMXFactory.domain = domain;
	}

}