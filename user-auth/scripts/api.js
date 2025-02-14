// public/scripts/api.js
export async function post(url, data) {
    const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies for HTTP-only JWT
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData } };
    }

    return response.json();
}

export default { post };
