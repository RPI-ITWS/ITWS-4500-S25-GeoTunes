export async function post(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    // credentials: 'include', TODO: change cors policy in production so that this line can be used
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
