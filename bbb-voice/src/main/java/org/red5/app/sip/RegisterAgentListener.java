package org.red5.app.sip;


import org.zoolu.sip.address.NameAddress;


/** Listener of RegisterAgent */
public interface RegisterAgentListener {

    /** When a UA has been successfully (un)registered. */
    void onUaRegistrationSuccess( RegisterAgent ra, NameAddress target, NameAddress contact, String result );


    /** When a UA failed on (un)registering. */
    void onUaRegistrationFailure( RegisterAgent ra, NameAddress target, NameAddress contact, String result );

    void onUaUnregistedSuccess();
}
