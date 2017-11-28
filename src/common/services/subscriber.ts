import * as amqplib from 'amqplib';
import { Message } from './message';
import * as logger from './logger';
import { IChannelProvider } from './channelProvider';

export class SubscriberOptions {
    constructor(public readonly exchangeName: string,
        public readonly routingKey: string,
        public readonly onMessage: (t: Message) => Promise<void>) { }
}

export interface ISubscriber {

}

export class Subscriber implements ISubscriber {
    constructor(private readonly channelProvider: IChannelProvider, options: SubscriberOptions) {
        this.register(options);
    }

    private async register(options: SubscriberOptions) {
        const ch = await this.channelProvider.get(),
            exchange = await ch.assertExchange(options.exchangeName, 'direct', { durable: true }),
            queue = await ch.assertQueue('', { exclusive: true });

        await ch.bindQueue(queue.queue, options.exchangeName, options.routingKey);

        return ch.consume(queue.queue, (msg: amqplib.Message) => {
            if (!msg || !msg.content) {
                logger.warning("empty message received");
                return;
            }

            const msgData = msg.content.toString(),
                task = JSON.parse(msgData) as Message;

            logger.info("new message received on queue '" + queue.queue + "' : " + JSON.stringify(task));

            options.onMessage(task).then(() => {
                ch.ack(msg);
            }).catch(err => {
                logger.error("task failed: " + JSON.stringify(task) + " for reason: " + JSON.stringify(err));
            });
        }, { noAck: false });
    }
}

export interface ISubscriberFactory {
    build(options: SubscriberOptions): ISubscriber;
}

export class SubscriberFactory implements ISubscriberFactory {
    constructor(private readonly channelProvider: IChannelProvider) { }

    public build(options: SubscriberOptions): ISubscriber {
        return new Subscriber(this.channelProvider, options);
    }
}