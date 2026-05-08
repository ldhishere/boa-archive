# 공중정원 — BoA Discography Archive

가수 보아의 디스코그래피를 연도별로 보고 작곡진을 검색할 수 있는 개인 프로젝트입니다.  
데이터 수집 자동화부터 UI 설계까지 전 과정을 직접 기획하고 구현했습니다.

## 기획 의도

보아의 디스코그래피를 한눈에 볼 수 있는 웹페이지를 만들고 싶었습니다.  
연도별, 앨범별 탐색이 가능한 메인 페이지와 검색 기능으로 곡별 작곡, 작사 정보도 찾을 수 있게 했습니다.

## 주요 기능

- 연도별 타임라인 형태의 앨범 그리드
- 앨범 클릭 시 상세 페이지(수록곡 목록, 재생시간)
- 곡 제목 / 작곡가 / 작사가 / 편곡가 통합 검색
- GSAP ScrollTrigger 기반 스크롤 애니메이션
- 반응형 레이아웃 (모바일 대응)

## 기술 스택

### Frontend

- React + Vite
- React Router DOM
- GSAP / ScrollTrigger
- CSS (반응형, 커스텀 웹폰트)

### Data Collection

- Node.js
- MusicBrainz API — 디스코그래피, 작곡/작사/편곡 크레딧 수집
- Cover Art Archive API — 앨범 커버 이미지 수집
- xlsx — 데이터 엑셀 변환

### 배포

- GitHub + Vercel (자동 배포)

### 데이터 수집

MusicBrainz API 구조를 분석해 recording → work → credits 순서로 데이터를 추적하고 수집하는 파이프라인을 직접 설계했습니다.

### API 안정성 고려

Rate Limit 대응(429 감지 및 자동 대기), 체크포인트 저장으로 중단 시 이어서 수집 가능하도록 구현했습니다.

### 데이터 정제

수집한 원본 데이터를 웹앱용 JSON과 분석용 Excel 두 가지 형태로 출력해 활용도를 높였습니다.

### UI/UX 설계

인스타그램 피드에서 착안한 그리드, 연혁 형태의 타임라인, 호버 인터랙션 등 사용자 경험을 고려한 UI를 직접 설계하고 구현했습니다.

## 링크

- 서비스: [boa-archive.vercel.app](https://boa-archive.vercel.app)
- GitHub: [github.com/ldhishere/boa-archive](https://github.com/ldhishere/boa-archive)
