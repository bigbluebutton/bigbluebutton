import React from "react";

const signOutTableData = [
    {
        name: "sessionToken",
        required: true,
        type: "String",
        description: (
            <>
                Session token of the session to invalidate. The associated user session is removed server-side. Issued by <code>/join</code> and only known to
                the joined client.
            </>
        ),
    },
];

export default signOutTableData;
