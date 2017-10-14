export interface ICommand { }

export interface ICommandHandler<T extends ICommand> {
    handle(command: T): Promise<void>;
}