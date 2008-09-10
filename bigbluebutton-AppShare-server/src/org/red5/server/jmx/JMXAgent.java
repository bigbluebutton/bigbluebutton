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

import java.io.File;
import java.io.IOException;
import java.rmi.ConnectException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.HashMap;
import java.util.Set;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.Notification;
import javax.management.NotificationListener;
import javax.management.ObjectName;
import javax.management.StandardMBean;
import javax.management.remote.JMXConnectorServer;
import javax.management.remote.JMXConnectorServerFactory;
import javax.management.remote.JMXServiceURL;
import javax.management.remote.rmi.RMIConnectorServer;
import javax.rmi.ssl.SslRMIClientSocketFactory;
import javax.rmi.ssl.SslRMIServerSocketFactory;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.jdmk.comm.HtmlAdaptorServer;

// TODO: Auto-generated Javadoc
/**
 * Provides the connection adapters as well as registration and
 * unregistration of MBeans.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class JMXAgent implements NotificationListener {

	/** The cs. */
	private static JMXConnectorServer cs;

	/** The enable html adapter. */
	private static boolean enableHtmlAdapter;

	/** The enable rmi adapter. */
	private static boolean enableRmiAdapter;

	/** The start registry. */
	private static boolean startRegistry;

	/** The enable ssl. */
	private static boolean enableSsl;

	/** The enable mina monitor. */
	private static boolean enableMinaMonitor;

	/** The html. */
	private static HtmlAdaptorServer html;

	/** The html adapter port. */
	private static String htmlAdapterPort = "8082";

	/** The log. */
	private static Logger log = LoggerFactory.getLogger(JMXAgent.class);

	/** The mbs. */
	private static MBeanServer mbs;

	/** The rmi adapter port. */
	private static String rmiAdapterPort = "9999";

	/** The remote password properties. */
	private static String remotePasswordProperties;

	/** The remote access properties. */
	private static String remoteAccessProperties;

	static {
		//in the war version the jmxfactory is not created before
		//registration starts ?? so we check for it here and init
		//if needed
		if (null == mbs) {
			mbs = JMXFactory.getMBeanServer();
		}
	}

	/**
	 * Register m bean.
	 * 
	 * @param instance the instance
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * 
	 * @return true, if successful
	 */
	public static boolean registerMBean(Object instance, String className,
			Class interfaceClass) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: {}", cName);
			mbs.registerMBean(new StandardMBean(instance, interfaceClass),
					new ObjectName(JMXFactory.getDefaultDomain() + ":type="
							+ cName));
			status = true;
		} catch (InstanceAlreadyExistsException iaee) {
			log.debug("Already registered: {}", className);
		} catch (Exception e) {
			log.error("Could not register the {} MBean. {}", className, e);
		}
		return status;
	}

	/**
	 * Register m bean.
	 * 
	 * @param instance the instance
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public static boolean registerMBean(Object instance, String className,
			Class interfaceClass, ObjectName name) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: {}", cName);
			mbs
					.registerMBean(new StandardMBean(instance, interfaceClass),
							name);
			status = true;
		} catch (InstanceAlreadyExistsException iaee) {
			log.debug("Already registered: {}", className);
		} catch (Exception e) {
			log.error("Could not register the {} MBean. {}", className, e);
		}
		return status;
	}

	/**
	 * Register m bean.
	 * 
	 * @param instance the instance
	 * @param className the class name
	 * @param interfaceClass the interface class
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public static boolean registerMBean(Object instance, String className,
			Class interfaceClass, String name) {
		boolean status = false;
		try {
			String cName = className;
			if (cName.indexOf('.') != -1) {
				cName = cName.substring(cName.lastIndexOf('.')).replaceFirst(
						"[\\.]", "");
			}
			log.debug("Register name: {}", cName);
			mbs.registerMBean(new StandardMBean(instance, interfaceClass),
					new ObjectName(JMXFactory.getDefaultDomain() + ":type="
							+ cName + ",name=" + name));
			status = true;
		} catch (InstanceAlreadyExistsException iaee) {
			log.debug("Already registered: {}", className);
		} catch (Exception e) {
			log.error("Could not register the {} MBean. {}", className, e);
		}
		return status;
	}

	/**
	 * Shuts down any instanced connectors.
	 */
	public static void shutdown() {
		log.info("Shutting down JMX agent");
		if (null != cs) {
			try {
				//stop the connector
				cs.stop();
			} catch (Exception e) {
				log.error("Exception stopping JMXConnector server {}", e);
			}
		}
		if (null != html) {
			html.stop();
		}
		try {
			//unregister all the currently registered red5 mbeans
			String domain = JMXFactory.getDefaultDomain();
			for (ObjectName oname : (Set<ObjectName>) mbs.queryNames(
					new ObjectName(domain + ":*"), null)) {
				log.debug("Bean domain: {}", oname.getDomain());
				if (domain.equals(oname.getDomain())) {
					unregisterMBean(oname);
				}
			}
		} catch (Exception e) {
			log.error("Exception unregistering mbeans {}", e);
		}

	}

	/**
	 * Unregisters an mbean instance. If the instance is not found or if a failure occurs, false will be returned.
	 * 
	 * @param oName the o name
	 * 
	 * @return true, if unregister m bean
	 */
	public static boolean unregisterMBean(ObjectName oName) {
		boolean unregistered = false;
		if (null != oName) {
			try {
				if (mbs.isRegistered(oName)) {
					log.debug("Mbean is registered");
					mbs.unregisterMBean(oName);
					//set flag based on registration status
					unregistered = !mbs.isRegistered(oName);
				} else {
					log.debug("Mbean is not currently registered");
				}
			} catch (Exception e) {
				log.warn("Exception unregistering mbean {}", e);
			}
		}
		log.debug("leaving unregisterMBean...");
		return unregistered;
	}

	/**
	 * Updates a named attribute of a registered mbean.
	 * 
	 * @param oName the o name
	 * @param key the key
	 * @param value the value
	 * 
	 * @return true, if update m bean attribute
	 */
	public static boolean updateMBeanAttribute(ObjectName oName, String key,
			int value) {
		boolean updated = false;
		if (null != oName) {
			try {
				// update the attribute
				if (mbs.isRegistered(oName)) {
					mbs.setAttribute(oName, new javax.management.Attribute(
							"key", value));
					updated = true;
				}
			} catch (Exception e) {
				log.error("Exception updating mbean attribute", e);
			}
		}
		return updated;
	}

	/**
	 * Updates a named attribute of a registered mbean.
	 * 
	 * @param oName the o name
	 * @param key the key
	 * @param value the value
	 * 
	 * @return true, if update m bean attribute
	 */
	public static boolean updateMBeanAttribute(ObjectName oName, String key,
			String value) {
		boolean updated = false;
		if (null != oName) {
			try {
				// update the attribute
				if (mbs.isRegistered(oName)) {
					mbs.setAttribute(oName, new javax.management.Attribute(
							"key", value));
					updated = true;
				}
			} catch (Exception e) {
				log.error("Exception updating mbean attribute", e);
			}
		}
		return updated;
	}

	/**
	 * Gets the html adapter port.
	 * 
	 * @return the html adapter port
	 */
	public String getHtmlAdapterPort() {
		return htmlAdapterPort;
	}

	/* (non-Javadoc)
	 * @see javax.management.NotificationListener#handleNotification(javax.management.Notification, java.lang.Object)
	 */
	public void handleNotification(Notification notification, Object handback) {
		log.debug("handleNotification " + notification.getMessage());
	}

	/**
	 * Inits the.
	 */
	public void init() {
		//environmental var holder
		HashMap env = null;
		if (enableHtmlAdapter) {
			// setup the adapter
			try {
				//instance an html adaptor
				int port = htmlAdapterPort == null ? 8082 : Integer
						.valueOf(htmlAdapterPort);
				html = new HtmlAdaptorServer(port);
				ObjectName htmlName = new ObjectName(JMXFactory
						.getDefaultDomain()
						+ ":type=HtmlAdaptorServer,port=" + port);
				log.debug("Created HTML adaptor on port: " + port);
				//add the adaptor to the server
				mbs.registerMBean(html, htmlName);
				//start the adaptor
				html.start();
				log.info("JMX HTML connector server successfully started");

			} catch (Exception e) {
				log.error("Error in setup of JMX subsystem (HTML adapter)", e);
			}
		} else {
			log.info("JMX HTML adapter was not enabled");
		}
		if (enableRmiAdapter) {
			// Create an RMI connector server
			log.debug("Create an RMI connector server");
			try {

				Registry r = null;
				try {
					//lookup the registry
					r = LocateRegistry.getRegistry(Integer
							.valueOf(rmiAdapterPort));
					//ensure we are not already registered with the registry
					for (String regName : r.list()) {
						if (regName.equals("red5")) {
							//unbind connector from rmi registry
							r.unbind("red5");
						}
					}
				} catch (RemoteException re) {
					log.info("RMI Registry server was not found on port "
							+ rmiAdapterPort);
					//if we didnt find the registry and the user wants it created
					if (startRegistry) {
						log.info("Starting an internal RMI registry");
						// create registry for rmi port 9999
						r = LocateRegistry.createRegistry(Integer
								.valueOf(rmiAdapterPort));
					}
				}
				JMXServiceURL url = new JMXServiceURL(
						"service:jmx:rmi:///jndi/rmi://:" + rmiAdapterPort
								+ "/red5");
				//if SSL is requested to secure rmi connections
				if (enableSsl) {
					// Environment map
					log.debug("Initialize the environment map");
					env = new HashMap();
					// Provide SSL-based RMI socket factories
					SslRMIClientSocketFactory csf = new SslRMIClientSocketFactory();
					SslRMIServerSocketFactory ssf = new SslRMIServerSocketFactory();
					env
							.put(
									RMIConnectorServer.RMI_CLIENT_SOCKET_FACTORY_ATTRIBUTE,
									csf);
					env
							.put(
									RMIConnectorServer.RMI_SERVER_SOCKET_FACTORY_ATTRIBUTE,
									ssf);
				}

				//if authentication is requested
				if (StringUtils.isNotBlank(remoteAccessProperties)) {
					//if ssl is not used this will be null
					if (null == env) {
						env = new HashMap();
					}
					//check the existance of the files
					//in the war version the full path is needed
					File file = new File(remoteAccessProperties);
					if (!file.exists()) {
						log
								.debug("Access file was not found on path, will prepend config_root");
						//pre-pend the system property set in war startup
						remoteAccessProperties = System
								.getProperty("red5.config_root")
								+ '/' + remoteAccessProperties;
						remotePasswordProperties = System
								.getProperty("red5.config_root")
								+ '/' + remotePasswordProperties;
					}
					env.put("jmx.remote.x.access.file", remoteAccessProperties);
					env.put("jmx.remote.x.password.file",
							remotePasswordProperties);
				}

				// create the connector server
				cs = JMXConnectorServerFactory.newJMXConnectorServer(url, env,
						mbs);
				// add a listener for shutdown
				cs.addNotificationListener(this, null, null);
				// Start the RMI connector server
				log.debug("Start the RMI connector server");
				cs.start();
				log.info("JMX RMI connector server successfully started");
			} catch (ConnectException e) {
				log
						.warn("Could not establish RMI connection to port "
								+ rmiAdapterPort
								+ ", please make sure \"rmiregistry\" is running and configured to listen on this port.");
			} catch (IOException e) {
				String errMsg = e.getMessage();
				if (errMsg.indexOf("NameAlreadyBoundException") != -1) {
					log
							.error("JMX connector (red5) already registered, you will need to restart your rmiregistry");
				} else {
					log.error("{}", e);
				}
			} catch (Exception e) {
				log.error("Error in setup of JMX subsystem (RMI connector)", e);
			}
		} else {
			log.info("JMX RMI adapter was not enabled");
		}
	}

	/**
	 * Sets the enable html adapter.
	 * 
	 * @param enableHtmlAdapter the new enable html adapter
	 */
	public void setEnableHtmlAdapter(boolean enableHtmlAdapter) {
		JMXAgent.enableHtmlAdapter = enableHtmlAdapter;
	}

	/**
	 * Sets the enable html adapter.
	 * 
	 * @param enableHtmlAdapterString the new enable html adapter
	 */
	public void setEnableHtmlAdapter(String enableHtmlAdapterString) {
		JMXAgent.enableHtmlAdapter = enableHtmlAdapterString
				.matches("true|on|yes");
	}

	/**
	 * Sets the enable rmi adapter.
	 * 
	 * @param enableRmiAdapter the new enable rmi adapter
	 */
	public void setEnableRmiAdapter(boolean enableRmiAdapter) {
		JMXAgent.enableRmiAdapter = enableRmiAdapter;
	}

	/**
	 * Sets the enable rmi adapter.
	 * 
	 * @param enableRmiAdapterString the new enable rmi adapter
	 */
	public void setEnableRmiAdapter(String enableRmiAdapterString) {
		JMXAgent.enableRmiAdapter = enableRmiAdapterString
				.matches("true|on|yes");
	}

	/**
	 * Sets the enable ssl.
	 * 
	 * @param enableSsl the new enable ssl
	 */
	public void setEnableSsl(boolean enableSsl) {
		JMXAgent.enableSsl = enableSsl;
	}

	/**
	 * Sets the enable ssl.
	 * 
	 * @param enableSslString the new enable ssl
	 */
	public void setEnableSsl(String enableSslString) {
		JMXAgent.enableSsl = enableSslString.matches("true|on|yes");
	}

	/**
	 * Sets the html adapter port.
	 * 
	 * @param htmlAdapterPort the new html adapter port
	 */
	public void setHtmlAdapterPort(String htmlAdapterPort) {
		JMXAgent.htmlAdapterPort = htmlAdapterPort;
	}

	/**
	 * Sets the remote access properties.
	 * 
	 * @param remoteAccessProperties the new remote access properties
	 */
	public void setRemoteAccessProperties(String remoteAccessProperties) {
		JMXAgent.remoteAccessProperties = remoteAccessProperties;
	}

	/**
	 * Sets the remote password properties.
	 * 
	 * @param remotePasswordProperties the new remote password properties
	 */
	public void setRemotePasswordProperties(String remotePasswordProperties) {
		JMXAgent.remotePasswordProperties = remotePasswordProperties;
	}

	/**
	 * Sets the rmi adapter port.
	 * 
	 * @param rmiAdapterPort the new rmi adapter port
	 */
	public void setRmiAdapterPort(String rmiAdapterPort) {
		JMXAgent.rmiAdapterPort = rmiAdapterPort;
	}

	/**
	 * Sets the start registry.
	 * 
	 * @param startRegistry the new start registry
	 */
	public void setStartRegistry(boolean startRegistry) {
		JMXAgent.startRegistry = startRegistry;
	}

	/**
	 * Sets the enable mina monitor.
	 * 
	 * @param enableMinaMonitor the new enable mina monitor
	 */
	public void setEnableMinaMonitor(boolean enableMinaMonitor) {
		JMXAgent.enableMinaMonitor = enableMinaMonitor;
	}

	/**
	 * Sets the enable mina monitor.
	 * 
	 * @param enableMinaMonitor the new enable mina monitor
	 */
	public void setEnableMinaMonitor(String enableMinaMonitor) {
		JMXAgent.enableMinaMonitor = enableMinaMonitor.matches("true|on|yes");
	}

	/**
	 * Checks if is enable mina monitor.
	 * 
	 * @return true, if is enable mina monitor
	 */
	public static boolean isEnableMinaMonitor() {
		return enableMinaMonitor;
	}

}