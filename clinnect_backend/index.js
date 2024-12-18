const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',      // Replace with your MySQL username
    password: '',      // Replace with your MySQL password
    database: 'clinnectdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// MySQL Connection Pool
const pool = mysql.createPool(dbConfig);

// Search API Endpoint
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        // Log the search query
        console.log(`[${new Date().toISOString()}] Search Query: ${query}`);

        // Search in hospitals table
        const [hospitalResults] = await pool.execute(`
            SELECT 
                hospital_name as name, 
                hospital_address as address, 
                hospital_email as email, 
                hospital_contactnum as contact, 
                hospital_latitude as latitude, 
                hospital_longitude as longitude,
                'hospital' as type
            FROM medicard_hospital 

        `, [`%${query}%`, `%${query}%`]);

        // Search in clinics table
        const [clinicResults] = await pool.execute(`
            SELECT 
                clinic_name as name, 
                clinic_address as address, 
                clinic_email as email, 
                clinic_contactnum as contact, 
                clinic_latitude as latitude, 
                clinic_longitude as longitude,
                'clinic' as type
            FROM medicard_clinic 

        `, [`%${query}%`, `%${query}%`]);

        // Log the results
        console.log(`[${new Date().toISOString()}] Hospitals Found: ${hospitalResults.length}`);
        hospitalResults.forEach((hospital, index) => {
            console.log(`  Hospital ${index + 1}: ${hospital.name} - ${hospital.address}`);
        });

        console.log(`[${new Date().toISOString()}] Clinics Found: ${clinicResults.length}`);
        clinicResults.forEach((clinic, index) => {
            console.log(`  Clinic ${index + 1}: ${clinic.name} - ${clinic.address}`);
        });

        // Combine and return results
        const combinedResults = [...hospitalResults, ...clinicResults];
        
        res.json(combinedResults);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Search Error:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await pool.end();
    console.log('MySQL connection pool closed');
    process.exit(0);
});