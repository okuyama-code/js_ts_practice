type A<T> = T;
// Tは実際の方の定義

const moji: A<string> = 'moji';

const suji: A<number> = 1;

const f = <T>(arg: T): T => arg;

const result1 = f('Hello')
// const result2 = f<number>('123')


interface User {
  name: string;
  age: number;
}

const getAge = <T extends User>(arg: T): number => arg.age;

const user1: User = { name: 'Charlie', age: 30 };
const user2: User = { name: 'Dave', age: 25 };
const user3 = { age: 25 };

getAge(user1)
console.log(getAge(user1))

type Q<T> = T extends string ? string : never;

type B = Q<string>
type C = Q<number>
type D = Q<boolean>


type UserA = {
  name: string;
  role: 'admin'
}