import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import AlbumDetail from './AlbumDetail'
import './App.css'

function Home() {
  const [albums, setAlbums] = useState([])
  const [credits, setCredits] = useState([])
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  

  useEffect(() => {
    fetch('/discography.json')
      .then(res => res.json())
      .then(data => setAlbums(data.sort((a, b) => new Date(b.date) - new Date(a.date))))
    fetch('/credits.json')
      .then(res => res.json())
      .then(data => setCredits(data))
  }, [])
  

  const searchResults = query.trim().length > 0
    ? credits.filter(row =>
        row['곡제목']?.toLowerCase().includes(query.toLowerCase()) ||
        row['작곡']?.toLowerCase().includes(query.toLowerCase()) ||
        row['작사']?.toLowerCase().includes(query.toLowerCase()) ||
        row['편곡']?.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="container">
      <h1  onClick={() => navigate('/')}>BoA Discography</h1>
      <input
        className="search"
        type="text"
        placeholder="곡 제목, 작곡가, 작사가로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim().length > 0 ? (
        <div className="search-results">
          {searchResults.length === 0 ? (
            <p className="no-result">검색 결과가 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>앨범</th>
                  <th>트랙</th>
                  <th>곡명</th>
                  <th>작곡</th>
                  <th>작사</th>
                  <th>편곡</th>
                  {/* <th>발매국</th> */}
                </tr>
              </thead>
              <tbody>
                {searchResults.map((row, i) => (
                  <tr key={i}>
                    <td>{row['앨범']}</td>
                    <td>{row['트랙번호']}</td>
                    <td>{row['곡제목']}</td>
                    <td>{row['작곡']}</td>
                    <td>{row['작사']}</td>
                    <td>{row['편곡']}</td>
                    {/* <td>{row['발매국']}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="grid">
          {albums.map(album => (
            <div key={album.id} className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
              <img
                src={`/covers/${album.id}.jpg`}
                alt={album.title}
                onError={(e) => {
                  if (!e.target.src.includes('.jpeg')) {
                    e.target.src = `/covers/${album.id}.jpeg`
                  } else if (!e.target.src.includes('no-img')) {
                    const random = Math.floor(Math.random() * 2) + 1;
                    e.target.src = `/covers/no-img0${random}.jpeg`
                  }
                }}
              />
              <p className="album-title">{album.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App