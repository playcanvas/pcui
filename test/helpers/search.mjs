import { describe, it } from 'node:test';
import { strictEqual, deepStrictEqual } from 'assert';
import { searchItems } from '../../dist/module/src/helpers/search.mjs';

describe('searchItems', () => {
    const items = [
        { text: 'Apple', id: 'item1' },
        { text: 'Banana', id: 'item2' },
        { text: 'Application', id: 'item3' },
        { text: 'Pineapple', id: 'item4' },
        { text: 'Grape', id: 'item5' }
    ];

    describe('basic matching', () => {
        it('should find exact matches and substring matches', () => {
            const results = searchItems(items, 'text', 'Apple');
            deepStrictEqual(results.map(r => r.id).sort(), ['item1', 'item4']);  // Apple and Pineapple
        });

        it('should be case insensitive', () => {
            const results = searchItems(items, 'text', 'apple');
            deepStrictEqual(results.map(r => r.id).sort(), ['item1', 'item4']);  // Apple and Pineapple
        });

        it('should find substring matches', () => {
            const results = searchItems(items, 'text', 'app');
            const ids = results.map(r => r.id);
            strictEqual(ids.includes('item1'), true); // Apple
            strictEqual(ids.includes('item3'), true); // Application
            strictEqual(ids.includes('item4'), true); // Pineapple
        });
    });

    describe('edit distance matching', () => {
        it('should find close matches', () => {
            const results = searchItems(items, 'text', 'aple', {
                editsDistanceTolerance: 0.5
            });
            const ids = results.map(r => r.id);
            strictEqual(ids.includes('item1'), true); // Apple
        });

        it('should respect editsDistanceTolerance', () => {
            const strictResults = searchItems(items, 'text', 'aple', {
                editsDistanceTolerance: 0.1
            });
            strictEqual(strictResults.length, 0, 'Should find no matches with strict tolerance');

            const looseResults = searchItems(items, 'text', 'aple', {
                editsDistanceTolerance: 0.8
            });
            strictEqual(looseResults.length > 0, true, 'Should find matches with loose tolerance');
        });
    });

    describe('character containment', () => {
        it('should respect containsCharsTolerance', () => {
            const strictResults = searchItems(items, 'text', 'apl', {
                containsCharsTolerance: 0.9
            });
            strictEqual(strictResults.length === 0, true, 'Should find no matches with strict tolerance');

            const looseResults = searchItems(items, 'text', 'apl', {
                containsCharsTolerance: 0.3
            });
            strictEqual(looseResults.length > 0, true, 'Should find matches with loose tolerance');
        });
    });

    describe('result limiting', () => {
        it('should limit number of results', () => {
            const results = searchItems(items, 'text', 'app', {
                limitResults: 2
            });
            strictEqual(results.length, 2);
        });
    });

    describe('edge cases', () => {
        it('should handle empty search string', () => {
            const results = searchItems(items, 'text', '');
            deepStrictEqual(results, []);
        });

        it('should handle empty items array', () => {
            const results = searchItems([], 'text', 'test');
            deepStrictEqual(results, []);
        });

        it('should handle whitespace', () => {
            const results = searchItems(items, 'text', '  Apple  ');
            deepStrictEqual(results.map(r => r.id).sort(), ['item1', 'item4']);  // Apple and Pineapple
        });
    });
});
