const regex = /\W(\#[\S]+\b)/gm;

export interface HashTag {
    text: string;
    index: number;
}

export class HashTagMatches {
    public constructor(public readonly originalText: string, public readonly hashTags: Array<HashTag>) { }
}

export function search(text: string): HashTagMatches {
    text = text || '';

    const results: Array<HashTag> = [];

    let matches: RegExpExecArray;
    while ((matches = regex.exec(text)) !== null) {
        results.push({
            index: matches.index,
            text: matches.length > 0 ? matches[1] : matches[0]
        });
    }

    return new HashTagMatches(text, results);
}

export function replace(text: string, replacer: (substring: string, ...args: any[]) => string): string {
    const results = text.replace(regex, replacer);
    return results;
}