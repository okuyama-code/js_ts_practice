const path = require('path')

console.log('basename:', path.basename('./dir/test.txt'))
console.log('dirname:', path.dirname('./dir/test.txt'))
console.log('extname:', path.extname('./dir/test.txt'))
console.log('parse:', path.parse('./dir/test.txt'))
console.log('join:', path.join('dir', 'dir2', 'test.txt'))
console.log('relative:', path.relative('./dir', './dir2/test.txt'))


// basename: test.txt
// dirname: ./dir
// extname: .txt
// parse: { root: '', dir: './dir', base: 'test.txt', ext: '.txt', name: 'test' }
// join: dir/dir2/test.txt
// relative: ../dir2/test.txt