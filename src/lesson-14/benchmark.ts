import { writeFileSync } from "node:fs";
import { indexOf, lastIndexOf } from "./index.ts";

function measureTime(fn: () => void, iterations: number): number {
  for (let i = 0; i < 10; i++) {
    fn();
  }

  const times: number[] = [];

  const batches = 10;
  for (let batch = 0; batch < batches; batch++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const trimmed = times.slice(2, -2);
  return trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length;
}

interface BenchmarkResult {
  testName: string;
  results: {
    arraySize: number;
    methods: {
      name: string;
      time: number;
      complexity: string;
      opsPerSecond: number;
    }[];
    speedup?: number;
  }[];
}

const results: BenchmarkResult[] = [];

function benchmarkObjectsIndexOf() {
  console.log("🚀 Запуск бенчмарков...\n");
  console.log("Тест 1/4: indexOf в массиве объектов...");

  const benchmark: BenchmarkResult = {
    testName: "📦 indexOf в массиве объектов",
    results: [],
  };

  const sizes = [100, 1_000, 10_000, 100_000, 1_000_000];

  for (const size of sizes) {
    const arr = Array.from({ length: size }, (_, i) => ({
      id: i,
      value: i * 2,
    }));

    const targetValue = size;
    const selector = (item: (typeof arr)[0]) => item.value;

    const nativeTime = measureTime(() => {
      arr.findIndex((item) => item.value === targetValue);
    }, 100);

    const myBinaryTime = measureTime(() => {
      indexOf(arr, targetValue, selector);
    }, 100);

    benchmark.results.push({
      arraySize: size,
      methods: [
        {
          name: "Нативный findIndex",
          time: nativeTime,
          complexity: "O(n)",
          opsPerSecond: Math.round(100 / (nativeTime / 1000)),
        },
        {
          name: "Бинарный indexOf",
          time: myBinaryTime,
          complexity: "O(log n)",
          opsPerSecond: Math.round(100 / (myBinaryTime / 1000)),
        },
      ],
      speedup: nativeTime / myBinaryTime,
    });

    console.log(
      `  ✓ Размер ${size.toLocaleString()}: ${(nativeTime / myBinaryTime).toFixed(1)}x ${nativeTime > myBinaryTime ? "🚀" : "🐌"}`,
    );
  }

  results.push(benchmark);
}

function benchmarkObjectsLastIndexOf() {
  console.log("\nТест 2/4: lastIndexOf в массиве объектов...");

  const benchmark: BenchmarkResult = {
    testName: "📦 lastIndexOf в массиве объектов",
    results: [],
  };

  const sizes = [100, 1_000, 10_000, 100_000, 1_000_000];

  for (const size of sizes) {
    const arr = Array.from({ length: size }, (_, i) => ({
      id: i,
      value: i * 2,
    }));

    const targetValue = size;
    const selector = (item: (typeof arr)[0]) => item.value;

    const nativeTime = measureTime(() => {
      arr.findLastIndex((item) => item.value === targetValue);
    }, 100);

    const myBinaryTime = measureTime(() => {
      lastIndexOf(arr, targetValue, selector);
    }, 100);

    benchmark.results.push({
      arraySize: size,
      methods: [
        {
          name: "Нативный findLastIndex",
          time: nativeTime,
          complexity: "O(n)",
          opsPerSecond: Math.round(100 / (nativeTime / 1000)),
        },
        {
          name: "Бинарный lastIndexOf",
          time: myBinaryTime,
          complexity: "O(log n)",
          opsPerSecond: Math.round(100 / (myBinaryTime / 1000)),
        },
      ],
      speedup: nativeTime / myBinaryTime,
    });

    console.log(
      `  ✓ Размер ${size.toLocaleString()}: ${(nativeTime / myBinaryTime).toFixed(1)}x ${nativeTime > myBinaryTime ? "🚀" : "🐌"}`,
    );
  }

  results.push(benchmark);
}

function benchmarkNumbersIndexOf() {
  console.log("\nТест 3/4: indexOf в массиве чисел...");

  const benchmark: BenchmarkResult = {
    testName: "🔢 indexOf в массиве чисел",
    results: [],
  };

  const sizes = [100, 1_000, 10_000, 100_000, 1_000_000];

  for (const size of sizes) {
    const arr = Array.from({ length: size }, (_, i) => i * 2);
    const target = size;

    const nativeTime = measureTime(() => {
      arr.indexOf(target);
    }, 500);

    const myBinaryTime = measureTime(() => {
      indexOf(arr, target, (x) => x);
    }, 500);

    benchmark.results.push({
      arraySize: size,
      methods: [
        {
          name: "Нативный indexOf",
          time: nativeTime,
          complexity: "O(n)",
          opsPerSecond: Math.round(500 / (nativeTime / 1000)),
        },
        {
          name: "Бинарный indexOf",
          time: myBinaryTime,
          complexity: "O(log n)",
          opsPerSecond: Math.round(500 / (myBinaryTime / 1000)),
        },
      ],
      speedup: nativeTime / myBinaryTime,
    });

    const ratio = nativeTime / myBinaryTime;
    const emoji = ratio > 1 ? "🚀" : ratio > 0.5 ? "🤝" : "🐌";
    console.log(
      `  ✓ Размер ${size.toLocaleString()}: ${ratio.toFixed(1)}x ${emoji}`,
    );
  }

  results.push(benchmark);
}

function benchmarkNumbersLastIndexOf() {
  console.log("\nТест 4/4: lastIndexOf в массиве чисел...");

  const benchmark: BenchmarkResult = {
    testName: "🔢 lastIndexOf в массиве чисел",
    results: [],
  };

  const sizes = [100, 1_000, 10_000, 100_000, 1_000_000];

  for (const size of sizes) {
    const arr = Array.from({ length: size }, (_, i) => i * 2);
    const target = size;

    const nativeTime = measureTime(() => {
      arr.lastIndexOf(target);
    }, 500);

    const myBinaryTime = measureTime(() => {
      lastIndexOf(arr, target, (x) => x);
    }, 500);

    benchmark.results.push({
      arraySize: size,
      methods: [
        {
          name: "Нативный lastIndexOf",
          time: nativeTime,
          complexity: "O(n)",
          opsPerSecond: Math.round(500 / (nativeTime / 1000)),
        },
        {
          name: "Бинарный lastIndexOf",
          time: myBinaryTime,
          complexity: "O(log n)",
          opsPerSecond: Math.round(500 / (myBinaryTime / 1000)),
        },
      ],
      speedup: nativeTime / myBinaryTime,
    });

    const ratio = nativeTime / myBinaryTime;
    const emoji = ratio > 1 ? "🚀" : ratio > 0.5 ? "🤝" : "🐌";
    console.log(
      `  ✓ Размер ${size.toLocaleString()}: ${ratio.toFixed(1)}x ${emoji}`,
    );
  }

  results.push(benchmark);
}

function generateBenchmarkMD(): string {
  let md = "# 🔬 Результаты бенчмарков: Бинарный поиск vs Нативные методы\n\n";
  md += `> 📅 Дата: ${new Date().toLocaleString()}\n`;
  md += `> ⚡ Среда: Node.js ${process.version}\n\n`;
  md += "---\n\n";

  for (const benchmark of results) {
    md += `## ${benchmark.testName}\n\n`;
    md += "| Размер | Метод | Время (ms) | Оп/сек | Сложность |\n";
    md += "|--------|-------|------------|--------|----------|\n";

    for (const result of benchmark.results) {
      for (let i = 0; i < result.methods.length; i++) {
        const method = result.methods[i];
        const size = i === 0 ? result.arraySize.toLocaleString() : "";
        md += `| ${size} | ${method?.name} | ${method?.time.toFixed(3)} | ${method?.opsPerSecond.toLocaleString()} | ${method?.complexity} |\n`;
      }

      if (result.speedup) {
        const emoji =
          result.speedup > 1 ? "🚀" : result.speedup > 0.5 ? "🤝" : "🐌";
        md += `| | **Ускорение** | **${emoji} ${result.speedup.toFixed(1)}x** | | |\n`;
      }
    }

    md += "\n";
  }

  // Сводная таблица
  md += "---\n\n";
  md += "## 📈 Сводная таблица ускорения\n\n";
  md +=
    "| Размер | Объекты indexOf | Объекты lastIndexOf | Числа indexOf | Числа lastIndexOf |\n";
  md +=
    "|--------|----------------|--------------------|--------------|------------------|\n";

  const sizes = [100, 1_000, 10_000, 100_000, 1_000_000];
  for (let i = 0; i < sizes.length; i++) {
    const objIndexOf = results[0]?.results[i]?.speedup || 0;
    const objLastIndexOf = results[1]?.results[i]?.speedup || 0;
    const numIndexOf = results[2]?.results[i]?.speedup || 0;
    const numLastIndexOf = results[3]?.results[i]?.speedup || 0;

    const formatSpeedup = (s: number) => {
      if (s > 1) return `🚀 ${s.toFixed(1)}x`;
      if (s > 0.5) return `🤝 ${s.toFixed(1)}x`;
      return `🐌 ${s.toFixed(1)}x`;
    };

    md += `| ${sizes[i]?.toLocaleString()} | ${formatSpeedup(objIndexOf)} | ${formatSpeedup(objLastIndexOf)} | ${formatSpeedup(numIndexOf)} | ${formatSpeedup(numLastIndexOf)} |\n`;
  }

  md += "\n---\n\n";
  md += "## 💡 Выводы\n\n";
  md += "| Эмодзи | Значение |\n";
  md += "|--------|----------|\n";
  md += "| 🚀 | Бинарный поиск быстрее |\n";
  md += "| 🤝 | Примерно одинаково |\n";
  md += "| 🐌 | Нативная реализация быстрее |\n\n";

  md += "### Ключевые наблюдения:\n\n";
  md +=
    "- **Объекты**: бинарный поиск значительно быстрее на больших массивах (>10,000)\n";
  md +=
    "- **Числа**: нативные методы очень оптимизированы, но бинарный поиск выигрывает на огромных массивах\n";
  md += "- **Маленькие массивы** (<1,000): нативные методы обычно быстрее\n";
  md += "- **Большие массивы** (>10,000): бинарный поиск однозначно лучше\n\n";

  return md;
}

function saveBenchmarkMD() {
  const markdown = generateBenchmarkMD();
  writeFileSync("benchmark.md", markdown, "utf-8");
  console.log("\n✅ Файл benchmark.md создан в текущей директории");
}

function runAllBenchmarks() {
  benchmarkObjectsIndexOf();
  benchmarkObjectsLastIndexOf();
  benchmarkNumbersIndexOf();
  benchmarkNumbersLastIndexOf();
  saveBenchmarkMD();
}

runAllBenchmarks();
