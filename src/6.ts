// Promise.all の使い方


const simulateAsyncTask = (id: number, delay: number | undefined) => {
  console.log(`Task ${id} started`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${id} completed after ${delay}ms`);
      resolve(`Result from task ${id}`);
    }, delay)
  })
}

const runTasks = async () => {
  console.log("Starting all tasks...");
  const startTime = Date.now();

  try {
    const tasks = [
      simulateAsyncTask(1, 2000),
      simulateAsyncTask(2, 4000),
      simulateAsyncTask(3, 3000),
      simulateAsyncTask(4, 1000),
    ];

    const results = await Promise.all(tasks);

    const endTime = Date.now();
    console.log("All tasks completed!");
    console.log("Results:", results);
    console.log(`Total time: ${endTime - startTime}ms`);
  } catch (error) {
    console.error("An error occurred:", error)
  }
}

runTasks();