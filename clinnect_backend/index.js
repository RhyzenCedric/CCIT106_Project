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

        const [hospitalResults] = await pool.execute(`
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

        const [clinicResults] = await pool.execute(`
            SELECT 
                c.clinic_name AS clinic_name, 
                c.address AS clinic_address,
                c.email_address AS clinic_email_address,
                c.contact_num AS clinic_contact_num,
                c.latitude AS clinic_latitude,
                c.longitude AS clinic_longitude,
                c.links AS clinic_links,
                c.type,
                i.insurance_name AS insurance_name
            FROM clinics c
            JOIN clinic_insurance ci ON c.clinic_id = ci.clinic_id
            JOIN insurances i ON ci.insurance_id = i.insurance_id
            WHERE i.insurance_name LIKE ?
        `, [`%${query}%`]);

        const allResults = [...hospitalResults, ...clinicResults];

        const groupedResults = allResults.reduce((acc, result) => {
            const key = result.type === 'hospital' ? result.hospital_name : result.clinic_name;
            if (!acc[key]) {
                acc[key] = { ...result, insurances: [] };
            }
            if (result.type === 'hospital' && result.insurance_name) {
                acc[key].insurances.push(result.insurance_name);
            }
            else if (result.type === 'clinic' && result.insurance_name) {
                acc[key].insurances.push(result.insurance_name);
            }
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
