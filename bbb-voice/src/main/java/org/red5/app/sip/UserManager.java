package org.red5.app.sip;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.util.*;

public final class UserManager {

    private static Map< String, User > sessions;

    private static UserManager singleton = new UserManager();

    private static final Logger log = Red5LoggerFactory.getLogger( UserManager.class, "sip" );


    public static UserManager getInstance() {
        return singleton;
    }


    private UserManager() {
        sessions = Collections.synchronizedMap( new HashMap< String, User >() );
    }


    public void addSIPUser( String sipID, User sipUser ) {
        sessions.put( sipID, sipUser );
    }

    public User getSIPUser( String sipID ) {
        return sessions.get( sipID );
    }


    public User removeSIPUser( String sipID ) {
    	log.debug("Number of SipUsers in Manager before remove {}", sessions.size());
        User sess = sessions.remove( sipID );
        sess = null;
        log.debug("Number of SipUsers in Manager after remove {}", sessions.size());
        return sess;
    }


    public Collection< User > getSIPUsers() {
        return sessions.values();
    }


    public int getNumberOfSessions() {
        return sessions.size();
    }


    public void closeSIPUser( String sipID ) {
        User sipUser = getSIPUser( sipID );

        if ( sipUser != null ) {
            sipUser.close();
            removeSIPUser( sipID );
        }
    }


    public void destroyAllSessions() {
        Collection sipUsers = getSIPUsers();
        User sipUser;

        for ( Iterator iter = sipUsers.iterator(); iter.hasNext(); ) {
            sipUser = (User) iter.next();
            sipUser.close();

            sipUser = null;
        }

        sessions = new HashMap< String, User >();
    }

}
