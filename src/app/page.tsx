'use client'
import { useState, useRef, useEffect } from "react"
import API from "../../api/api"
import './global.css'
import { Poppins, Roboto } from "next/font/google"

const poppinstFont = Poppins({
    subsets: ['latin'],
    weight: ["100", "200", "300", "400", "500", "900"]
})

const robotoFont = Roboto({
    subsets: ['latin'],
    weight: ["100", "200", "300", "400", "500", "700","900"]
})

type DataState = {
    item_description: string;
    recyclable_method: string;
    safe_waste_disposal: string;
};

export default function Main() {
    const [item, setItem] = useState("")
    const [error, setError] = useState("")
    const [data, setData] = useState<DataState | null>()
    const [isLoading, setIsLoading] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [fetching, setFetching] = useState(null);

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })
                streamRef.current = stream
                if (videoRef.current) videoRef.current.srcObject = stream
            } catch (err) {
                console.error('Camera error:', err)
                setError('Camera access denied. Please allow camera permissions.')
            }
        }
        initCamera()

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }

    const processImage = async (file: File) => {
        setIsLoading(true)
        setError("")
        
        try {
            const result = await API.uploadImage(file)
            const resJson = await API.getImageInformation(result.prediction)
            
            setItem(result.prediction || "Item identified")
            setData({
                item_description: resJson.response.item_description,
                recyclable_method: resJson.response.recyclable_method,
                safe_waste_disposal: resJson.response.safe_waste_disposal
            })
        } catch (error) {
            console.error('Processing failed:', error)
            setError(error instanceof Error ? error.message : "Processing failed")
        } finally {
            setIsLoading(false)
        }
    }

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return
        
        try {
            setData(null)
            const canvas = canvasRef.current
            const video = videoRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
            
            // Get the image data URL and stop the camera
            const imageData = canvas.toDataURL('image/jpeg')
            setCapturedImage(imageData)
            stopCamera()

            // Convert to blob for API upload
            const blob = await new Promise<Blob | null>(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.8)
            })
            
            if (!blob) throw new Error('Failed to capture image')
            
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' })
            await processImage(file)
        } catch (error) {
            console.error('Capture failed:', error)
            setError(error instanceof Error ? error.message : "Capture failed")
        }
    }

    useEffect(() => {
        const screenElement = document.querySelector('.screen');
        if (screenElement) {
            if (error) {
                screenElement.classList.add('error-shadow');
            } else {
                screenElement.classList.remove('error-shadow');
            }
        }
    }, [error]);

    useEffect(() => {
        const screenElement = document.querySelector('.screen');
        if (screenElement) {
            if (isLoading) {
                screenElement.classList.add('fetching-shadow');
            } else {
                screenElement.classList.remove('fetching-shadow');
            }
        }
    }, [isLoading]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        setData(null)
        try {
            if (!file.type.startsWith('image/')) throw new Error('Please upload an image file')
            
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCapturedImage(event.target.result as string)
                }
            }
            reader.readAsDataURL(file)
            
            await processImage(file)
        } catch (error) {
            console.error('Upload failed:', error)
            setError(error instanceof Error ? error.message : "Upload failed")
        }
    }

    const resetCamera = () => {
        setCapturedImage(null)
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })
                streamRef.current = stream
                if (videoRef.current) videoRef.current.srcObject = stream
            } catch (err) {
                console.error('Camera error:', err)
                setError('Camera access denied. Please allow camera permissions.')
            }
        }
        initCamera()
    }

    return (
        <div className={`main-container ${robotoFont.className}`}>
            <div className={`title ${poppinstFont.className}`}>ZERO WASTE</div>
                
            <div className="screen">
                <div className="video-container">
                    {capturedImage ? (
                        <>
                            <img src={capturedImage} alt="Captured" className="captured-image" />
                            <button onClick={resetCamera} className="reset-btn">
                                Retake Photo
                            </button>
                        </>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="video-element" />
                            <canvas ref={canvasRef} className="hidden" />
                            <button 
                                onClick={captureAndProcess}
                                disabled={isLoading}
                                className="capture-btn"
                            >
                                {isLoading ? 'Processing...' : 'Capture Image'}
                            </button>
                        </>
                    )
                    }
                    
                    <label className="file-input-label">
                        {isLoading ? 'Processing...' : 'Upload Image'}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                            className="file-input"
                        />
                    </label>
                </div>
                
                <div className="bottom">
                    {error && <div className="error-message">{error}</div>}
                    {data && (<div className={`item-name ${robotoFont.className}`}>{item}</div>)}
                    
                    {data && (
                        <div className={`results ${poppinstFont.className}`}>
                            <div className="labels">
                                <span><strong className="label">Item Description:</strong> <br /> {data.item_description}</span>
                            </div>
                            <div className="labels">
                                <span><strong className="label">Recycling Method:</strong> <br />{data.recyclable_method}</span>
                            </div>
                            <div className="labels">
                                <span><strong className="label">Safe Waste Disposal Method:</strong><br /> {data.safe_waste_disposal}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}