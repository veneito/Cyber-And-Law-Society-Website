import assert from 'node:assert/strict';
import { correctFloor, correctItem } from '../shared/usb-location.mjs';
for (const value of ['2', '2nd floor', 'second floor', 'floor two', 'bird book 2nd floor']) assert.ok(correctFloor(value), value);
for (const value of ['', 'first floor', '12', '22nd']) assert.equal(correctFloor(value), false, value);
for (const value of ['book', 'big book', 'bird book', 'bird book 2nd floor', 'On the large book', 'BIRDS BOOK', 'libro grande']) assert.ok(correctItem(value), value);
for (const value of ['', 'desk', 'bookcase', 'bird cage']) assert.equal(correctItem(value), false, value);
console.log('USB directions checks passed.');
