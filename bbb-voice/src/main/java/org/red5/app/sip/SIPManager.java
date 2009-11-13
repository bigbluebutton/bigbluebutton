package org.red5.app.sip;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.util.*;


public final class SIPManager {

    private static Map< String, SIPUser > sessions;

    private static SIPManager singleton = new SIPManager();

    private static final Logger log = Red5LoggerFactory.getLogger( SIPManager.class, "sip" );


    public static SIPManager getInstance() {

        return singleton;
    }


    private SIPManager() {

        sessions = Collections.synchronizedMap( new HashMap< String, SIPUser >() );
        Timer timer = new Timer();
        int delay = 10000;
        int period = 10000;
        int maximumClosedLength = 0x1b7740;
        TimerTask closeSessionTask = new TimerTask() {

            public void run() {

                Iterator sipUsers = ( new ArrayList< SIPUser >( getSIPUsers() ) ).iterator();
                do {
                    if ( !sipUsers.hasNext() ) {
                        break;
                    }
                    SIPUser sipUser = (SIPUser) sipUsers.next();
                    long lastCheck = sipUser.getLastCheck();

                    if ( sipUser.isClosed() ) {
                        if ( lastCheck < ( new Date() ).getTime() - 0x1b7740L ) {
                            removeSIPUser( sipUser.getSessionID() );
                        }
                    }
                    else if ( System.currentTimeMillis() - lastCheck > 15000L && lastCheck != 0L ) {
                        sipUser.close();
                        removeSIPUser( sipUser.getSessionID() );
                    }
                }
                while ( true );
            }
        };
        // timer.scheduleAtFixedRate(closeSessionTask, delay, period);
    }


    public void addSIPUser( String sipID, SIPUser sipUser ) {

        sessions.put( sipID, sipUser );
    }


    public SIPUser getSIPUser( String sipID ) {

        return sessions.get( sipID );
    }


    public SIPUser removeSIPUser( String sipID ) {
    	log.debug("Number of SipUsers in Manager before remove {}", sessions.size());
        SIPUser sess = sessions.remove( sipID );
        sess = null;
        log.debug("Number of SipUsers in Manager after remove {}", sessions.size());
        return sess;
    }


    public Collection< SIPUser > getSIPUsers() {

        return sessions.values();
    }


    public int getNumberOfSessions() {

        return sessions.size();
    }


    public void closeSIPUser( String sipID ) {

        SIPUser sipUser = getSIPUser( sipID );

        if ( sipUser != null ) {
            sipUser.close();
            removeSIPUser( sipID );
        }
    }


    public void destroyAllSessions() {

        Collection sipUsers = getSIPUsers();
        SIPUser sipUser;

        for ( Iterator iter = sipUsers.iterator(); iter.hasNext(); ) {
            sipUser = (SIPUser) iter.next();
            sipUser.close();

            sipUser = null;
        }

        sessions = new HashMap< String, SIPUser >();
    }

}
