import React, { useState } from "react";
import axios from "axios";

const UploadForm = () => {
    const [receipt, setReceipt] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [result, setResult] = useState("");

    const handleFileChange = (e) => {
        setReceipt(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("receipt", receipt);
        formData.append("num_people", numPeople);

        try{
            const response = await axios.post("http://127.0.0.1:5000/api/split", formData);
            setResult(`Total: $${response.data.total}, Each person pays: $${response.data.per_person}`);
        } catch (error) {
            setResult("Error: " + error.response?.data?.error || "Something went wrong!");
        }
    };

    return(
        <div>
            <h1>Split the Bill</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
                <input
                type="number"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                min="1"
                required
                />
                <button type="submit"> Split Bill</button>
            </form>
            <p>{result}</p>
        </div>
    );
};

export default UploadForm;