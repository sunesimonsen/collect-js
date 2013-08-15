/*global describe, it*/
var expect = require('unexpected');
var collect = require(__dirname + '/../lib/collect.js');

describe('collect.js', function () {
    var store = {
        store: {
            book: [
                { category: "reference",
                  author: "Nigel Rees",
                  title: "Sayings of the Century",
                  price: 8.95
                },
                { category: "fiction",
                  author: "Evelyn Waugh",
                  title: "Sword of Honour",
                  price: 12.99
                },
                { category: "fiction",
                  author: "Herman Melville",
                  title: "Moby Dick",
                  isbn: "0-553-21311-3",
                  price: 8.99
                },
                { category: "fiction",
                  author: "J. R. R. Tolkien",
                  title: "The Lord of the Rings",
                  isbn: "0-395-19395-8",
                  price: 22.99
                },
                { category: "programming",
                  author: ["Andrew Hunt", "David Thomas"],
                  title: "The Pragmatic Programmer: From Journeyman to Master",
                  isbn: "0-201-61622-X",
                  price: 33.68
                }
            ],
            bicycle: {
                color: "red",
                price: 19.95
            }
        }
    };

    describe('basic querying', function () {
        it('returns an empty list when query is null', function () {
            var result = collect(null, store);
            expect(result, 'to be empty');
        });

        it('returns an empty list for query: foo.bar', function () {
            var result = collect('foo.bar', store);
            expect(result, 'to be empty');
        });

        it('returns an empty list for query: ..bar', function () {
            var result = collect('foo.bar', store);
            expect(result, 'to be empty');
        });

        it('returns all matches for query: store', function () {
            var result = collect('store', store);
            expect(result, 'to equal', [store.store]);
        });

        it('returns all matches for query: .store', function () {
            var result = collect('.store', store);
            expect(result, 'to equal', [store.store]);
        });

        it('returns all matches for query: store.book', function () {
            var result = collect('store.book', store);
            expect(result, 'to equal', store.store.book);
        });

        it('returns all matches for query: store.bicycle', function () {
            var result = collect('store.bicycle', store);
            expect(result, 'to equal', [store.store.bicycle]);
        });

        it('returns all matches for query: store.book.isbn', function () {
            var result = collect('store.book.isbn', store);
            expect(result, 'to equal', ["0-553-21311-3", "0-395-19395-8", "0-201-61622-X"]);
        });

        it('returns all matches for query: store..isbn', function () {
            var result = collect('store..isbn', store);
            expect(result, 'to equal', ["0-553-21311-3", "0-395-19395-8", "0-201-61622-X"]);
        });

        it('returns all matches for query: ..isbn', function () {
            var result = collect('store..isbn', store);
            expect(result, 'to equal', ["0-553-21311-3", "0-395-19395-8", "0-201-61622-X"]);
        });

        it('returns all matches for query: ..book.isbn', function () {
            var result = collect('..book.isbn', store);
            expect(result, 'to equal', ["0-553-21311-3", "0-395-19395-8", "0-201-61622-X"]);
        });

        it('returns all matches for query: store..price', function () {
            var result = collect('store..price', store);
            expect(result, 'to equal', [8.95, 12.99, 8.99, 22.99, 33.68, 19.95]);
        });

        it('returns all matches for query: ..book', function () {
            var result = collect('..book', store);
            expect(result, 'to equal', store.store.book);
        });

        it('returns all matches for query: ..book.price', function () {
            var result = collect('..book.price', store);
            expect(result, 'to equal', [8.95, 12.99, 8.99, 22.99, 33.68]);
        });

        it('returns all matches for query: ..store', function () {
            var result = collect('..store', store);
            expect(result, 'to equal', [store.store]);
        });
    });

    describe('having', function () {
        it('returns entries where the given query has one or more matches', function () {
            var result = collect('..book', store).filter(function (book) {
                return collect('isbn', book).length > 0;
            });
            expect(result, 'to equal', [
                store.store.book[2],
                store.store.book[3],
                store.store.book[4]
            ]);
        });
    });

    describe('without', function () {
        it('returns entries where the given query does not return any matches', function () {
            var result = collect('..book', store).filter(function (book) {
                return collect('isbn', book).length === 0;
            });
            expect(result, 'to equal', [
                store.store.book[0],
                store.store.book[1]
            ]);
        });
    });

    describe('contains', function () {
        it('returns true if the results contains the given object', function () {
            var authors = collect('..author', store);
            expect(authors, 'to contain', 'David Thomas');
            expect(authors, 'to contain', 'J. R. R. Tolkien');
        });

        it('returns false if the results does not contain the given object', function () {
            var authors = collect('..author', store);
            expect(authors, 'to not contain', 'Robert C. Martin');
        });
    });

    describe('filter', function () {
        it('filters the result by the given predicate', function () {
            var result = collect('..book', store).filter(function (book) {
                return book.price < 10;
            });
            expect(result, 'to equal', [
                store.store.book[0],
                store.store.book[2]
            ]);
        });

        it('can find all books with more than one author', function () {
            var result = collect('..book', store).filter(function (book) {
                return collect("author", book).length > 1;
            });
            expect(result, 'to equal', [
                store.store.book[4]
            ]);
        });
    });
});
