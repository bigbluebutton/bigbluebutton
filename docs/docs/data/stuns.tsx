import React from "react";

const stunsTableData = [
    {
        name: "sessionToken",
        required: true,
        type: "String",
        description: (
            <>
                Session token identifying the user whose meeting the STUN/TURN configuration is requested for. The meeting is resolved from the session, so no{" "}
                <code>meetingID</code> is passed. Issued by <code>/join</code> and only known to the joined client.
            </>
        ),
    },
];

export default stunsTableData;
