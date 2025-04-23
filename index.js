require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 

// MongoDB connection
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

(async () => {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
})();

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'views')));

// Home view (HTML form)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Process view
app.get('/process', async (req, res) => {
    const { search, type } = req.query; // Get form data
    const db = client.db('PublicCompanies');
    const collection = db.collection('Companies');

    try {
        let results;
        if (type === 'name') {
            // Search by company name
            results = await collection.find({ name: new RegExp(search, 'i') }).toArray();
        } else if (type === 'ticker') {
            // Search by ticker symbol
            results = await collection.find({ ticker: new RegExp(search, 'i') }).toArray();
        }

        // Log results to the console
        console.log('Search Results:', results);

        // Display results on the web page
        let html = '<h1>Search Results</h1>';
        if (results.length > 0) {
            html += '<ul>';
            results.forEach(company => {
                html += `<li>${company.name} (${company.ticker}): $${company.price}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No results found.</p>';
        }
        res.send(html);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




