/*
 @(#)Log4jDirectConfigurer.java  $Revision: 1.1 $ $Date: 2008/11/13 13:50:20EST $
 *
 * Copyright (c) 2008 N-III Project - Royal Canadian Mounted Police
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of Royal
 * Canadian Mounted Police ("Confidential Information").  You shall not  
 * disclose such Confidential Information and contained herein are considered 
 * to be Protected and Internal use ONLY by N-III Project, RCMP.
 */
package org.bigbluebutton.webminer.util;

import org.apache.log4j.LogManager;
import org.apache.log4j.PropertyConfigurator;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

/**
 * TODO: Brief summary here - one or two sentence overview.
 * 
 * TODO: Detailed explanation of how this works, what it subclasses or what
 * should subclass it, etc. This should be as good as the Sun Javadocs. Consider
 * embedding some simple examples of using this class. See the Sun Thread class
 * for an example.
 * 
 * @version $Revision: 1.1 $
 * @see [Class name#method name] TODO
 */

public class Log4jDirectConfigurer implements InitializingBean, DisposableBean {
  private static final long DEFAULT_REFRESH_INTERVAL = 6000L;

  private String location;
  private String fileName;
  private String interval;

  /**
   * @return the location
   */
  public String getLocation() {
    return location;
  }

  /**
   * @param location
   *          the location to set
   */
  public void setLocation(String location) {
    this.location = location;
  }

  /**
   * @return the fileName
   */
  public String getFileName() {
    return fileName;
  }

  /**
   * @param fileName
   *          the fileName to set
   */
  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  /**
   * @return the interval
   */
  public String getInterval() {
    return interval;
  }

  /**
   * @param interval
   *          the interval to set
   */
  public void setInterval(String interval) {
    this.interval = interval;
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
   */
  public void afterPropertiesSet() throws Exception {

    if (getLocation() != null && getFileName() != null) {

      String fqName = System.getProperty(getLocation()) + "/" + getFileName();

      // use default refresh interval if not specified
      long refreshInterval = DEFAULT_REFRESH_INTERVAL;
      String intervalString = getInterval();
      if (intervalString != null) {
        refreshInterval = Long.parseLong(intervalString);
      }

      // perform actual Log4J initialization
      PropertyConfigurator.configureAndWatch(fqName, refreshInterval);
    } else {
      throw new IllegalArgumentException(
          "Missing log4jConfigLocation or log4jConfigName parameter.");
    }
  }

  /* (non-Javadoc)
   * @see org.springframework.beans.factory.DisposableBean#destroy()
   */
  public void destroy() throws Exception {
    LogManager.shutdown();
  }
}
