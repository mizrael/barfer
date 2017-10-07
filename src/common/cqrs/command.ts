export interface ICommand { }

export interface ICommandHandler<T extends ICommand> {
    handle<T>(T): Promise<void>;
}