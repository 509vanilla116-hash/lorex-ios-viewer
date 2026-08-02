import { useState, useEffect } from 'react'
import axios from 'axios'
import CameraGrid from './components/CameraGrid'
import CameraViewer from './components/CameraViewer'
import './App.css'

interface Camera {
  id: number
  name: string
  ip: string
  port: number
  username: string
  password: string
  channel: number
}

function App() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/cameras')
      setCameras(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load cameras. Make sure the server is running.')
      console.error('Error fetching cameras:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading cameras...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchCameras}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (selectedCamera) {
    return (
      <CameraViewer
        camera={selectedCamera}
        onBack={() => setSelectedCamera(null)}
        cameras={cameras}
        onSelectCamera={setSelectedCamera}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 sticky top-0 z-10 shadow-lg">
        <h1 className="text-3xl font-bold">🎥 Lorex Camera Viewer</h1>
        <p className="text-gray-400 mt-1">{cameras.length} cameras connected</p>
      </header>
      <CameraGrid cameras={cameras} onSelectCamera={setSelectedCamera} />
    </div>
  )
}

export default App