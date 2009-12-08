package org.red5.app.sip;

import java.util.Enumeration;
import java.util.Vector;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.CodecFactory;
import org.zoolu.sdp.AttributeField;
import org.zoolu.sdp.MediaDescriptor;
import org.zoolu.sdp.MediaField;
import org.zoolu.sdp.SessionDescriptor;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class SdpUtils {
    protected static Logger log = Red5LoggerFactory.getLogger(SdpUtils.class, "sip");
    
    
    /**
     * @return Returns the audio codec to be used on current session.
     */
    public static Codec getNegotiatedAudioCodec(SessionDescriptor negotiatedSDP){
        int payloadId;
        String rtpmap;
        Codec sipCodec = null;
        
        MediaDescriptor md = negotiatedSDP.getMediaDescriptor(Codec.MEDIA_TYPE_AUDIO );
        rtpmap = md.getAttribute(Codec.ATTRIBUTE_RTPMAP).getAttributeValue();
        
        if (!rtpmap.isEmpty()) {            
            payloadId = Integer.parseInt(rtpmap.substring(0, rtpmap.indexOf(" ")));
            
            sipCodec = CodecFactory.getInstance().getSIPAudioCodec(payloadId);            
            if (sipCodec == null) {
            	log.error("Negotiated codec {} not found", payloadId);
            }
            else {
                log.info("Found codec: payloadType={}, payloadName={}.", sipCodec.getCodecId(), 
                			sipCodec.getCodecName());
            }
        }        
        return sipCodec;
    }
    
    
    /**
     * 
     * @param userName
     * @param viaAddress
     * 
     * @return Return the initial local SDP.
     */
    public static SessionDescriptor createInitialSdp(String userName, String viaAddress, 
    		int audioPort, int videoPort, String audioCodecsPrecedence) {
        
        SessionDescriptor initialDescriptor = null;
                
        try {            
//            log.debug("userName = [" + userName + "], viaAddress = [" + viaAddress + 
//                    "], audioPort = [" + audioPort + "], videoPort = [" + videoPort + 
//                    "], audioCodecsPrecedence = [" + audioCodecsPrecedence + "]." );
            
            int audioCodecsNumber = CodecFactory.getInstance().getAvailableAudioCodecsCount();
            int videoCodecsNumber = CodecFactory.getInstance().getAvailableVideoCodecsCount();
            
            if ((audioCodecsNumber == 0) && (videoCodecsNumber == 0)) {                
                log.debug("audioCodecsNumber = [" + audioCodecsNumber + 
                        "], videoCodecsNumber = [" + videoCodecsNumber + "].");                
                return null;
            }
            
            initialDescriptor = new SessionDescriptor(userName, viaAddress);
            
            if (initialDescriptor == null) {                
                log.error("Error instantiating the initialDescriptor!");                 
                return null;
            }
            
            if (audioCodecsNumber > 0) {                
                Codec[] audioCodecs;
                Vector audioAttributes = new Vector();
                
                if (audioCodecsPrecedence.isEmpty()) {                    
                    audioCodecs = CodecFactory.getInstance().getAvailableAudioCodecs();
                } else {                    
                    audioCodecs = CodecFactory.getInstance().getAvailableAudioCodecsWithPrecedence(audioCodecsPrecedence);
                }
                
                for (int audioIndex = 0; audioIndex < audioCodecsNumber; audioIndex++) {                   
                    String payloadId = String.valueOf(audioCodecs[audioIndex].getCodecId());
                    String rtpmapParamValue = payloadId;
                    rtpmapParamValue += " " + audioCodecs[audioIndex].getCodecName();
                    rtpmapParamValue += "/" + audioCodecs[audioIndex].getSampleRate() + "/1";
                    
//                    log.debug("Adding rtpmap for payload [" + payloadId + 
//                            "] with value = [" + rtpmapParamValue + "]." );
                    
                    audioAttributes.add(new AttributeField(Codec.ATTRIBUTE_RTPMAP, rtpmapParamValue));
                    
                    String[] codecMediaAttributes = audioCodecs[audioIndex].getCodecMediaAttributes();
                    
                    if (codecMediaAttributes != null) {                        
//                        log.debug("Adding " + codecMediaAttributes.length + 
//                                " audio codec media attributes." );
                        
                        for (int attribIndex = 0; attribIndex < codecMediaAttributes.length; attribIndex++) {                            
//                            log.debug("Adding audio media attribute [" + 
//                                    codecMediaAttributes[attribIndex] + "]." );
                            
                            AttributeField newAttribute = parseAttributeField(codecMediaAttributes[attribIndex]);
                            
                            if (newAttribute != null) {                                
                                audioAttributes.add(newAttribute);
                            }
                        }
                    } else {                        
                        log.warn("Audio codec has no especific media attributes." );
                    }
                }
                
                // Calculate the format list to be used on MediaDescriptor creation.
                String formatList = getFormatList(audioAttributes);
                
                for (Enumeration attributesEnum = audioAttributes.elements(); attributesEnum.hasMoreElements();) {                    
                    AttributeField audioAttribute = (AttributeField) attributesEnum.nextElement();
                    
                    if (initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_AUDIO) == null) {                        
//                        log.debug("Creating audio media descriptor." );
                        
                    	MediaField mf = new MediaField(Codec.MEDIA_TYPE_AUDIO, audioPort, 0, "RTP/AVP", formatList);
                        initialDescriptor.addMedia(mf, audioAttribute);
                    } else {                        
//                        log.debug("Just adding attribute.");
                        initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_AUDIO).addAttribute(audioAttribute);
                    }
                }
                
                String[] commonAudioMediaAttributes = CodecFactory.getInstance().getCommonAudioMediaAttributes();
                
                if (commonAudioMediaAttributes != null) {                    
//                    log.debug("Adding " + commonAudioMediaAttributes.length + " common audio media attributes." );
                    
                    for (int attribIndex = 0; attribIndex < commonAudioMediaAttributes.length; attribIndex++) {                        
//                        log.debug("Adding common audio media attribute [" + commonAudioMediaAttributes[attribIndex] + "].");
                        
                        AttributeField newAttribute = parseAttributeField(commonAudioMediaAttributes[attribIndex]);
                        
                        if (newAttribute != null) {                            
                            initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_AUDIO).addAttribute( newAttribute);
                        }
                    }
                } else {                    
                    log.debug("No common audio media attributes.");
                }
            }
            
            if (videoCodecsNumber > 0) {                
                Codec[] videoCodecs = CodecFactory.getInstance().getAvailableVideoCodecs();
                Vector videoAttributes = new Vector();
                
                for (int videoIndex = 0; videoIndex < audioCodecsNumber; videoIndex++) {                    
                    String payloadId = String.valueOf(videoCodecs[videoIndex].getCodecId());
                    String rtpmapParamValue = payloadId;
                    rtpmapParamValue += " " + videoCodecs[videoIndex].getCodecName();
                    rtpmapParamValue += "/" + videoCodecs[videoIndex].getSampleRate() + "/1";
                    
//                    log.debug("Adding rtpmap for payload [" + payloadId + "] with value = [" + rtpmapParamValue + "].");
                    
                    videoAttributes.add(new AttributeField(Codec.ATTRIBUTE_RTPMAP, rtpmapParamValue));                    
                    String[] codecMediaAttributes = videoCodecs[videoIndex].getCodecMediaAttributes();
                    
                    if (codecMediaAttributes != null) {                        
//                        log.debug("Adding " + codecMediaAttributes.length + " video codec media attributes.");
                        
                        for (int attribIndex = 0; attribIndex < codecMediaAttributes.length; attribIndex++) {                            
//                            log.debug("Adding video media attribute [" + codecMediaAttributes[attribIndex] + "].");
                            
                            AttributeField newAttribute = parseAttributeField(codecMediaAttributes[attribIndex]);
                            
                            if (newAttribute != null) {                                
                                videoAttributes.add(newAttribute);
                            }
                        }
                    } else {
                       log.info("Video codec has no especific media attributes.");
                    }
                }
                
                // Calculate the format list to be used on MediaDescriptor creation.
                String formatList = getFormatList(videoAttributes);
                
                for (Enumeration attributesEnum = videoAttributes.elements(); attributesEnum.hasMoreElements();) {                    
                    AttributeField videoAttribute = (AttributeField) attributesEnum.nextElement();
                    
                    if (initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_VIDEO) == null) {    
                    	MediaField mf = new MediaField(Codec.MEDIA_TYPE_VIDEO, audioPort, 0, "RTP/AVP", formatList);
                        initialDescriptor.addMedia(mf, videoAttribute);
                    } else {
                        initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_VIDEO).addAttribute(videoAttribute);
                    }
                }
                
                String[] commonVideoMediaAttributes = CodecFactory.getInstance().getCommonAudioMediaAttributes();
                
                if (commonVideoMediaAttributes != null) {                    
//                    log.debug("Adding " + commonVideoMediaAttributes.length + " common video media attributes.");
                    
                    for (int attribIndex = 0; attribIndex < commonVideoMediaAttributes.length; attribIndex++) {                        
//                        log.debug("Adding common video media attribute [" + commonVideoMediaAttributes[attribIndex] + "]." );
                        
                        AttributeField newAttribute = parseAttributeField(commonVideoMediaAttributes[attribIndex]);
                        
                        if (newAttribute != null) {                            
                            initialDescriptor.getMediaDescriptor(Codec.MEDIA_TYPE_VIDEO).addAttribute(newAttribute);
                        }
                    }
                } else {                    
                    log.info("No common video media attributes.");
                }
            }
        } catch (Exception exception) {
            log.error("Failure creating initial SDP: " + exception.toString());
        }
        
