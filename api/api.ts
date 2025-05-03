export default class API{
    static async uploadImage(image: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/classify', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    static async getImageInformation(item: string): Promise<any> {
        const formData = new FormData();
        formData.append('item', item);
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/LLM-response', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error fetching AI response:', error);
            throw error;
        }
    }
    
}