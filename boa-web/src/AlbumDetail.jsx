import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)

  useEffect(() => {
    fetch('/discography.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(a => a.id === id)
        setAlbum(found)
      })
  }, [id])

  if (!album) return <div className="container">로딩 중...</div>

  return (
    <div className="container detail">
      <div className="back-btn" >
        <button onClick={() => navigate(-1)}>← 뒤로</button>
      </div>
      <div 
      className="detail-header">
        <img
          src={`/covers/${album.id}.jpg`}
          alt={album.title}
          onError={(e) => {
            if (!e.target.src.includes('.jpeg')) {
              e.target.src = `/covers/${album.id}.jpeg`
            } else if (!e.target.src.includes('no-img')) {
              const random = Math.floor(Math.random() * 3) + 1;
              e.target.src = `/covers/no-img0${random}.jpeg`
            }
          }}
        />
        <div className="detail-info">
          <h2>{album.title}</h2>
          <p>{album.date}</p>
          <p>{album.type}</p>
        </div>
      </div>
      <ul className="detail-tracklist">
        {album.tracks.map(track => (
          <li key={track.position}>
            <span className="track-num">{track.position}</span>
            <span className="track-title">{track.title}</span>
            <span className="track-length">
              {track.length ? `${Math.floor(track.length / 60000)}:${String(Math.floor((track.length % 60000) / 1000)).padStart(2, "0")}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AlbumDetail