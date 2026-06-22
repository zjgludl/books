const fs = require("fs");
const path = require("path");

const BOOK_DIR = "./books";

function scanBooks(dir) {
  const files = fs.readdirSync(dir);

  return files.map(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    return {
      name: file,
      size: stat.size,
      url: `/books/${encodeURIComponent(file)}`
    };
  });
}

const books = scanBooks(BOOK_DIR);

fs.writeFileSync(
  "./books.json",
  JSON.stringify(books, null, 2)
);

console.log("books.json generated:", books.length);
