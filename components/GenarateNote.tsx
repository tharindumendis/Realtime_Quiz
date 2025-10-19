"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown'; 

const GenerateNote = () => {
    const [topic, setTopic] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateNote = async () => {
        if (!topic.trim()) {
            setError("Please enter a topic.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setNote("");

        try {
            const response = await fetch("/api/generateNote", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ topic }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            setNote(data.note);

        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(`Failed to generate note: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 🚨 NEW FUNCTION: Handles the file download
    const handleDownload = () => {
        if (!note) {
            alert("No content to download!");
            return;
        }

        // 1. Create a Blob (Binary Large Object) from the text data
        const blob = new Blob([note], { type: 'text/markdown' });

        // 2. Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // 3. Create a temporary <a> element
        const a = document.createElement('a');
        a.href = url;
        
        // 4. Set the download filename
        // Sanitizing the topic slightly for the filename
        const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
        a.download = `${safeTopic}_note.md`;

        // 5. Simulate a click and remove the element
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 6. Revoke the temporary URL to free up memory
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-2xl p-8 mx-auto bg-white shadow-lg rounded-xl">
            <h3 className="text-2xl font-bold mb-6 text-indigo-700">📚 Generate Study Note</h3>
            
            <div className="flex flex-col gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Enter the topic for your short note (e.g., 'React Context API' or 'Photosynthesis')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="border p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerateNote}
                    className="bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? "Generating Note..." : "Generate Note"}
                </button>
            </div>
            
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Display Area */}
            {note && (
                <div className="mt-6 p-5 border-t-4 border-indigo-400 bg-indigo-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2 flex justify-between items-center">
                        Note on "{topic}"
                        
                        {/* 🚨 DOWNLOAD BUTTON */}
                        <button
                            onClick={handleDownload}
                            className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                        >
                            ⬇ Download .md
                        </button>
                    </h4>
                    
                    <div className="markdown-body text-gray-800">
                        <ReactMarkdown>
                            {note}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateNote;