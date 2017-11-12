import * as amqplib from 'amqplib';
import * as logger from './logger';
import { Message } from './message';

export interface IPublisher {
    publish(task: Message);
}

export class Publisher implements IPublisher {
    constructor(private connStr: string) { }

    public publish(task: Message) {
        let jsonData = JSON.stringify(task),
            buffer = new Buffer(jsonData);

        amqplib.connect(this.connStr).then(conn => {
            conn.createChannel().then(ch => {
                ch.assertExchange(task.exchangeName, 'direct', { durable: true }).then(() => {
                    if (!ch.publish(task.exchangeName, task.routingKey, buffer, { persistent: true })) {
                        logger.error("unable to publish message on exchange '" + task.exchangeName + "' with routing key'" + task.routingKey + "'");
                    }

                    setTimeout(function () { conn.close(); }, 500);
                }).catch(err => {
                    logger.error("unable to connect to RabbitMQ exhange '" + task.exchangeName + "'", err);
                });
            }).catch(err => {
                logger.error("unable to connect to RabbitMQ channel", err);
            });
        }).catch(err => {
            logger.error("unable to connect to RabbitMQ instance", err);
        });
    }
}