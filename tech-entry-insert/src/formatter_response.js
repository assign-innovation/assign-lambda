const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};


exports.formatJSONResponseSuccess = (response) => {
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(response)
  };
};

exports.formatJSONResponseBadRequest = (response) => {
  return {
    statusCode: "400",
    headers: headers,
    body: JSON.stringify(response)
  };
};

exports.formatJSONResponseServerError = (response) => {
  return {
    statusCode: 500,
    headers: headers,
    body: JSON.stringify(response)
  };
};