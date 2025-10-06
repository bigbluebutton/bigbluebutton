import React from "react";

const getJoinUrlTableData = [
    {
        name: "replaceSession",
        required: false,
        type: "Boolean",
        default: "false",
        description: <>When set to `true`, using the newly generated join URL will immediately invalidate the original session.</>,
    },
    {
        name: "sessionName",
        required: false,
        type: "String",
        description: (
            <>
                Assign a descriptive name to the newly created session. Allowing to quickly understand the session’s origin or purpose when reviewing the user's
                session history.
            </>
        ),
    },
    {
        name: "enforceLayout",
        required: false,
        type: "String",
        description: (
            <>
                Specify a layout enforcement setting for the new session. If provided, this overrides the `enforceLayout` parameter inherited from the original
                user's session. If not specified, the new session inherits the layout behavior of the original session.
            </>
        ),
    },
    {
        name: "userdata-*",
        required: false,
        type: "String",
        description: (
            <>
                Include additional user data parameters prefixed with userdata-. These parameters will merge with the original user's existing userdata
                settings. In cases where the same parameter is defined both in the original and the new session, the new session's parameter takes precedence.
                The list of blocked parameters for viewers can be configured using the config `getJoinUrlUserdataBlocklist` at `bbb-web.properties`.
            </>
        ),
    },
];

export default getJoinUrlTableData;
