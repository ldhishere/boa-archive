import fs from "fs";
import * as XLSX from "xlsx";

const HEADERS = { "User-Agent": "boa-archive/1.0 (nocchalatte@gmail.com)" };
const BASE_URL = "https://musicbrainz.org/ws/2";
const PROGRESS_FILE = "../data/progress.json";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiFetch(url, retry = 3) {
  for (let i = 0; i < retry; i++) {
    try {
      await delay(1500);
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429) {
        console.log("요청 제한 감지, 60초 대기...");
        await delay(60000);
        i--; // retry 카운트 소모 안 함
        continue;
      }
      return res.json();
    } catch (e) {
      console.log(`재시도 ${i + 1}/${retry}`);
      await delay(5000);
    }
  }
  return {};
}

async function getRelease(albumId) {
  const data = await apiFetch(`${BASE_URL}/release?release-group=${albumId}&inc=recordings&fmt=json`);
  const allTracks = (data.releases?.[0]?.media ?? []).flatMap(m => m.tracks ?? []);
  const countries = [...new Set(data.releases?.map(r => r.country).filter(Boolean) ?? [])];
  return { tracks: allTracks, countries };
}

async function getCredits(recordingId) {
  const data = await apiFetch(
    `${BASE_URL}/recording/${recordingId}?inc=work-rels+work-level-rels+artist-rels&fmt=json`
  );
  const credits = { composers: [], lyricists: [], arrangers: [] };
  const workRel = data.relations?.find(r => r["target-type"] === "work");
  for (const rel of workRel?.work?.relations ?? []) {
    const name = rel["target-credit"] || rel.artist?.name || "";
    if (rel.type === "composer") credits.composers.push(name);
    if (rel.type === "lyricist") credits.lyricists.push(name);
    if (rel.type === "arranger") credits.arrangers.push(name);
  }
  return credits;
}

function saveProgress(rows, albumIndex) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ rows, albumIndex }, null, 2));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { rows: [], albumIndex: 0 };
}

async function main() {
  const discography = JSON.parse(fs.readFileSync("../data/discography.json", "utf-8"));
  const { rows, albumIndex: startIndex } = loadProgress();

  if (startIndex > 0) {
    console.log(`이어서 시작: ${startIndex + 1}번째 앨범부터 (${rows.length}개 트랙 저장됨)`);
  }

  for (let i = startIndex; i < Math.min(startIndex + 10, discography.length); i++) {
    const album = discography[i];
    console.log(`[${i + 1}/${discography.length}] 처리 중: ${album.title}`);

    const { tracks, countries } = await getRelease(album.id);
    const albumRows = []; // 앨범 트랙을 임시 저장

    let success = true;
    for (const track of tracks) {
      const recordingId = track.recording?.id;
      let composers = [], lyricists = [], arrangers = [];

      if (recordingId) {
        try {
          const credits = await getCredits(recordingId);
          composers = credits.composers;
          lyricists = credits.lyricists;
          arrangers = credits.arrangers;
        } catch (e) {
          console.log(`트랙 실패: ${track.title}, 앨범 전체 스킵`);
          success = false;
          break;
        }
      }

      albumRows.push({
        앨범: album.title,
        발매일: album.date,
        발매국: countries.join(", "),
        트랙번호: track.position,
        곡제목: track.title,
        작곡: composers.join(", "),
        작사: lyricists.join(", "),
        편곡: arrangers.join(", "),
      });
    }

    if (success) {
      rows.push(...albumRows);
      saveProgress(rows, i + 1); // 앨범 전체 성공시에만 저장
      console.log(`저장 완료: ${album.title} (${albumRows.length}개 트랙)`);
    } else {
      console.log(`스킵됨: ${album.title} — 다음 실행시 재시도`);
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "credits");
  XLSX.writeFile(wb, "../data/boa-credits.xlsx");
  //fs.unlinkSync(PROGRESS_FILE);
  console.log(`완료! 총 ${rows.length}개 트랙 저장됨`);
}

main();