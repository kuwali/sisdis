'use strict'

const net = require('net');
const fs = require('fs');

const HOST = '0.0.0.0';
const PORT = 9000; // Change port here

const server = net.createServer(socket => {
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    processRequest(socket, data);
  });

  socket.on('end', () => {
    socket.end();
  });

  socket.on('timeout', () => {
    fs.appendFileSync('log.txt', `${socket.remoteAddress} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Request timed out.`);
  });
}).listen(PORT, HOST);

console.log(`Server listening on ${HOST}:${PORT}`);

const processRequest = (socket, data) => {
  data = data.split('\r\n');
  
  const header = {};
  header['method'] = data[0].split(' ');
  header['method'][1] = header['method'][1].split('?');
  
  for (let i = 1; i < data.length - 1; i++) {
    const item = data[i].split(': ', 2);
    header[item[0].toLowerCase()] = item[1];
  }
  header['post'] = data[data.length - 1].split('=');
  
  fs.appendFileSync('log.txt', `${socket.remoteAddress} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - ${JSON.stringify(header)}`);
  
  let response = checkError(header);
  if (!response.success) {
    return responseError(socket, response);
  }

  processRequestBody(socket, header);
};

const checkError = (header) => {
  let response = checkFirstHeader(header);
  if (!response.success) {
    return response;
  }
  
  response = checkBodyHeader(header);
  if (!response.success) {
    return response;
  }
  
  return { success: true };
}

const checkFirstHeader = (header) => {
  if (header.length === 0) {
    return { success: false, error: 'badrequest', message: 'Empty Request' };
  } else if (header['method'].length !== 3) {
    return { success: false, error: 'badrequest', message: 'Invalid HTTP request' };
  } else if (header['method'][2] !== 'HTTP/1.1' && header['method'][2] !== 'HTTP/1.0') {
    return { success: false, error: 'badrequest', message: 'Only support HTTP/1.0 and HTTP/1.1' };
  } else if (header['method'][0] !== 'GET' && header['method'][0] !== 'POST') {
    return { success: false, error: 'notimplemented', message: header[0][0] };
  } else {
    return { success: true };
  }
}

const checkBodyHeader = (header) => {
  if (header['method'][0] === 'POST') {
    if (!('content-type' in header)) {
      return { success: false, error: 'badrequest', message: 'can not parse Content-Type' }
    }
    
    if (!('content-length' in header)) {
      return { success: false, error: 'badrequest', message: 'can not parse Content-Length' }
    } else {
      try {
        const param = Number(header['content-length'].trim());
      } catch (e) {
        return { success: false, error: 'badrequest', message: 'can not parse Content-Length as integer value' }
      }
    }
  }
  
  return { success: true };
}

const responseError = (socket, response) => {
  switch (response.error) {
    case 'badrequest':
      return responseBadRequest(socket, response.message);
    case 'notimplemented':
      return responseNotImplemented(socket, response.message);
    case 'notfound':
      return responseNotImplemented(socket);
    default:
      return responseNotImplemented(socket);
  }
}

const processRequestBody = (socket, header) => {
  switch (header['method'][1][0]) {
    case '/':
      return responseRedirect(socket, '/hello-world');
    case '/hello-world':
      return fs.readFile('./hello-world.html', (err, html) => {
        if (err) {
          return responseNotFound(socket);
        }
        if (header['method'][0] === 'GET') {
          html = html.toString().replace('__HELLO__', 'World');
          
          return responseOk(socket, 'text/html; charset=UTF-8', html);
        } else if (header['method'][0] === 'POST') {
          if (header['post'][0] === 'name') {
            html = html.toString().replace('__HELLO__', header['post'][1]);
            
            return responseOk(socket, 'text/html; charset=UTF-8', html);
          }
          
          return responseNotFound(socket);
        }
      });
    case '/style':
      return fs.readFile('./style.css', (err, css) => {
        if (err) {
          return responseNotFound(socket);
        }
        if (header['method'][0] === 'GET') {
          return responseOk(socket, 'text/css; charset=UTF-8', css);
        }
      });
    case '/background':
      return fs.readFile('./background.jpg', (err, image) => {
        if (err) {
          return responseNotFound(socket);
        }
        if (header['method'][0] === 'GET') {
          return responseOk(socket, 'image/jpeg; charset=UTF-8', image);
        }
      });
    case '/info':
      if (header['method'][1][1] === 'type=time') {
        return responseOk(socket, 'text/plain; charset=UTF-8', new Date().toString());
      } else if (header['method'][1][1] === 'type=random') {
        return responseOk(socket, 'text/plain; charset=UTF-8', Math.random().toString());
      } else {
        return responseOk(socket, 'text/plain; charset=UTF-8', 'No Data');
      }
    default:
      return responseNotFound(socket);
  }
  responseOk(socket, 'text/plain; charset=UTF-8', new Date().toString());
}

const responseOk = (socket, contentType, content) => {
  socket.write(`HTTP/1.1 200 OK\r\nConnection: close\r\nContent-Type: ${contentType}\r\nContent-Length: ${content.length}\r\n\r\n`);
  socket.write(content);
};

const responseRedirect = (socket, redirectLocation) => {
  socket.write(`HTTP/1.1 302 Found\r\nConnection: close\r\nLocation: ${redirectLocation}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Length: ${21 + redirectLocation.length}\r\n\r\n302 Found: Location: ${redirectLocation}`);
}

const responseBadRequest = (socket, reason) => {
  socket.write(`HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Length: ${25 + reason.length}\r\n\r\n400 Bad Request: Reason: ${reason}`);
}

const responseNotImplemented = (socket, reason) => {
  socket.write(`HTTP/1.1 501 Not Implemented\r\nConnection: close\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Length: ${29 + reason.length}\r\n\r\n501 Not Implemented: Reason: ${reason}`);
}

const responseNotFound = socket => {
  socket.write(`HTTP/1.1 404 Not Found\r\nConnection: close\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Length: 13\r\n\r\n404 Not Found`);
}