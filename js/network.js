export async function postData(endpoint, argument, body, returnText = false) {
    // Default options are marked with *
    const response = await fetch(`http://localhost:3000/${endpoint}/${argument}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body), // body data type must match "Content-Type" header
    });

    return returnText ? response.text() : response.status;
}

export async function deleteData(endpoint, argument, body) {
    // Default options are marked with *
    const response = await fetch(`http://localhost:3000/${endpoint}/${argument}`, {
        method: "DELETE", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body), // body data type must match "Content-Type" header
    });

    return response.status;
}

export async function patchData(endpoint, argument, body) {
    // Default options are marked with *
    const response = await fetch(`http://localhost:3000/${endpoint}/${argument}`, {
        method: "PATCH", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body), // body data type must match "Content-Type" header
    });

    return response.status;
}

export async function getData(endpoint, argument) {
    // Default options are marked with *
    console.log(`localhost:3000/${endpoint}/${argument}`);
    const response = await fetch(`http://localhost:3000/${endpoint}/${argument}`, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });

    return response.json();
}



