async function request(method, url, body) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
        options.headers.Authorization = "Bearer " + token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        try {
            await refreshAccessToken();

            const newToken = localStorage.getItem("accessToken");
            if (newToken) {
                options.headers.Authorization = "Bearer " + newToken;
            }

            const retryResponse = await fetch(url, options);

            if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData;
            }

            if (retryResponse.status === 401) {
                forceLogout();
                return;
            }
            
            throw new Error("HTTP_ERROR_" + retryResponse.status);

        } catch (e) {
            forceLogout();
            return;
        }
    }

    if (!response.ok) {
        throw new Error("HTTP_ERROR_" + response.status);
    }

    const data = await response.json();

    if (data.result === "fail") {
        throw new Error(data.error.message);
    }

    return data;
};

const apiClient = {
    get(url) {
        return request("GET", url);
    },
    post(url, body) {
        return request("POST", url, body);
    },
    patch(url, body) {
        return request("PATCH", url, body);
    },
    delete(url) {
        return request("DELETE", url);
    }
}

async function refreshAccessToken() {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("REFRESH_FAILED");
    }

    const data = await response.json();
    const newAccessToken = data.data.accessToken;

    localStorage.setItem("accessToken", newAccessToken);

    return newAccessToken;
}

function forceLogout() {
    localStorage.removeItem("accessToken");
    window.location.href = "/login.html";
}
