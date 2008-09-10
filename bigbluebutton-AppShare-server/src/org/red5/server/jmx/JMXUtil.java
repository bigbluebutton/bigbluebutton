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
 
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanConstructorInfo;
import javax.management.MBeanInfo;
import javax.management.MBeanNotificationInfo;
import javax.management.MBeanOperationInfo;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Helper methods for working with ObjectName or MBean instances.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class JMXUtil {

	/** The log. */
	private static Logger log = LoggerFactory.getLogger(JMXUtil.class);

	/**
	 * Prints the m bean info.
	 * 
	 * @param objectName the object name
	 * @param className the class name
	 */
	public static void printMBeanInfo(ObjectName objectName, String className) {
		log.info("Retrieve the management information for the " + className);
		log.info("MBean using the getMBeanInfo() method of the MBeanServer");
		MBeanServer mbs = JMXFactory.getMBeanServer();
		MBeanInfo info = null;
		try {
			info = mbs.getMBeanInfo(objectName);
		} catch (Exception e) {
			log.error("Could not get MBeanInfo object for " + className
					+ " !!!", e);
			return;
		}
		log.info("CLASSNAME: \t" + info.getClassName());
		log.info("DESCRIPTION: \t" + info.getDescription());
		log.info("ATTRIBUTES");
		MBeanAttributeInfo[] attrInfo = info.getAttributes();
		if (attrInfo.length > 0) {
			for (int i = 0; i < attrInfo.length; i++) {
				log.info(" ** NAME: \t" + attrInfo[i].getName());
				log.info("    DESCR: \t" + attrInfo[i].getDescription());
				log.info("    TYPE: \t" + attrInfo[i].getType() + "\tREAD: "
						+ attrInfo[i].isReadable() + "\tWRITE: "
						+ attrInfo[i].isWritable());
			}
		} else
			log.info(" ** No attributes **");
		log.info("CONSTRUCTORS");
		MBeanConstructorInfo[] constrInfo = info.getConstructors();
		for (int i = 0; i < constrInfo.length; i++) {
			log.info(" ** NAME: \t" + constrInfo[i].getName());
			log.info("    DESCR: \t" + constrInfo[i].getDescription());
			log.info("    PARAM: \t" + constrInfo[i].getSignature().length
					+ " parameter(s)");
		}
		log.info("OPERATIONS");
		MBeanOperationInfo[] opInfo = info.getOperations();
		if (opInfo.length > 0) {
			for (int i = 0; i < opInfo.length; i++) {
				log.info(" ** NAME: \t" + opInfo[i].getName());
				log.info("    DESCR: \t" + opInfo[i].getDescription());
				log.info("    PARAM: \t" + opInfo[i].getSignature().length
						+ " parameter(s)");
			}
		} else
			log.info(" ** No operations ** ");
		log.info("NOTIFICATIONS");
		MBeanNotificationInfo[] notifInfo = info.getNotifications();
		if (notifInfo.length > 0) {
			for (int i = 0; i < notifInfo.length; i++) {
				log.info(" ** NAME: \t" + notifInfo[i].getName());
				log.info("    DESCR: \t" + notifInfo[i].getDescription());
				String notifTypes[] = notifInfo[i].getNotifTypes();
				for (int j = 0; j < notifTypes.length; j++) {
					log.info("    TYPE: \t" + notifTypes[j]);
				}
			}
		} else {
			log.info(" ** No notifications **");
		}
	}

}