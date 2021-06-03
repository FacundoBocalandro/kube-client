const PROTO_PATH = __dirname + '/../protobuf/geo-service.proto';
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


const geo_proto = grpc.loadPackageDefinition(packageDefinition);

function promisifyAll(client) {
    const to = {};
    for (var k in client) {
        if (typeof client[k] != 'function') continue;
        to[k] = promisify(client[k].bind(client));
    }
    return to;
}

const host = process.env.GEO_SERVICE_HOST ?? "localhost";
const port = process.env.GEO_SERVICE_PORT ?? 50002;
const client = promisifyAll(new geo_proto.geoservice.GeoService(`${host}:${port}`, grpc.credentials.createInsecure()))


async function countryByIp(ip) {
    return client.CountryAndProvinceByIP({ip})
        .then(res => res.country)
}

module.exports = countryByIp
