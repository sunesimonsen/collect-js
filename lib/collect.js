// Copyright 2013 Sune Simonsen
// https://github.com/sunesimonsen/factory.js
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var root = this;

(function () {
    function ChildQuery(fieldName) {
        this.fieldName = fieldName;
    }

    ChildQuery.prototype.exec = function (roots) {
        var that = this;
        var results = [];
        roots.forEach(function (root) {
            var field = root && root[that.fieldName];
            if (field) {
                results = results.concat(field);
            }
        });
        return results;
    };

    function DescendantsQuery(fieldName) {
        this.fieldName = fieldName;
    }

    DescendantsQuery.prototype.exec = function (roots) {
        var that = this;
        var fieldName = this.fieldName;
        var results = [];
        roots.filter(function (root) {
            return typeof root === 'object';
        }).forEach(function (root) {
            Object.keys(root).forEach(function (key) {
                var field = root[key];
                if (key === fieldName) {
                    results = results.concat(field);
                } else {
                    results = results.concat(that.exec([].concat(field)));
                }
            });
        });
        return results;
    };


    function parseQuery(query) {
        var regex = /(^|\.|\.\.)(\w+)/g;
        var parts = [];
        var match = null;
        while ((match = regex.exec(query))) {
            var field = match[2];
            if (match[1] === '..') {
                parts.push(new DescendantsQuery(field));
            } else {
                parts.push(new ChildQuery(field));
            }
        }
        return parts;
    }

    function collect(query, data) {
        var queryParts = parseQuery(query);
        if (queryParts.length === 0) {
            return [];
        }

        var results = [].concat(data);
        queryParts.forEach(function (queryPart) {
            results = queryPart.exec(results);
        });
        return results;
    }


    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js
        module.exports = collect;
        exports.collect = collect;
    } else if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(function () {
            return collect;
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        root.weknowhow = {
            collect: collect
        };
    }
}());