package org.red5.server.webapp.sip;


import org.zoolu.sip.address.NameAddress;


/** Listener of RegisterAgent */
public interface SIPRegisterAgentListener {

    /** When a UA has been successfully (un)registered. */
    void onUaRegistrationSuccess( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result );


    /** When a UA failed on (un)registering. */
    void onUaRegistrationFailure( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result );

    void onUaUnregistedSuccess();
}
