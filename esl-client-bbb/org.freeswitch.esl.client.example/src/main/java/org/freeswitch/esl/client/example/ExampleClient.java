package org.freeswitch.esl.client.example;
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Scanner;

/**
 *
 * @author leif
 */
public class ExampleClient {
    private final Logger log = LoggerFactory.getLogger( this.getClass() );

    private String host = "localhost";
    private int port = 8021;
    private String password = "ClueCon";
    private Client client;
    private HeartbeatThread hbThread;
    
    public void do_connect() throws InterruptedException
    {
        client = new Client();
        client.addEventListener( new EslEventListener() );

        log.info( "Client connecting .." );
        try
        {
            client.connect( host, port, password, 2 );
        }
        catch ( InboundConnectionFailure e )
        {
            log.error( "Connect failed", e );
            return;
        }
        log.info( "Client connected .." );

        //client.setEventSubscriptions( "plain", "heartbeat BACKGROUND_JOB CUSTOM" );
        client.setEventSubscriptions( "plain", "all" );
        client.addEventFilter( "Event-Name", "heartbeat" );
        client.addEventFilter( "Event-Name", "custom" );
        client.addEventFilter( "Event-Name", "background_job" );

    }

    public void close_client() {
        stopHeartBeatThread();
        client.close();
    }

    public void startHeartBeatThread() {
        hbThread = new HeartbeatThread(client);
        new Thread(hbThread).start();
    }

    public void stopHeartBeatThread() {
        hbThread.shutdown();
    }
    
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        ExampleClient test = new ExampleClient();
        try {
            test.do_connect();
            //FIXME.. the reconnect code that this is intended to implement requires refactoring.
            //test.startHeartBeatThread();
            Scanner myInput = new Scanner(System.in);
            boolean notDone = true;
            while(notDone){
                String Input1 = myInput.next();
                if(Input1.equalsIgnoreCase("q")){
                    notDone = false;
                }
                Thread.sleep( 25000 );
            }
            //test.stopHeartBeatThread();
            test.close_client();
        }catch(InterruptedException ie) {
            return;
        }
    }

}
