import {gql, useSubscription} from "@apollo/client";
import {useEffect, useState} from "react";
import {applyPatch} from "fast-json-patch";

export default function usePatchedSubscription(subscriptionGQL, options) {
    //Prepend `Patched_` to the query operationName to inform the middleware that this subscription support json patch
    //It will also set {fetchPolicy: 'no-cache'} because the cache would not work properly when using json-patch
    const newQueryString = subscriptionGQL.loc.source.body.replace(/subscription\s+(.*)\{/g, 'subscription Patched_$1 {');
    const newSubscriptionGQL = gql`${newQueryString}`;

    const { loading, error, data } = useSubscription(
        newSubscriptionGQL,
        {...options, fetchPolicy: 'no-cache'}
    );
    const [currentData, setCurrentData] = useState([]);

    useEffect(() => {
        if (data) {
            if (data.patch) {
                const patchedData = applyPatch(currentData, data.patch).newDocument;
                setCurrentData([...patchedData]);
            } else {
                for(let i in data) {
                    setCurrentData(data[i]);
                }
            }
        }
    }, [data]);

    return { loading, error, data: currentData };
}
