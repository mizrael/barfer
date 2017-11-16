import * as amqplib from 'amqplib';
import * as logger from './logger';
import { Message } from './message';
import { IChannelProvider } from './channelProvider';

export interface IPublisher {
    publish(task: Message);
}

export class Publisher implements IPublisher {
    constructor(private readonly channelProvider: IChannelProvider) { }

    public async publish(task: Message) {
        const jsonData = JSON.stringify(task),
            buffer = new Buffer(jsonData),
            ch = await this.channelProvider.get(),
            exchange = await ch.assertExchange(task.exchangeName, 'direct', { durable: true });

        logger.info("publishing message on exchange '" + task.exchangeName + "' : " + JSON.stringify(task));

        if (!ch.publish(task.exchangeName, task.routingKey, buffer, { persistent: true })) {
            logger.error("unable to publish message on exchange '" + task.exchangeName + "' with routing key'" + task.routingKey + "'");
        }
    }
}