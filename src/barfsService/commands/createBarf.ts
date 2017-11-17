import { ICommandHandler, ICommand } from "../../common/cqrs/command";
import { IPublisher } from "../../common/services/publisher";
import { Message } from "../../common/services/message";
import { Events, Exchanges } from "../../common/events";
import * as logger from '../../common/services/logger';
import * as xss from 'xss';

interface CreateBarfDto {
    id: string;
    text: string;
    authorId;
}

export class CreateBarf implements ICommand {
    constructor(public readonly id: string,
        public readonly text: string,
        public authorId: string) { }
}

export class CreateBarfCommandHandler implements ICommandHandler<CreateBarf>{
    constructor(private readonly publisher: IPublisher) { }

    handle(command: CreateBarf): Promise<void> {
        const dto = command as CreateBarfDto;
        dto.text = xss(dto.text);

        const task = new Message(Exchanges.Barfs, Events.BarfCreated, dto);
        this.publisher.publish(task);
        logger.info("published barf create command: " + JSON.stringify(dto));
        return Promise.resolve();
    }

}