//        log.debug("Created initial SDP");
        
        return initialDescriptor;
    }
    
    
    private static String getFormatList(Vector mediaAttributes) {        
        AttributeField mediaAttribute = null;
        String formatList = "";
        
//        log.debug("getting Format List");
        
        for (Enumeration attributeEnum = mediaAttributes.elements(); attributeEnum.hasMoreElements();) {            
            mediaAttribute = (AttributeField) attributeEnum.nextElement();
            
            if (mediaAttribute.getAttributeName().equalsIgnoreCase(Codec.ATTRIBUTE_RTPMAP)) {                
                if (!formatList.isEmpty()) {
                    formatList += " ";
                }
                
                formatList += getPayloadIdFromAttribute(mediaAttribute);
            }
        }
        
//        log.debug("formatList = [" + formatList + "].");
                
        return formatList;
    }
    
    
    private static AttributeField parseAttributeField(String codecMediaAttribute) {        
        AttributeField newAttribute = null;
        
//        log.debug("codecMediaAttribute = [" + codecMediaAttribute + "].");
        
        String attribName = codecMediaAttribute.substring(0, codecMediaAttribute.indexOf(":"));
        String attribValue = codecMediaAttribute.substring(codecMediaAttribute.indexOf(":") + 1);
        
//        log.debug("attribName = [" + attribName + "] attribValue  = [" + attribValue + "].");
        
        if ((!attribName.isEmpty()) && (!attribValue.isEmpty())) {            
            newAttribute = new AttributeField(attribName, attribValue);
        }
                
        return newAttribute;
    }
    
    
    /** 
     * We must validate the existence of all remote "rtpmap" attributes 
     * on local SDP.
     * If some exist, we add it to newSdp negotiated SDP result.
     * 
     * @param localSdp
     * @param remoteSdp
     * 
     * @return Returns the new local descriptor as a result of media 
     *         payloads negotiation.
     */
    public static SessionDescriptor makeMediaPayloadsNegotiation(SessionDescriptor localSdp, SessionDescriptor remoteSdp) {        
    	log.debug("makeMediaPayloadsNegotiation");
    	
    	SessionDescriptor newSdp = null;    
        try {            
            newSdp = new SessionDescriptor(remoteSdp.getOrigin(), remoteSdp.getSessionName(),
                    localSdp.getConnection(), localSdp.getTime());
            
            Vector remoteDescriptors = remoteSdp.getMediaDescriptors();
            
            for (Enumeration descriptorsEnum = remoteDescriptors.elements(); descriptorsEnum.hasMoreElements();) {                
                MediaDescriptor remoteDescriptor = (MediaDescriptor) descriptorsEnum.nextElement();
                MediaDescriptor localDescriptor = localSdp.getMediaDescriptor(remoteDescriptor.getMedia().getMedia() );
                
                if (localDescriptor != null) {                    
                    Vector remoteAttributes = remoteDescriptor.getAttributes(Codec.ATTRIBUTE_RTPMAP);
                    Vector newSdpAttributes = new Vector();
                    
                    for (Enumeration attributesEnum = remoteAttributes.elements(); attributesEnum.hasMoreElements();) {                        
                        AttributeField remoteAttribute = (AttributeField) attributesEnum.nextElement();
                        
                        String payloadId = getPayloadIdFromAttribute(remoteAttribute);
                        
                        if ("".equals(payloadId)) {                            
                            log.error("Payload id not found on attribute: Name = [" + 
                                    remoteAttribute.getAttributeName() + "], Value = [" + 
                                    remoteAttribute.getAttributeValue() + "]." );
                        } else if (findAttributeByPayloadId(remoteAttribute.getAttributeName(), 
                        		payloadId, localDescriptor) != null) {                            
                            newSdpAttributes.add(remoteAttribute);
                        }
                    }
                    
                    // Calculate the format list to be used on MediaDescriptor creation.
                    String formatList = getFormatList(newSdpAttributes);
                    
                    for (Enumeration attributesEnum = newSdpAttributes.elements(); attributesEnum.hasMoreElements();) {                        
                        AttributeField mediaAttribute = (AttributeField) attributesEnum.nextElement();
                        
                        if (newSdp.getMediaDescriptors().size() == 0) {  
                        	MediaField mf = new MediaField(localDescriptor.getMedia().getMedia(), 
                                    						localDescriptor.getMedia().getPort(), 
                                    						0, localDescriptor.getMedia().getTransport(), 
                                    						formatList); 
                            newSdp.addMediaDescriptor(new MediaDescriptor(mf, localDescriptor.getConnection()));
                        }
                        
                        newSdp.getMediaDescriptor(localDescriptor.getMedia().getMedia()).addAttribute( mediaAttribute );
                    }
                }
            }
        } catch (Exception exception) {            
            log.error("Failure creating initial SDP: " + exception.toString());
        }
        
        return newSdp;
    }
    
    
    /**
     * Parameter "newSdp" must be the returning value from method's 
     * "makeMediaPayloadsNegotiation" execution.
     * Here the pending attributes will be negotiated as well.
     * 
     * @param newSdp
     * @param localSdp
     * @param remoteSdp
     * 
     */
    public static void completeSdpNegotiation(SessionDescriptor newSdp, SessionDescriptor localSdp, SessionDescriptor remoteSdp) {        
        try {            
            if (newSdp.getMediaDescriptors().size() == 0) {                
                // Something is wrong.
                // We should have at least a "audio" media descriptor with 
                // all audio payloads suported.
                
                log.error("No media descriptors after \"makeMediaPayloadsNegotiation\"." );                
                return;
            }
            
            Vector remoteDescriptors = remoteSdp.getMediaDescriptors();
            
            for (Enumeration descriptorsEnum = remoteDescriptors.elements(); descriptorsEnum.hasMoreElements();) {                
                MediaDescriptor remoteDescriptor = (MediaDescriptor) descriptorsEnum.nextElement();
                MediaDescriptor localDescriptor = localSdp.getMediaDescriptor(remoteDescriptor.getMedia().getMedia());
                
                if (localDescriptor != null) {                    
                    // First we make the negotiation of remote attributes with 
                    // local ones to generate the new SDP "newSdp".
                    
                    Vector remoteAttributes = remoteDescriptor.getAttributes();
                    
                    for (Enumeration atributesEnum = remoteAttributes.elements(); atributesEnum.hasMoreElements();) {                        
                        AttributeField remoteAttribute = (AttributeField) atributesEnum.nextElement();                        
                        makeAttributeNegotiation(newSdp, localDescriptor, remoteAttribute);
                    }
                    
                    // Now we add to "newSdp" all the local attributes that 
                    // were not negotiated yet.
                    
                    Vector localAttributes = localDescriptor.getAttributes();
                    
                    for (Enumeration atributesEnum = localAttributes.elements(); atributesEnum.hasMoreElements();) {                        
                        AttributeField localAttribute = (AttributeField) atributesEnum.nextElement();
                        MediaDescriptor newLocalDescriptor = newSdp.getMediaDescriptor(localDescriptor.getMedia().getMedia());
                        
                        if (isPayloadRelatedAttribute(localAttribute)) {                            
                            String payloadId = getPayloadIdFromAttribute(localAttribute);
                            
                            if (findAttributeByPayloadId(localAttribute.getAttributeName(), 
                                    					payloadId, newLocalDescriptor) == null) {                                
                                newLocalDescriptor.addAttribute(localAttribute);
                            }
                        } else if (newLocalDescriptor.getAttribute(localAttribute.getAttributeName()) == null) {                            
                            newLocalDescriptor.addAttribute(localAttribute);
                        }
                    }
                }
            }
        } catch (Exception exception) {            
            log.error("Failure creating initial SDP: " + exception.toString());
        }
    }
    
    
    /**
     * Here we make the negotiation of all attributes besides "rtpmap" (
     * these are negotiated on "makeMediaPayloadsNegotiation" method).
     * 
     * @param newSdp
     * @param localMedia
     * @param remoteAttribute
     */
    private static void makeAttributeNegotiation(SessionDescriptor newSdp, MediaDescriptor localMedia, AttributeField remoteAttribute ) {
        try {            
//            log.debug("AttributeName = [" + remoteAttribute.getAttributeName() + 
//                    "], AttributeValue = [" + remoteAttribute.getAttributeValue() + "].");
            
            if (remoteAttribute.getAttributeName().equals(Codec.ATTRIBUTE_RTPMAP)) {                
                log.info("\"rtpmap\" attributes were already negotiated." );
            } else if (!isPayloadRelatedAttribute(remoteAttribute)) {                
                // We do nothing with attributes that are not payload 
                // related, like: "ptime", "direction", etc.
                // For now, we consider that they don't demand negotiation.                
                log.info("Attribute is not payload related. Do not negotiate it...");
            } else {                
                String payloadId = getPayloadIdFromAttribute(remoteAttribute);
                
                if ("".equals(payloadId)) {                    
                    log.error("Payload id not found on attribute: Name = [" + 
                            remoteAttribute.getAttributeName() + "], Value = [" + 
                            remoteAttribute.getAttributeValue() + "]." );
                } else if (findAttributeByPayloadId( Codec.ATTRIBUTE_RTPMAP, payloadId, 
                        newSdp.getMediaDescriptor(localMedia.getMedia().getMedia())) != null) {
                    // We must be sure this attribute is related with a payload 
                    // already present on newSdp.                    
//                    log.debug("Payload " + payloadId + " present on newSdp.");
                    
                    AttributeField localAttribute = findAttributeByPayloadId(remoteAttribute.getAttributeName(), payloadId, localMedia );
                    
                    Codec sipCodec = CodecFactory.getInstance().getSIPAudioCodec(Integer.valueOf( payloadId));
                    
                    if (sipCodec != null) {                        
                        String localAttibuteValue = "";
                        
                        if (localAttribute != null) {                            
                            localAttibuteValue = localAttribute.getAttributeValue();
                        } else {
                            log.info("Attribute not found on local media.");
                        }
                        
                        String attributeValueResult = sipCodec.codecNegotiateAttribute(remoteAttribute.getAttributeName(), 
                                					localAttibuteValue, remoteAttribute.getAttributeValue());
                        
                        if ((attributeValueResult != null) && (!"".equals(attributeValueResult))) { 
                        	AttributeField af = new AttributeField(remoteAttribute.getAttributeName(), attributeValueResult);
                        	MediaDescriptor md = newSdp.getMediaDescriptor(localMedia.getMedia().getMedia());
                            md.addAttribute(af);
                        }
                    } else {                        
                        log.warn("Codec not found!");
                    }
                }
            }
        } catch (Exception exception) {            
            log.error("Failure creating initial SDP: " + exception.toString());
        }
    }
    
    
    private static AttributeField findAttributeByPayloadId(String attributeName, String payloadId, 
    				MediaDescriptor mediaDescriptor) {
        AttributeField searchingMediaAttribute = null;
        
//        log.debug("attributeName = [" + attributeName + "], payloadId = [" + payloadId + "].");
        
        Vector mediaAttributes = mediaDescriptor.getAttributes( attributeName );
        
        for (Enumeration attributesEnum = mediaAttributes.elements(); attributesEnum.hasMoreElements();) {            
            AttributeField mediaAttribute = (AttributeField) attributesEnum.nextElement();

//            log.debug("Validating attribute with name = [" + mediaAttribute.getAttributeName() + 
//                    "] and value = [" + mediaAttribute.getAttributeValue() + "].");
            
            if (getPayloadIdFromAttribute(mediaAttribute).equals(payloadId)) {                
                searchingMediaAttribute = mediaAttribute;
                break;
            }
        }
        
        if (searchingMediaAttribute != null) {            
//            log.debug("Attribute found with name = [" + 
//                    searchingMediaAttribute.getAttributeName() + "] and value = [" + 
//                    searchingMediaAttribute.getAttributeValue() + "]." );
        } else {            
//            log.info("Attribute with name [" + attributeName + "] and payloadId [" + payloadId + "] was not found." );
        }
        
        return searchingMediaAttribute;
    }
    
    
    private static String getPayloadIdFromAttribute(AttributeField attribute) {        
        String payloadId = "";

//        log.debug("AttributeName = [" + attribute.getAttributeName() + "], AttributeValue = [" + attribute.getAttributeValue() + "]." );
        
        if (isPayloadRelatedAttribute(attribute)) {            
            payloadId = attribute.getAttributeValue().substring(0, attribute.getAttributeValue().indexOf(" "));
        }
        
//        log.debug("payloadId = " + payloadId); 
        
        return payloadId;
    }
    
    
    private static boolean isPayloadRelatedAttribute(AttributeField attribute) {        
        boolean isPayloadAttribute = false;

//        log.debug("AttributeName = [" + attribute.getAttributeName() + "], AttributeValue = [" + attribute.getAttributeValue() + "]." );
        
        if ((attribute.getAttributeName().compareToIgnoreCase(Codec.ATTRIBUTE_RTPMAP) == 0) || 
                (attribute.getAttributeName().compareToIgnoreCase(Codec.ATTRIBUTE_AS) == 0) || 
                (attribute.getAttributeName().compareToIgnoreCase(Codec.ATTRIBUTE_FMTP) == 0)) {            
            isPayloadAttribute = true;
        }
        
//        log.debug("isPayloadAttribute = " + isPayloadAttribute); 

        return isPayloadAttribute;
    }
}
