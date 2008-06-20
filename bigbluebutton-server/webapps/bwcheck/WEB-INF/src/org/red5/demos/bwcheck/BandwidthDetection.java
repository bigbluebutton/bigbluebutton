package org.red5.demos.bwcheck;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.stream.IStreamCapableConnection;

import java.util.*;

import java.util.Map;
import java.util.HashMap;

/**
 *
 * @author The Red5 Project (red5@osflash.org)
 * @author Dan Rossi
 */
public class BandwidthDetection implements IPendingServiceCallback, IBandwidthDetection {
	
	IConnection client = null;
    double latency = 0;
    double cumLatency = 1;
    int count = 0;
    int sent = 0;
    double kbitDown = 0;
    double deltaDown = 0;
    double deltaTime = 0;
    
    List<Long> pakSent = new ArrayList<Long>();
    List<Long> pakRecv = new ArrayList<Long>();
    
	private Map<String, Long> beginningValues;
	private double[] payload = new double[1200];
	private double[] payload_1 = new double[12000];
	private double[] payload_2 = new double[12000];
	
	protected static Logger log = LoggerFactory.getLogger(BandwidthDetection.class.getName());
	
	public BandwidthDetection()
	{

	}
	
	public void checkBandwidth(IConnection p_client)
	{
		this.calculateClientBw(p_client);
	}
	
	public void calculateClientBw(IConnection p_client)
	{
		
		
		for (int i=0; i<1200; i++){
			payload[i] = Math.random();
		}
		
		p_client.setAttribute("payload", payload);
		
		for (int i=0; i<12000; i++){
			payload_1[i] = Math.random();
		}
		
		p_client.setAttribute("payload_1", payload_1);
		
		for (int i=0; i<12000; i++){
			payload_2[i] = Math.random();
		}
		
		p_client.setAttribute("payload_2", payload_2);
		
        final IStreamCapableConnection beginningStats = this.getStats();
        final Long start = new Long(System.nanoTime()/1000000); //new Long(System.currentTimeMillis());
        
        this.client = p_client;
        beginningValues = new HashMap<String, Long>();
        beginningValues.put("b_down", beginningStats.getWrittenBytes());
        beginningValues.put("b_up", beginningStats.getReadBytes());
        beginningValues.put("time", start);
        
		this.pakSent.add(start);
        this.sent++;
        log.info("Starting bandwidth check at " + start);
		this.callBWCheck("");

	}
	
	/**
	 * Handle callback from service call. 
	 */
	
	public void resultReceived(IPendingServiceCall call) { 
		Long now = new Long(System.nanoTime()/1000000); //new Long(System.currentTimeMillis());
        this.pakRecv.add(now);
        Long timePassed = (now - this.beginningValues.get("time"));
        
        this.count++;
        
        log.info("count: "+count+ " sent: "+sent+" timePassed: "+timePassed+" latency: "+latency);
        
        if (count == 1) {
            latency = Math.min(timePassed, 800);
            latency = Math.max(latency, 10);
            
    
            // We now have a latency figure so can start sending test data.
            // Second call.  1st packet sent
            pakSent.add(now);
            sent++;
            
            log.info("Sending First Payload at " + now);
            this.callBWCheck(this.client.getAttribute("payload"));
    		

        }
        
        
        //To run a very quick test, uncomment the following if statement and comment out the next 3 if statements.
        
        /*
        else if (count == 2 && (timePassed < 2000)) {
            pakSent.add(now);
            sent++;
            cumLatency++;
            this.callBWCheck(this.client.getAttribute("payload"));
        }
        */
        
       
        //The following will progressivly increase the size of the packets been sent until 1 second has elapsed.
        else if ((count > 1 && count < 3) && (timePassed < 1000)) {
            pakSent.add(now);
            sent++;
            cumLatency++;
            log.info("Sending Second Payload at " + now);
            this.callBWCheck(this.client.getAttribute("payload_1"));
        }
        else if ((count >=3 && count < 6) && (timePassed < 1000)) {
            pakSent.add(now);
            sent++;
            cumLatency++;
            log.info("Sending Third Payload at " + now);
            this.callBWCheck(this.client.getAttribute("payload_1"));
        }
        
        else if (count >= 6 && (timePassed < 1000)) {
            pakSent.add(now);
            sent++;
            cumLatency++;
            log.info("Sending Fourth Payload at " + now);
            this.callBWCheck(this.client.getAttribute("payload_2"));
        }
   
        //Time elapsed now do the calcs
        else if (sent == count) {
            // see if we need to normalize latency
            if (latency >= 100) {
                //make sure satelite and modem is detected properly
                if (pakRecv.get(1) - pakRecv.get(0) > 1000) {
                   latency = 100; 
                }
            }
            
            this.client.removeAttribute("payload");
            this.client.removeAttribute("payload_1");
            this.client.removeAttribute("payload_2");

            final IStreamCapableConnection endStats = this.getStats();          
            deltaDown = (endStats.getWrittenBytes() - beginningValues.get("b_down")) * 8 / 1000; // bytes to kbits
            deltaTime = ((now - beginningValues.get("time")) - (latency * cumLatency)) / 1000; // total dl time - latency for each packet sent in secs
            if (Math.round(deltaTime) <= 0) {
                deltaTime = (now - beginningValues.get("time") + latency) / 1000;
            }
            kbitDown = Math.round(deltaDown / deltaTime); // kbits / sec
            
            if (kbitDown < 100) kbitDown = 100;
            
            log.info("onBWDone: kbitDown = " + kbitDown + ", deltaDown= " + deltaDown + ", deltaTime = " + deltaTime + ", latency = " + this.latency);
            
            this.callBWDone(this.kbitDown, this.deltaDown, this.deltaTime, this.latency);                                 
        }	
        
	}
	
	private void callBWCheck(Object params)
	{
		IConnection conn = Red5.getConnectionLocal();
		
		if (conn instanceof IServiceCapableConnection) {
			((IServiceCapableConnection) conn).invoke("onBWCheck", new Object[]{params}, this);
		}
	}
	
	private void callBWDone(double kbitDown, double deltaDown, double deltaTime, double latency)
	{
		IConnection conn = Red5.getConnectionLocal();

		if (conn instanceof IServiceCapableConnection) {
			((IServiceCapableConnection) conn).invoke("onBWDone", new Object[]{kbitDown,  deltaDown, deltaTime, latency});
		}
	}
	
	private IStreamCapableConnection getStats()
	{
		IConnection conn = Red5.getConnectionLocal();
		if (conn instanceof IStreamCapableConnection) {
			return (IStreamCapableConnection) conn;
		}
		return null;
	}
}
