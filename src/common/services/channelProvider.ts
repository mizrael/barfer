import * as amqplib from 'amqplib';
import * as logger from './logger';

export interface IChannelProvider {
    get(): Promise<amqplib.Channel>;
}

export class ChannelProvider implements IChannelProvider {
    private conn: amqplib.Connection = null;

    constructor(private connStr: string) { }

    public async get(): Promise<amqplib.Channel> {
        if (!this.conn) {
            await this.buildConnection();
        }

        return await this.conn.createChannel();
    }

    private async buildConnection() {
        this.conn = await amqplib.connect(this.connStr);

        this.conn.on("error", function (err) {
            if (err.message !== "Connection closing") {
                logger.error("[AMQP] conn error", err.message);
            }
        });

        this.conn.on("close", function () {
            logger.error("[AMQP] connection closed!");
            setTimeout(this.buildConnection, 1000);
        });
    }
}