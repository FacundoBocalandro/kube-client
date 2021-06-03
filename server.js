const http = require('http');
const url = require('url');
const fs = require('fs');
const loginRequest = require("./utils/authClient");
const countryByIp = require("./utils/geoClient");
const getProductList = require("./utils/catalogueClient");

const SUCCESS = "SUCCESS";
const LOCALHOST_IP = "::1";

const getHtml = (country, products) => {
    console.log(products);
    return `<!doctype html><html><head></head><body><h1>Products for ${country.name}</h1><ul>${products.map(product => {
        return `<li>id: ${product.id}, name: ${product.name}, price: $${product.price}</li>`
    })}</ul></body></html>`
}

const server = http.createServer((request, response) => {
    if (request.method === 'POST' && request.url === "/login-request") {
        console.log('POST')
        let body = ""
        request.on('data', function (data) {
            body += data;
            const urlParams = new URLSearchParams(body);
            console.log("before auth")
            loginRequest(urlParams.get("email"), urlParams.get("password"))
                .then(res => {
                    if (res.status === SUCCESS) {
                        console.log("before country")
                        // const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
                        const ip = "152.168.96.71";
                        countryByIp(ip === LOCALHOST_IP ? "152.168.96.71" : ip)
                            .then(country => {
                                console.log("before products")
                                getProductList(country.name)
                                    .then(res => {
                                        response.writeHead(200, {'Content-Type': 'text/html'})
                                        response.write(getHtml(country, res.products))
                                        response.end(`Products for ${country.name}:\n ${products}`)
                                    })
                            })
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'})
                        response.end("Unauthorized")
                    }
                })
                .catch(err => {
                    response.writeHead(500, {'Content-Type': 'text/plain'})
                    response.end('Error interno: ' + err)
                })
        })
    } else {

        const objectUrl = url.parse(request.url);
        let path = 'static' + objectUrl.pathname;
        if (path === 'static/')
            path = 'static/index.html';
        fs.stat(path, error => {
            if (!error) {
                fs.readFile(path, (error, content) => {
                    if (error) {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.write('Error interno');
                        response.end();
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(content);
                        response.end();
                    }
                });
            } else {
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');
                response.end();
            }
        });
    }
});

server.listen(8080);
console.log("running...");
