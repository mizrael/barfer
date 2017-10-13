export class NumberUtils {
    static safeParseInt(text: string, defaultVal: number = 0): number {
        let value = parseInt(text);
        return Number.isSafeInteger(value) ? value : defaultVal;
    }
}


