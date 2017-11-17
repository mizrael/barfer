import { expect } from 'chai';
import 'mocha';
import * as hashtagFinder from '../../../src/common/utils/hashtagFinder';

describe('hashtag finder', () => {
    it('search should return no results when input is string empty', () => {
        const results = hashtagFinder.search("");
        expect(results).not.to.be.null;
        expect(results.originalText).to.be.eq("");
        expect(results.hashTags).to.be.empty;
    });

    it('search should return no results when input is whitespaces', () => {
        const text = "    ",
            results = hashtagFinder.search(text);
        expect(results).not.to.be.null;
        expect(results.originalText).to.be.eq(text);
        expect(results.hashTags).to.be.empty;
    });

    it('search should return no results when input is null', () => {
        const results = hashtagFinder.search(null);
        expect(results).not.to.be.null;
        expect(results.originalText).to.be.eq("");
        expect(results.hashTags).to.be.empty;
    });

    it('search should return one result when input contains one hashtag', () => {
        const text = "lorem ipsum #dolor amet",
            results = hashtagFinder.search(text);
        expect(results).not.to.be.null;
        expect(results.originalText).to.be.eq(text);
        expect(results.hashTags).not.to.be.empty;
        expect(results.hashTags.length).to.be.eq(1);
        expect(results.hashTags[0].text).to.be.eq('#dolor');
        expect(results.hashTags[0].index).to.be.eq(11);
    });
});