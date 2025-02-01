const trimText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const text1 = 'あけましておめでとうございます'
const text2 = 'ありがとう'

console.log(trimText(text1, 10))
console.log(trimText(text2, 8))