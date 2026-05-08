import fs from "fs";

const data = JSON.parse(fs.readFileSync("../data/discography.json", "utf-8"));
const HEADERS = { "User-Agent": "boa-archive/1.0 (nocchalatte@gmail.com)" };

if (!fs.existsSync("../data/covers")) fs.mkdirSync("../data/covers");

async function downloadImage(url, filepath) {
  const res = await fetch(url, { headers: HEADERS });
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function fetchCover(album) {
  try {
    const res = await fetch(
      `https://coverartarchive.org/release-group/${album.id}`,
      { headers: HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const front = data.images.find((img) => img.front);
    return front?.thumbnails?.["500"] ?? null;
  } catch {
    return null;
  }
}

async function main() {
  for (const album of data) {
    const filepath = `../data/covers/${album.id}.jpg`;
    if (fs.existsSync(filepath)) {
      console.log(`건너뜀: ${album.title}`);
      continue;
    }
    await new Promise((r) => setTimeout(r, 1000));
    const url = await fetchCover(album);
    if (url) {
      await downloadImage(url, filepath);
      console.log(`저장됨: ${album.title}`);
    } else {
      console.log(`이미지 없음: ${album.title}`);
    }
  }
  console.log("완료!");
}

main();