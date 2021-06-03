const PROTO_PATH = __dirname + '/../protobuf/auth-service.proto';
const {promisify} = require('util');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
    });


const auth_proto = grpc.loadPackageDefinition(packageDefinition);

function promisifyAll(client) {
    const to = {};
    for (var k in client) {
        if (typeof client[k] != 'function') continue;
        to[k] = promisify(client[k].bind(client));
    }
    return to;
}

const host = process.env.AUTH_SERVICE_HOST ?? "localhost";
const port = process.env.AUTH_SERVICE_PORT ?? 50000;
const client = promisifyAll(new auth_proto.AuthService(`${host}:${port}`, grpc.credentials.createInsecure()))


async function loginRequest(email, password) {
    return client.Authentication({email, password})
}

module.exports = loginRequest
