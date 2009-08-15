/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.live;

import java.util.HashMap;
import java.util.Map;

/**
 * Asterisk hangup cause.<p>
 * Definitions from <code>/include/asterisk/causes.h</code>.
 *
 * @author srt
 * @version $Id: HangupCause.java 962 2008-02-03 03:34:11Z srt $
 */
public enum HangupCause
{
    AST_CAUSE_UNALLOCATED(1),
    AST_CAUSE_NO_ROUTE_TRANSIT_NET(2),
    AST_CAUSE_NO_ROUTE_DESTINATION(3),
    AST_CAUSE_CHANNEL_UNACCEPTABLE(6),
    AST_CAUSE_CALL_AWARDED_DELIVERED(7),
    AST_CAUSE_NORMAL_CLEARING(16),
    AST_CAUSE_USER_BUSY(17),
    AST_CAUSE_NO_USER_RESPONSE(18),
    AST_CAUSE_NO_ANSWER(19),
    AST_CAUSE_CALL_REJECTED(21),
    AST_CAUSE_NUMBER_CHANGED(22),
    AST_CAUSE_DESTINATION_OUT_OF_ORDER(27),
    AST_CAUSE_INVALID_NUMBER_FORMAT(28),
    AST_CAUSE_FACILITY_REJECTED(29),
    AST_CAUSE_RESPONSE_TO_STATUS_ENQUIRY(30),
    AST_CAUSE_NORMAL_UNSPECIFIED(31),
    AST_CAUSE_NORMAL_CIRCUIT_CONGESTION(34),
    AST_CAUSE_NETWORK_OUT_OF_ORDER(38),
    AST_CAUSE_NORMAL_TEMPORARY_FAILURE(41),
    AST_CAUSE_SWITCH_CONGESTION(42),
    AST_CAUSE_ACCESS_INFO_DISCARDED(43),
    AST_CAUSE_REQUESTED_CHAN_UNAVAIL(44),
    AST_CAUSE_PRE_EMPTED(45),
    AST_CAUSE_FACILITY_NOT_SUBSCRIBED(50),
    AST_CAUSE_OUTGOING_CALL_BARRED(52),
    AST_CAUSE_INCOMING_CALL_BARRED(54),
    AST_CAUSE_BEARERCAPABILITY_NOTAUTH(57),
    AST_CAUSE_BEARERCAPABILITY_NOTAVAIL(58),
    AST_CAUSE_BEARERCAPABILITY_NOTIMPL(65),
    AST_CAUSE_CHAN_NOT_IMPLEMENTED(66),
    AST_CAUSE_FACILITY_NOT_IMPLEMENTED(69),
    AST_CAUSE_INVALID_CALL_REFERENCE(81),
    AST_CAUSE_INCOMPATIBLE_DESTINATION(88),
    AST_CAUSE_INVALID_MSG_UNSPECIFIED(95),
    AST_CAUSE_MANDATORY_IE_MISSING(96),
    AST_CAUSE_MESSAGE_TYPE_NONEXIST(97),
    AST_CAUSE_WRONG_MESSAGE(98),
    AST_CAUSE_IE_NONEXIST(99),
    AST_CAUSE_INVALID_IE_CONTENTS(100),
    AST_CAUSE_WRONG_CALL_STATE(101),
    AST_CAUSE_RECOVERY_ON_TIMER_EXPIRE(102),
    AST_CAUSE_MANDATORY_IE_LENGTH_ERROR(103),
    AST_CAUSE_PROTOCOL_ERROR(111),
    AST_CAUSE_INTERWORKING(127),

    /* Special Asterisk aliases */
    AST_CAUSE_BUSY(AST_CAUSE_USER_BUSY),
    AST_CAUSE_FAILURE(AST_CAUSE_NETWORK_OUT_OF_ORDER),
    AST_CAUSE_NORMAL(AST_CAUSE_NORMAL_CLEARING),
    AST_CAUSE_NOANSWER(AST_CAUSE_NO_ANSWER),
    AST_CAUSE_CONGESTION(AST_CAUSE_NORMAL_CIRCUIT_CONGESTION),
    AST_CAUSE_UNREGISTERED(AST_CAUSE_NO_ROUTE_DESTINATION),
    AST_CAUSE_NOTDEFINED(0),
    AST_CAUSE_NOSUCHDRIVER(AST_CAUSE_CHAN_NOT_IMPLEMENTED);

    private HangupCause(int code)
    {
        this.code = code;
    }

    private HangupCause(HangupCause cause)
    {
        this.code = cause.code;
    }

    /**
     * Returns the numeric cause code.<p>
     * Using this method in client code is discouraged.
     *
     * @return the numeric cause code.
     */
    public int getCode()
    {
        return code;
    }

    /**
     * Returns the HangupCode by its numeric cause code.<p>
     * Using this method in client code is discouraged.
     *
     * @param code the numeric cause code.
     * @return the corresponding HangupCode enum or
     *         <code>null</code> if there is no such HangupCause.
     */
    public static synchronized HangupCause getByCode(int code)
    {
        if (causes == null)
        {
            causes = new HashMap<Integer, HangupCause>();
            for (HangupCause cause : values())
            {
                causes.put(cause.code, cause);
            }
        }

        return causes.get(code);
    }

    @Override
    public String toString()
    {
        if (name().startsWith("AST_CAUSE_"))
        {
            return name().substring(10);
        }
        return name();
    }

    private int code;
    private static Map<Integer, HangupCause> causes;
}
