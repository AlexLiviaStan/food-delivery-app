
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

        // const kafkaWrapper = new KafkaWrapper(process.env.KAFKA_CREDENTIALS)
         //brokers = 'broker-0-b1392rt9v4gd0bpb.kafka.svc10.us-south.eventstreams.cloud.ibm.com:9093'
         //password = '7qs10VpEP8MvpWny4ZQQv55_VEo6f8ZPjFD7QHZrPqwO'
         //username = 'token'
         //mechanism = 'PLAIN'

         /*console.log('KAFKA_BOOTSTRAP_SERVERS '+ process.env.KAFKA_BOOTSTRAP_SERVERS);

         console.log('KAFKA_SECURITY_PROTOCOL'+ process.env.KAFKA_SECURITY_PROTOCOL);

         console.log('KAFKA_SECURITY_MECHANISM '+ process.env.KAFKA_SASL_MECHANISMS);

         console.log('KAFKA_SASL_USERNAME '+ process.env.KAFKA_SASL_USERNAME);

         console.log('KAFKA_SASL_PASSWORD '+ process.env.KAFKA_SASL_PASSWORD);
        */



        let driver_options = {
            //'debug': 'all',
            'metadata.broker.list': brokers,
            'security.protocol': protocol,
            'sasl.mechanisms': mechanism,
            'sasl.username': username,
            'sasl.password': password,
            'log.connection.close' : false,
            'enable.auto.commit': false,
            'statistics.interval.ms': 1000,
            'ssl.ca.location': '/etc/ssl/certs'
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

const kafkaWrapper = new KafkaWrapper(process.env.KAFKA_BOOTSTRAP_SERVERS,
                                      process.env.KAFKA_SECURITY_PROTOCOL,
                                      process.env.KAFKA_SASL_MECHANISMS,
                                      process.env.KAFKA_SASL_USERNAME,
                                      process.env.KAFKA_SASL_PASSWORD)
Object.freeze(kafkaWrapper)

module.exports = kafkaWrapper
