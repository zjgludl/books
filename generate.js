const fs = require("fs");
const { execSync } = require("child_process");

const dir = "./books";

const files = fs.readdirSync(dir)
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f));

function getTime(file) {
  try {
    const ts = execSync(
      `git log -1 --format=%ct -- "${dir}/${file}"`
    ).toString().trim();

    return ts ? parseInt(ts) * 1000 : 0;
  } catch (e) {
    return 0;
  }
}

// 1️⃣ 构建书籍数据
const books = files.map(f => {
  const ts = getTime(f);

  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts,
    ext: f.split('.').pop().toLowerCase()   // ✅ 新增：文件格式
  };
});

// 2️⃣ 排序（新在上）
books.sort((a, b) => b.ts - a.ts);

// 3️⃣ 写 books.json（备用）
fs.writeFileSync("books.json", JSON.stringify(books, null, 2));

// ===============================
// ✅ 分页核心逻辑
// ===============================

const PAGE_SIZE = 20;

function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

const pages = chunk(books, PAGE_SIZE);

// ===============================
// ✅ 样式（增强字体 + 行距 + Kindle友好）
// ===============================
const style = `
<style>
body {
  font-size: 20px;
  line-height: 1.9;
  margin: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 28px;
}

li {
  margin: 10px 0;
}

a {
  font-size: 18px;
  text-decoration: none;
}

.meta {
  font-size: 14px;
  color: #666;
}

.nav {
  margin-top: 20px;
  font-size: 16px;
}
</style>
`;

// ===============================
// 4️⃣ 生成分页 HTML
// ===============================
const NOW = Date.now();
const NEW_MS = 3 * 24 * 60 * 60 * 1000;

pages.forEach((pageBooks, pageIndex) => {

  let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Book Library - Page ${pageIndex + 1}</title>
${style}
</head>

<body>

<h1>📚 Book Library</h1>
<div class="meta">
Page ${pageIndex + 1} / ${pages.length}
</div>

<hr>

<ol>
`;

  pageBooks.forEach(b => {

    const title = b.name.replace(/\.[^/.]+$/, "");

    const isNew =
      b.ts > 0 && (NOW - b.ts < NEW_MS);

    html += `
<li>
  <a href="${b.url}">
    ${title}
  </a>
  <span class="meta">[${b.ext}]</span>
  ${isNew ? "🆕" : ""}
</li>
`;
  });

  html += `
</ol>

<hr>

<div class="nav">
`;

  // 👇 分页导航
  if (pageIndex > 0) {
    const prev = pageIndex === 1 ? "index.html" : `page${pageIndex}.html`;
    html += `<a href="${prev}">← Prev</a>`;
  }

  if (pageIndex > 0 && pageIndex < pages.length) {
    html += ` | `;
  }

  if (pageIndex < pages.length - 1) {
    const next = `page${pageIndex + 2}.html`;
    html += `<a href="${next}">Next →</a>`;
  }

  html += `
</div>

<hr>

<p class="meta">
Kindle compatible · generated at build time · no JS
</p>

</body>
</html>
`;

  // 👉 文件命名规则
  const fileName =
    pageIndex === 0 ? "index.html" : `page${pageIndex + 1}.html`;

  fs.writeFileSync(fileName, html);
});

console.log(`OK: generated ${pages.length} pages for Kindle`);
