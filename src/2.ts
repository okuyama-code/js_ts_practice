// function*（ジェネレータ関数）

function* countToThree() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = countToThree()
console.log(generator.next())
console.log(generator.next())
console.log(generator.next())
console.log(generator.next())