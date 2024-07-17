const KafkaWrapper = require('./KafkaWrapper.js')
const Redis = require('ioredis');
const express = require('express');
const app = express();
const cors = require('cors');




// connect to redis localhost

console.log(`REDIS URL ${process.env.REDIS_URL}`);
console.log(`REDIS listening on port ${process.env.REDIS_PORT}`);


/*const redis = new Redis({
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
    db: 0
})
*/
const redis = new Redis({
    host: '693e81c7-f7ba-4235-9817-8b008b66ae17.c7e0lq3d0hm8lbg600bg.databases.appdomain.cloud',
    port: '31489',
    tls: {
        ca: 'redis.pm',
        rejectUnauthorized: false,
    },
    username: 'ibm_cloud_82f74f1f_517a_4adf_8800_d452ad5da6f3',
    password: '5e6ab628d2e9a5b174aa36e3b5ed2e6cbccd2f022aea61a2a6ead8b278dbb31a',
    db: 0
})
console.log(`Redis setup done`);


const PORT = process.env.PORT || 8080

app.use(express.json());
app.use(cors())

app.get("/status/:requestId", (req, res) => {
    console.log(`Get status: ${req.params.requestId}`);
    let requestId = req.params.requestId
    redis.get(requestId).then(result => {
        res.status('200').send(JSON.parse(result))
    }).catch(err => {
        console.log(err)
        res.status('404').send(err)
    })
})

app.post("/status/:requestId", (req, res) => {
    console.log(`Post status: ${req.params.requestId}`);
    let requestId = req.params.requestId
    let value = req.body.value
    redis.get(requestId).then(result => {
        if (!result) {
            redis.set(requestId, value, 'EX', 3600)
        }
    }).catch(err => {
        console.log(err)
    })
    res.status('200').send('OK')
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

KafkaWrapper.consumer.on('ready', function() {
    console.log('The consumer has connected.');
    KafkaWrapper.consumer.subscribe(['orders']);
    KafkaWrapper.consumer.consume()
}).on('data', function(data) {
    try {
        let dataObject = JSON.parse(data.value.toString())
        // dataObject
        // {eventType, payload: {requestId, message}}
        let eventType = dataObject.eventType
        let payload = dataObject.payload
        switch (eventType) {
            case "updateHttpResponse":
                redis.set(payload.requestId, payload.message, 'EX', 3600)
                KafkaWrapper.consumer.commitMessage(data)
                break;
            default:
                // console.log(`${dataObject.eventType} is not handled in this service`)
                KafkaWrapper.consumer.commitMessage(data)
        }
    } catch (err) {
        console.error(err)
        // add error response to redis
        KafkaWrapper.consumer.commitMessage(data)
    }
});

KafkaWrapper.consumer.connect()
// KafkaWrapper.producer.on('ready', () => {
//     console.log('The producer has connected.')
//     KafkaWrapper.consumer.connect()
// })
