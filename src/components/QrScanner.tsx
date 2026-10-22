import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode'
import { Camera, Image, RefreshCw, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'

interface QrScannerProps {
  onScan: (text: string) => void
  onError?: (message: string) => void
  cooldownMs?: number
}

/**
 * Robust QR scanner supporting:
 * 1. Live camera scanning (auto-picks rear camera on mobile, integrated webcam on laptop/PC)
 * 2. Camera switching if multiple cameras exist
 * 3. File / image upload scanning for QR screenshots or photos
 * 4. Error recovery and graceful lifecycle management
 */
export default function QrScanner({ onScan, onError, cooldownMs = 2500 }: QrScannerProps) {
  const containerId = 'qr-reader-container'
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCam, setSelectedCam] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [statusText, setStatusText] = useState('Menghubungkan kamera...')
  const [mode, setMode] = useState<'camera' | 'file'>('camera')
  const [fileError, setFileError] = useState('')

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isScanningRef = useRef(false)
  const lastScanRef = useRef({ text: '', at: 0 })
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle successful QR detection
  const handleDecoded = (decodedText: string) => {
    const now = Date.now()
    if (decodedText === lastScanRef.current.text && now - lastScanRef.current.at < cooldownMs) {
      return
    }
    lastScanRef.current = { text: decodedText, at: now }
    if (navigator.vibrate) {
      try {
        navigator.vibrate(80)
      } catch {
        /* ignore */
      }
    }
    onScanRef.current(decodedText)
  }

  // Camera start logic
  useEffect(() => {
    if (mode !== 'camera') return

    let isCancelled = false
    setLoading(true)
    setStatusText('Meminta izin kamera...')

    const startScanner = async () => {
      try {
        // Create scanner instance if not already created
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(containerId)
        }
        const scanner = scannerRef.current

        // If scanner is already active, stop it before starting new stream
        if (isScanningRef.current) {
          try {
            await scanner.stop()
            isScanningRef.current = false
          } catch {
            /* ignore */
          }
        }

        if (isCancelled) return

        // 1. Enumerate available cameras
        let camList: CameraDevice[] = []
        try {
          camList = await Html5Qrcode.getCameras()
          if (!isCancelled && camList.length > 0) {
            setCameras(camList)
          }
        } catch {
          // Camera permission might be asked during start()
        }

        if (isCancelled) return

        // 2. Determine which camera to use
        let cameraIdOrConfig: string | { facingMode: string }

        if (selectedCam && camList.some((c) => c.id === selectedCam)) {
          cameraIdOrConfig = selectedCam
        } else if (camList.length > 0) {
          // Look for rear/environment camera first (mobile)
          const rearCam = camList.find((c) =>
            /back|rear|environment|belakang/i.test(c.label)
          )
          const targetCam = rearCam || camList[0]
          cameraIdOrConfig = targetCam.id
          if (!selectedCam) setSelectedCam(targetCam.id)
        } else {
          // Fallback to facingMode constraint
          cameraIdOrConfig = { facingMode: 'environment' }
        }

        setStatusText('Membuka kamera...')

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72))
            return { width: edgeSize, height: edgeSize }
          },
          aspectRatio: 1.0,
        }

        // Try starting with selected config
        try {
          await scanner.start(
            cameraIdOrConfig,
            config,
            (text) => handleDecoded(text),
            () => {
              /* continuous frame skip */
            }
          )
          isScanningRef.current = true
          if (!isCancelled) {
            setLoading(false)
            setStatusText('Arahkan kamera ke QR tiket')
          }
        } catch (startErr) {
          // If environment constraint failed (e.g. desktop webcam), fallback to user / default
          if (typeof cameraIdOrConfig !== 'string') {
            console.warn('Fallback to front camera / default...')
            await scanner.start(
              { facingMode: 'user' },
              config,
              (text) => handleDecoded(text),
              () => {}
            )
            isScanningRef.current = true
            if (!isCancelled) {
              setLoading(false)
              setStatusText('Arahkan kamera ke QR tiket')
            }
          } else {
            throw startErr
          }
        }
      } catch (err: unknown) {
        if (isCancelled) return
        setLoading(false)
        const errMsg = String(err)
        let humanMsg = 'Kamera tidak dapat dimulai. Pastikan izin kamera aktif atau gunakan unggah foto / ketik manual.'
        if (/permission|notallowed|denied/i.test(errMsg)) {
          humanMsg = 'Izin kamera ditolak. Berikan izin kamera di browser lalu refresh.'
        } else if (/overconstrained|notfound|nodevice/i.test(errMsg)) {
          humanMsg = 'Tidak ada perangkat kamera yang kompatibel ditemukan.'
        }
        onErrorRef.current?.(humanMsg)
      }
    }

    void startScanner()

    return () => {
      isCancelled = true
      if (scannerRef.current && isScanningRef.current) {
        const scanner = scannerRef.current
        isScanningRef.current = false
        void scanner
          .stop()
          .then(() => {
            try {
              scanner.clear()
            } catch {
              /* ignore */
            }
          })
          .catch(() => {})
      }
    }
  }, [mode, selectedCam])

  // Handle image file scan
  const handleFileScan = async (file: File) => {
    setFileError('')
    setLoading(true)
    try {
      // Create a temporary scanner instance or reuse
      let tempScanner = scannerRef.current
      if (!tempScanner) {
        tempScanner = new Html5Qrcode(containerId)
        scannerRef.current = tempScanner
      }

      // If active video stream is running, stop it first
      if (isScanningRef.current) {
        await tempScanner.stop()
        isScanningRef.current = false
      }

      const decodedText = await tempScanner.scanFile(file, true)
      setLoading(false)
      handleDecoded(decodedText)
    } catch {
      setLoading(false)
      setFileError('Tidak dapat membaca QR code dari gambar tersebut. Pastikan gambar QR terlihat jelas dan terang.')
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode switch & camera switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-full border border-line bg-paper p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
              mode === 'camera' ? 'bg-terra text-white' : 'text-muted hover:text-ink'
            }`}
          >
            <Camera className="size-3.5" /> Kamera Live
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
              mode === 'file' ? 'bg-terra text-white' : 'text-muted hover:text-ink'
            }`}
          >
            <Image className="size-3.5" /> Unggah Foto QR
          </button>
        </div>

        {mode === 'camera' && cameras.length > 1 && (
          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="h-8 max-w-[180px] truncate rounded-lg border border-line bg-paper px-2 text-xs font-medium text-ink focus:outline-none"
            aria-label="Pilih kamera"
          >
            {cameras.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.label || `Kamera ${i + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === 'camera' ? (
        <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border-2 border-line bg-ink/90 shadow-soft">
          {/* html5-qrcode DOM anchor */}
          <div id={containerId} className="w-full" />

          {/* Scanner viewfinder overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-cream backdrop-blur-sm">
              {loading ? 'Menyiapkan...' : statusText}
            </span>

            {/* Corner marks */}
            <div className="relative size-44 border-2 border-dashed border-white/60 sm:size-52">
              {/* Animated laser line */}
              <div className="animate-[scanLaser_2.2s_ease-in-out_infinite] absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-terra to-transparent shadow-[0_0_12px_#e8799f]" />
              {/* Corner brackets */}
              <div className="absolute -left-1 -top-1 size-4 border-l-4 border-t-4 border-terra" />
              <div className="absolute -right-1 -top-1 size-4 border-r-4 border-t-4 border-terra" />
              <div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-terra" />
              <div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-terra" />
            </div>

            <span className="text-[11px] text-cream/70">Posisikan QR di dalam bingkai</span>
          </div>

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/80 text-cream">
              <RefreshCw className="size-6 animate-spin text-terra" />
              <p className="mt-2 text-xs font-medium">{statusText}</p>
            </div>
          )}
        </div>
      ) : (
        /* File dropzone / upload mode */
        <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-dashed border-line bg-paper p-6 text-center shadow-soft">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFileScan(file)
            }}
          />
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-blush text-terra-dark">
            <Upload className="size-6" />
          </div>
          <h4 className="font-semibold text-ink">Unggah Tangkapan Layar QR</h4>
          <p className="mt-1 text-xs text-muted">
            Pilih foto atau screenshot tiket QR dari galeri atau WhatsApp
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="mt-4 gap-2"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            {loading ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {loading ? 'Memindai...' : 'Pilih Gambar QR'}
          </Button>

          {fileError && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-terra/10 p-2.5 text-left text-xs text-terra-dark">
              <AlertCircle className="size-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
