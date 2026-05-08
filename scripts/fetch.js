import fs from "fs";

const ARTIST_ID = "a16d1433-ba89-4f72-a47b-a370add0bb55";
const BASE_URL = "https://musicbrainz.org/ws/2";
const HEADERS = { "User-Agent": "boa-archive/1.0 (nocchalatte@gmail.com)" };

async function fetchAllReleaseGroups() {
  let allReleaseGroups = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const res = await fetch(
      `${BASE_URL}/release-group?artist=${ARTIST_ID}&fmt=json&offset=${offset}`,
      { headers: HEADERS }
    );
    const data = await res.json();
    total = data["release-group-count"];
    allReleaseGroups = allReleaseGroups.concat(data["release-groups"]);
    offset += 25;
  }

  return allReleaseGroups;
}

async function fetchTracks(releaseGroupId) {
  const res = await fetch(
    `${BASE_URL}/release?release-group=${releaseGroupId}&inc=recordings&fmt=json`,
    { headers: HEADERS }
  );
  const data = await res.json();
  const tracks = data.releases?.[0]?.media?.[0]?.tracks ?? [];
  return tracks.map((t) => ({ position: t.position, title: t.title, length: t.length }));
}

async function main() {
  console.log("앨범 목록 수집 중...");
  const releaseGroups = await fetchAllReleaseGroups();

  const result = [];
  for (const group of releaseGroups) {
    console.log(`트랙 수집 중: ${group.title}`);
    await new Promise((r) => setTimeout(r, 1000)); // API rate limit 방지
    const tracks = await fetchTracks(group.id);
    result.push({
      id: group.id,
      title: group.title,
      type: group["primary-type"],
      date: group["first-release-date"],
      tracks,
    });
  }

  fs.writeFileSync("../data/discography.json", JSON.stringify(result, null, 2));
  console.log(`완료! 총 ${result.length}개 앨범 저장됨`);
}

main();