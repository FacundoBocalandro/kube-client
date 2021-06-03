const PROTO_PATH = __dirname + '/../protobuf/catalogue-service.proto';
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


const catalogue_proto = grpc.loadPackageDefinition(packageDefinition);

function promisifyAll(client) {
    const to = {};
    for (var k in client) {
        if (typeof client[k] != 'function') continue;
        to[k] = promisify(client[k].bind(client));
    }
    return to;
}

const host = process.env.CATALOGUE_SERVICE_HOST ?? "localhost";
const port = process.env.CATALOGUE_SERVICE_PORT ?? 50001;
const client = promisifyAll(new catalogue_proto.catalogueservice.CatalogueService(`${host}:${port}`, grpc.credentials.createInsecure()))


async function getProductList(country) {
    return client.ProductList({country})
}

module.exports = getProductList
