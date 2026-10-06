import React from "react";

const learningDashboardTableData = [
    {
        name: "sessionToken",
        required: true,
        type: "String",
        description: (
            <>
                Session token identifying the user requesting the dashboard data. The user must have the <code>MODERATOR</code> role, the meeting must be running,
                and the <code>learningDashboard</code> feature must not be in <code>disabledFeatures</code>. Issued by <code>/join</code> and only known to the
                joined client.
            </>
        ),
    },
];

export default learningDashboardTableData;
