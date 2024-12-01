import React, { useState } from "react";
import axios from "axios";

const UploadForm = () => {
  const [receipt, setReceipt] = useState(null);
  const [numPeople, setNumPeople] = useState(1);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("receipt", receipt);
    formData.append("num_people", numPeople);

    try {
      const response = await axios.post("https://billsplitter-y08c.onrender.com/api/split", formData);
      setResult(`Total: $${response.data.total}, Each person pays: $${response.data.per_person}`);
    } catch (error) {
      setResult("Error: " + (error.response?.data?.error || "Something went wrong!"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Split the Bill
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="receipt" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Receipt
            </label>
            <input 
              id="receipt"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="w-full p-2 border border-gray-300 rounded-md 
                         file:mr-4 file:py-2 file:px-4 
                         file:rounded-md file:border-0 
                         file:text-sm file:font-semibold
                         file:bg-blue-500 file:text-white
                         hover:file:bg-blue-600"
              required 
            />
          </div>

          <div>
            <label 
              htmlFor="people" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Number of People
            </label>
            <input
              id="people"
              type="number"
              value={numPeople}
              onChange={(e) => setNumPeople(e.target.value)}
              min="1"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={!receipt || isLoading}
            className="w-full bg-blue-500 text-white p-2 rounded-md 
                       hover:bg-blue-600 disabled:bg-blue-300 
                       transition-colors duration-300"
          >
            {isLoading ? "Splitting..." : "Split Bill"}
          </button>
        </form>

        {result && (
          <div 
            className={`mt-4 p-4 rounded-md ${
              result.includes('Error') 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;