const Kafka = require('node-rdkafka');

const { Kafka: KafkaJS } = require('kafkajs')

class KafkaWrapper {
    constructor(brokers, protocol, mechanism, username, password) {
        // ibm cloud service credentials
        // let jsonCredentials = JSON.parse(ibmcloud_credentials)
        // let brokers = jsonCredentials.kafka_brokers_sasl
        // let apiKey = jsonCredentials.api_key
        // producer
        // let driver_options = {
        //     //'debug': 'all',
        //     'metadata.broker.list': brokers,
        //     'security.protocol': 'SASL_SSL',
        //     'sasl.mechanisms': 'PLAIN',
        //     'sasl.username': 'token',
        //     'sasl.password': apiKey,
        //     'log.connection.close' : false,
        //     'enable.auto.commit': false,
        //     'statistics.interval.ms': 1000
        // };
        let driver_options = {
            //'debug': 'all',
            'metadata.broker.list': brokers,
            'security.protocol': 'SASL_SSL',
            'sasl.mechanisms': mechanism,
            'sasl.username': username,
            'sasl.password': password,
            'log.connection.close' : false,
            'enable.auto.commit': false,
            'statistics.interval.ms': 1000
        };
        let consumerConfig = {
            'client.id': 'realtimedata-consumer',
            'group.id': 'realtimedata-consumer-group',
        }

        for (var key in driver_options) {
            consumerConfig[key] = driver_options[key]
        }

        // create kafka consumer
        let topicConfig = {
            'auto.offset.reset': 'earliest'
        }
        let consumer = new Kafka.KafkaConsumer(consumerConfig, topicConfig)

        // Register error listener
        consumer.on('event.error', function(err) {
            console.error('Error from consumer:' + JSON.stringify(err));
        });
        let prevCommitted = 0
        // Register stats listener
        // consumer.on('event.stats', function(log) {
        //     console.log('Log from consumer:');
        //     console.log(JSON.parse(log.message))

        //     let stats = JSON.parse(log.message)
        //     // console.log(stats)
        //     if (stats.topics['orders']) {
        //         let partitionStats = stats.topics.orders.partitions['0']
        //         // console.log(stats.topics.orders.partitions['0'])
        //         let commitPerSecond = 0
        //         if (prevCommitted) {
        //             commitPerSecond = partitionStats.committed_offset - prevCommitted
        //         }
        //         if (partitionStats.consumer_lag) {
        //             // console.log('consumer lag: ' + partitionStats.consumer_lag)
        //         }
        //         // console.log(commitPerSecond)
        //         prevCommitted = partitionStats.committed_offset
        //     }
        // });

        this.consumer = consumer

        // KafkaJS admin client
        let adminKafka = new KafkaJS({
            clientId: 'admin',
            brokers: brokers.split(','),
            ssl: true,
            sasl: {
                mechanism,
                username,
                password
            }

        }).admin()
        this.admin = adminKafka
    }

    on(event, callback) {
      this.consumer.on(event, callback)
    }
}
// const kafkaWrapper = new KafkaWrapper(process.env.KAFKA_CREDENTIALS)
const bootstrap_servers_1 = 'broker-0-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093,broker-5-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093,broker-1-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093,broker-2-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093,broker-3-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093,broker-4-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093'
const password = '7qs10VpEP8MvpWny4ZQQv55_VEo6f8ZPjFD7QHZrPqwO'
const username = 'token'
const mechanism = 'plain'
const kafkaWrapper = new KafkaWrapper(//process.env.BOOTSTRAP_SERVERS,
                                      bootstrap_servers_1,
                                      process.env.SECURITY_PROTOCOL,
                                      mechanism//process.env.SASL_MECHANISMS
                                      ,
                                      username,
                                      //process.env.SASL_USERNAME,
                                      password//process.env.SASL_PASSWORD
                                    )
Object.freeze(kafkaWrapper)

module.exports = kafkaWrapper
