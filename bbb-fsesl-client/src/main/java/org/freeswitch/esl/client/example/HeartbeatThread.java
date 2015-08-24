/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.freeswitch.esl.client.example;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.slf4j.LoggerFactory;

/**
 *
 * @author leif
 */
public class HeartbeatThread implements Runnable {
    private final org.slf4j.Logger log = LoggerFactory.getLogger( this.getClass() );
    private Client client;
    private boolean shutdown = false;
    private String host = "localhost";
    private int port = 8021;
    private String password = "ClueCon";

    HeartbeatThread(Client c) {
        this.client = c;
    }

    HeartbeatThread(Client c, String h, int p, String pass) {
        this.client = c;
        this.host = h;
        this.port = p;
        this.password = pass;
    }

    public void shutdown() {
        this.shutdown = true;
    }

    public void gotHeartbeatEvent() {

    }
    
    public void run() {
        while(!shutdown) {
            try {
                String jobId = client.sendAsyncApiCommand( "status", "" );
                log.info( "Job id [{}] for [status]", jobId );
                Thread.sleep(25000);
            } catch (IllegalStateException is) {
                log.warn( "ISE: [{}]", is.getMessage());
                log.info( "Client connecting .." );
                try
                {
                    client.connect( host, port, password, 2 );
                    log.info( "Client connected .." );
                }
                catch ( InboundConnectionFailure e )
                {
                    log.warn( "Connect failed [{}]", e.getMessage() );
                    try {
                        Thread.sleep(25000);
                    } catch (InterruptedException ex) {
                        Logger.getLogger(HeartbeatThread.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
            } catch (InterruptedException ex) {
                Logger.getLogger(HeartbeatThread.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

}
