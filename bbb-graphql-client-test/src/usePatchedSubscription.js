import {useSubscription} from "@apollo/client";
import {useEffect, useState} from "react";
import {applyPatch} from "fast-json-patch";

export default function usePatchedSubscription(subscriptionGQL, options) {
    const { loading, error, data } = useSubscription(subscriptionGQL, options);
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
