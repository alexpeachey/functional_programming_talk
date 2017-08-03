import RE from "xregexp";
import {pipe} from "./pipe";
import {match, $, _} from "./match";

const indentity = x => x;

const statusCode = (code) =>
  new Map([
    [200, "OK"],
    [400, "Bad Request"],
    [404, "Not Found"],
  ]).get(code);

const fullStatus = (code) => `${code} ${statusCode(code)}`;

const parseError = (input) => ({...input, status: 400});

const defaultProtocol = (input) => ([method, path]) => ({...input, method, path, protocol: "HTTP/1.0"});

const validRequest = (input) => ([method, path, protocol]) => ({...input, method, path, protocol});

const parseRequest = ({params, ...input}) => {
  const [method, queryString, protocol] = (input.request || "").split(" ");
  const [path, queryParams] = queryString.split("?");
  const query = parseForm({},{body: queryParams || ""}).params;
  const mergedParams = {...params, ...query};
  return match([
    [[undefined, _, _], () => parseError(input)],
    [[_, _, undefined], defaultProtocol({...input, params: mergedParams})],
    [[_, _, RE("HTTP/1\\.(0|1)")], validRequest({...input, params: mergedParams})],
    [_, parseError(input)]
  ])([method, path, protocol]);
}

const parseHeader = (header) => header.split(": ");

const tuplesToObject = (obj, [key, value]) => ({...obj, [key]: value});

const headerLinesToHeadersObject = (input) => ({
  ...input,
  headers: input.headerLines
                .map(parseHeader)
                .reduce(tuplesToObject, {})
});

const parseHeaders = match([
  [{status: _}, indentity],
  [_, headerLinesToHeadersObject]
]);

const parseForm = (input, {body}) => {
  if (body.lengh === 0)
    return input;
  try {
    const form = body.replace(/^\s+|\s+$/g, "")
                     .split("&")
                     .map(v => v.split("=").map(decodeURIComponent))
                     .reduce(tuplesToObject, {});
    return {
      ...input,
      params: {...input.params, ...form}
    };
  } catch(e) {
    return {...input, status: 400};
  }
};

const parseJSON = (input, {body}) => {
  if (body.lengh === 0)
    return input;
  try {
    const json = JSON.parse(body);
    return {
      ...input,
      params: {...input.params, ...json}
    };
  } catch(e) {
    return {...input, status: 400};
  }
};

const parseBody = match([
  [{status: _}, indentity],
  [{headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: $("body")}, parseForm],
  [{headers: {"Content-Type": "application/json"}, body: $("body")}, parseJSON],
  [_, indentity]
]);

const parse = (input) => {
  const [top, body] = input.split("\n\n");
  const [request, ...headerLines] = top.split("\n");
  return pipe(
    parseRequest,
    parseHeaders,
    parseBody
  )({request, headerLines, body, respBody: "", params: {}});
};

const notFound = (input) => ({...input, status: 404, respBody: "<html><head><title>404: Not Found</title></head><body><h2>Sorry, not sure how to get you that content.</h2></body></html>"});

const parsePathParams = (action) =>
  (input, params) => action({...input, params: {...input.params, ...params}});

const home = (input) => ({...input, status: 200, respBody: "<html><head><title>Hello World</title></head><body><h1>Hello World!</h1></body></html>"});

const showProject = (input) => ({...input, status: 200, respBody: `<html><head><title>Project Detail</title></head><body><h1>Project</h1><h3>This project has an id of ${input.params.id}</h3></body></html>`});

const route = match([
  [{status: _}, indentity],
  [{method: "GET", path: "/"}, parsePathParams(home)],
  [{method: "GET", path: RE("/projects/(?<id>\\d+)")}, parsePathParams(showProject)],
  [_, notFound]
]);

const respContentType = match([
  ["application/json", indentity],
  [_, () => "text/html"]
]);

const addResponseHeaders = (input) => ({
  ...input,
  respHeaders: {
    Date: new Date(),
    "Content-Type": respContentType(input.headers["Content-Type"]),
    charset: "UTF-8",
    "Content-Encoding": "UTF-8",
    "Content-Length": input.respBody.length,
    Connection: "close",
  }
});

const objectToHeaderLines = (obj) => (result, key) => `${result}${key}: ${obj[key]}\n`;

const renderResponseHeaders = (input) =>
  Object.keys(input.respHeaders).reduce(objectToHeaderLines(input.respHeaders), "");

const render = (input) =>
  `HTTP1.1 ${fullStatus(input.status)}\n` +
  renderResponseHeaders(addResponseHeaders(input)) +
  `\n${input.respBody}`;

export const http = pipe(
  parse,
  route,
  render
);

export const example1 = "POST /collector.cgi HTTP/1.1\nUser-Agent: TestBrowser\nHost: example.com\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 17\nAccept-Language: en-us\nAccept-Encoding: gzip, deflate\nConnection: Keep-Alive\n\nname=alex&age=42\n";
export const example2 = "POST /collector.cgi HTTP/1.1\nUser-Agent: TestBrowser\nHost: example.com\nContent-Type: application/json\nContent-Length: 17\nAccept-Language: en-us\nAccept-Encoding: gzip, deflate\nConnection: Keep-Alive\n\n{\"name\":\"alex\",\"age\":42}\n";

/* Request Message Format

------------------------------------
GET /info.html HTTP/1.1
User-Agent: TestBrowser
Host: example.com
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

------------------------------------

------------------------------------
POST /collector.cgi HTTP/1.1
User-Agent: TestBrowser
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: xxx
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

name=alex&age=42
------------------------------------

------------------------------------
POST /collector.cgi HTTP/1.1
User-Agent: TestBrowser
Host: example.com
Content-Type: application/json
Content-Length: xxx
Accept-Language: en-us
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

{"name":"alex","age":42}
------------------------------------

*/

/* Response Message Format

------------------------------------
HTTP/1.1 200 OK
Date: Mon, 31 July 2017 10:42:23 GMT
Content-Type: text/html; charset=UTF-8
Content-Encoding: UTF-8
Content-Length: xxx
Last-Modified: Mon, 31 July 2017 10:42:23 GMT
Connection: close

<html>
<head>
  <title>Hello World</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
------------------------------------

*/
