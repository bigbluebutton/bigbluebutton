package org.red5.server.scheduling;

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

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.red5.server.api.scheduling.IScheduledJob;
import org.red5.server.api.scheduling.ISchedulingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Scheduled job that is registered in the Quartz scheduler.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class QuartzSchedulingServiceJob implements Job {
    
    /** Scheduling service constant. */
    protected static final String SCHEDULING_SERVICE = "scheduling_service";

    /** Scheduled job constant. */
    protected static final String SCHEDULED_JOB = "scheduled_job";

    /** Logger. */
    private Logger log = LoggerFactory.getLogger( QuartzSchedulingService.class );

    /** {@inheritDoc} */
    public void execute(JobExecutionContext arg0) throws JobExecutionException {
		ISchedulingService service = (ISchedulingService) arg0.getJobDetail()
				.getJobDataMap().get(SCHEDULING_SERVICE);
		IScheduledJob job = (IScheduledJob) arg0.getJobDetail().getJobDataMap()
				.get(SCHEDULED_JOB);
        try {
            job.execute(service);
        } catch (Throwable e) {
            log.error("Job " + job.toString() + " execution failed: " + e.getMessage());
        }
    }

}
