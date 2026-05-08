import fs from "fs";
import * as XLSX from "xlsx";

const data = JSON.parse(fs.readFileSync("../data/discography.json", "utf-8"));

const rows = [];
for (const album of data) {
  for (const track of album.tracks) {
    rows.push({
      앨범: album.title,
      발매일: album.date,
      타입: album.type,
      트랙번호: track.position,
      곡제목: track.title,
      길이: track.length ? `${Math.floor(track.length / 60000)}:${String(Math.floor((track.length % 60000) / 1000)).padStart(2, "0")}` : "",
    });
  }
}

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "discography");
XLSX.writeFile(wb, "../data/discography.xlsx");
console.log("discography.xlsx 저장 완료!");