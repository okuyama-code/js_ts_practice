const createOneDayCourses = async (courses: string[]) => {
  await Promise.all(
    courses.map(
      async (courseName, index) => {
        console.log(`コース ${index + 1}:`, courseName);
        // ここに実際のコース作成ロジックが入ります
      }
    )
  );
};

// 使用例
const courseNames = [
  "JavaScript入門",
  "Python上級プログラミング",
  "Reactを使用したWeb開発",
  "データサイエンスの基礎",
  "Flutterを使用したモバイルアプリ開発"
];

createOneDayCourses(courseNames);