const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

export const formatJSONResponseSuccess = (response) => {
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(response),
  };
};

export const formatJSONResponseBadRequest = (response) => {
  return {
    statusCode: "400",
    headers: headers,
    body: JSON.stringify(response),
  };
};

export const formatJSONResponseServerError = (response) => {
  return {
    statusCode: 500,
    headers: headers,
    body: JSON.stringify(response),
  };
};
