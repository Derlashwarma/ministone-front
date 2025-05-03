'use client'
import { useState } from "react"
import API from "../../../api/api"

type DataState = {
    item_description: string;
    recyclable_method: string;
    safe_waste_disposat: string;
};

export default function Main() {
    const [item, setItem] = useState("")
    const [error, setError] = useState("")
    const [data, setData] = useState<DataState>({
        item_description: '',
        recyclable_method: '',
        safe_waste_disposat: '',
    })

    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setError("")
            
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file')
            }

            const result = await API.uploadImage(file)
            // console.log(result.prediction)
            const res_json = await API.getImageInformation(result.prediction)
            setItem(result.prediction || "Image processed successfully")
            console.log(res_json.response)
            setData({
                item_description: res_json.response.item_description,
                recyclable_method: res_json.response.recyclable_method,
                safe_waste_disposat: res_json.response.safe_waste_disposal
            });
        } catch (error) {
            console.error('Upload failed:', error)
            setError(error instanceof Error ? error.message : "Upload failed")
        }
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <form className="space-y-4">
                <div>
                    <input 
                        type="file" 
                        id="fileInput"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                    />
                </div>
                
                {item && (
                    <div className="p-3 bg-green-50 text-green-700 rounded">
                        <p>{item}</p>
                    </div>
                )}
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded">
                        <p>{error}</p>
                    </div>
                )}
                <p>
                    {data.item_description}
                </p>
                <p>
                    {data.recyclable_method}
                </p>
                <p>
                    {data.safe_waste_disposat}
                </p>
            </form>
        </div>
    )
}