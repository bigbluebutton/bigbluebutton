package org.red5.server.api.scheduling;

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

import java.util.Date;
import java.util.List;

import org.red5.server.api.IScopeService;

// TODO: Auto-generated Javadoc
/**
 * Service that supports periodic execution of jobs, adding, removing and
 * getting their name as list.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface ISchedulingService extends IScopeService {

	/** The BEA n_ name. */
	public static String BEAN_NAME = "schedulingService";

	/**
	 * Schedule a job for periodic execution.
	 * 
	 * @param interval time in milliseconds between two notifications of the job
	 * @param job the job to trigger periodically
	 * 
	 * @return the name of the scheduled job
	 */
	public String addScheduledJob(int interval, IScheduledJob job);

	/**
	 * Schedule a job for single execution in the future.  Please note
	 * that the jobs are not saved if Red5 is restarted in the meantime.
	 * 
	 * @param timeDelta time delta in milliseconds from the current date
	 * @param job the job to trigger
	 * 
	 * @return the name of the scheduled job
	 */
	public String addScheduledOnceJob(long timeDelta, IScheduledJob job);

	/**
	 * Schedule a job for single execution at a given date.  Please note
	 * that the jobs are not saved if Red5 is restarted in the meantime.
	 * 
	 * @param date date when the job should be executed
	 * @param job the job to trigger
	 * 
	 * @return the name of the scheduled job
	 */
	public String addScheduledOnceJob(Date date, IScheduledJob job);
	
	/**
	 * Schedule a job for periodic execution which will start after the specifed delay.
	 * 
	 * @param interval time in milliseconds between two notifications of the job
	 * @param job the job to trigger periodically
	 * @param delay time in milliseconds to pass before first execution.
	 * 
	 * @return the string
	 * 
	 * the name of the scheduled job
	 */
	public String addScheduledJobAfterDelay(int interval, IScheduledJob job, int delay);

	/**
	 * Stop executing a previously scheduled job.
	 * 
	 * @param name name of the job to stop
	 */
	public void removeScheduledJob(String name);

	/**
	 * Return names of scheduled jobs.
	 * 
	 * @return list of job names
	 */
	public List<String> getScheduledJobNames();

}
