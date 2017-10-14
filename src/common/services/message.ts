export class Message {
    constructor(public readonly exchangeName: string, public readonly routingKey: string, public readonly data: any) { }
}
