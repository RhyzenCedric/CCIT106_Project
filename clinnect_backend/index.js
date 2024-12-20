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

// Search API Endpoint (existing)
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        console.log(`[${new Date().toISOString()}] Search Query: ${query}`);

        const [results] = await pool.execute(`
            SELECT 
                h.hospital_name AS hospital_name, 
                h.address AS hospital_address,
                h.email_address AS hospital_email_address,
                h.contact_num AS hospital_contact_num,
                h.latitude AS hospital_latitude,
                h.longitude AS hospital_longitude,
                h.links AS hospital_links,
                h.type,
                i.insurance_name AS insurance_name
            FROM hospitals h
            JOIN hospital_insurance hi ON h.hospital_id = hi.hospital_id
            JOIN insurances i ON hi.insurance_id = i.insurance_id
            WHERE i.insurance_name LIKE ?
        `, [`%${query}%`]);

        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.hospital_name]) {
                acc[result.hospital_name] = {
                    hospital_name: result.hospital_name,
                    hospital_address: result.hospital_address,
                    hospital_email_address: result.hospital_email_address,
                    hospital_contact_num: result.hospital_contact_num,
                    hospital_latitude: result.hospital_latitude,
                    hospital_longitude: result.hospital_longitude,
                    hospital_links: result.hospital_links,
                    type:result.type,
                    insurances: []
                };
            }
            acc[result.hospital_name].insurances.push(result.insurance_name);
            return acc;
        }, {});

        const formattedResults = Object.values(groupedResults);

        res.json(formattedResults);
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
