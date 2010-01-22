package org.bigbluebutton.web.services;

/*
 * This class will enable/disable the scheduling of conference. We need
 * this to support the old scheduling mechanism with ability to disable it
 * for those who will just use the API. Eventually, all scheduling should
 * be done using the API.
 */
public class SchedulingService {
	static transactional = false
	def schedulingServiceEnabled = false
}
