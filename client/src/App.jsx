import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoPlayer from './VideoPlayer'
import { useRef } from 'react'

function App() {
  const playerRef = useRef(null)
  const [videoLink, setVideoLink] = useState(null)
  
  const [videoFile, setVideoFile] = useState(null)
  const [folder, setFolder] = useState(null)
  const [files, setFiles] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [folderName, setFolderName] = useState(null)
  useEffect(() => {
    fetch('http://localhost:3000/folders').then(res => res.json()).then(data => {
      console.log(data)
      setFolder(data)
    })
  }, [])

  const fetchFiles = (id) => {
    fetch(`http://localhost:3000/files/${id}`).then(res => res.json()).then(data => {
      console.log(data)
      setFiles(data)
    })
  }
  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL"
      }
    ],
    
  }
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <>
      {videoLink && <><div>
        <h1>Video player</h1>
      </div>
      <VideoPlayer
      options={videoPlayerOptions}
      onReady={handlePlayerReady}
      />
      </>}
      {
        !videoLink && !files &&<> 
        {
          folder && <div>
            <h1>Folders</h1>
            <ul>
              {folder.map((item, index) => {
                return <li onClick={()=>fetchFiles(item._id)} style={{listStyleType: 'none', cursor: 'pointer'}} key={index}>{item.name}</li>
              })}
            </ul>
          </div>
        }
        
        <div>
          <h1>Video uploader</h1>
          <div>

          <input type="text" onChange={(e) => {
            setFolderName(e.target.value)
          }} name="" id="" placeholder='Folder name' />
          </div>
          <input type="file" disabled={uploading} onChange={(e) => {
            setVideoFile(e.target.files[0])
          }} name="" id="" />
          <button disabled={uploading} onClick={() => {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', videoFile)
            formData.append('folderName', folderName)
            fetch('http://localhost:3000/upload', {
              method: 'POST',
              body: formData
            }).then(res => res.json()).then(data => {
              setVideoLink(data.url)
            })
            .catch(err => {
              console.log(err)
            })
            .finally(() => {
              setUploading(false)
            })
          }}
          >{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
        </>
      }
      {
        files && !videoLink && <div>
          <h1>Files</h1>
          <ul>
            {files.map((item, index) => {
              return <li onClick={() => setVideoLink(item.path)} style={{listStyleType: 'none', cursor: 'pointer'}} key={index}>{item.name}</li>
            })}
          </ul>
        </div>
      }
    </>
  )
}

export default App