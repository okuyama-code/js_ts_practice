interface Person {
  name: string;
  age: number;
  isStudent: boolean;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  console.log(`obj: ${obj}, key: ${String(key)}, obj[key]: ${obj[key]}`)
  return obj[key]
}

const person: Person = { name: "Alice", age: 30, isStudent: false }

getProperty(person, "name")
getProperty(person, "age")
getProperty(person, "isStudent")