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
                h.hospital_name, 
                h.address AS hospital_address,
                h.email_address AS hospital_email_address,
                h.contact_num AS hospital_contact_num,
                h.latitude AS hospital_latitude,
                h.longitude AS hospital_longitude,
                h.links AS hospital_links,
                h.type,
                GROUP_CONCAT(i.insurance_name) AS all_insurances
            FROM hospitals h
            JOIN hospital_insurance hi ON h.hospital_id = hi.hospital_id
            JOIN insurances i ON hi.insurance_id = i.insurance_id
            WHERE EXISTS (
                SELECT 1 
                FROM hospital_insurance hi2 
                JOIN insurances i2 ON hi2.insurance_id = i2.insurance_id 
                WHERE hi2.hospital_id = h.hospital_id 
                AND i2.insurance_name LIKE ?
            )
            GROUP BY h.hospital_id
        `, [`%${query}%`]);
        
        // Similarly for the clinic query:
        const [clinicResults] = await pool.execute(`
            SELECT 
                c.clinic_name, 
                c.address AS clinic_address,
                c.email_address AS clinic_email_address,
                c.contact_num AS clinic_contact_num,
                c.latitude AS clinic_latitude,
                c.longitude AS clinic_longitude,
                c.links AS clinic_links,
                c.type,
                GROUP_CONCAT(i.insurance_name) AS all_insurances
            FROM clinics c
            JOIN clinic_insurance ci ON c.clinic_id = ci.clinic_id
            JOIN insurances i ON ci.insurance_id = i.insurance_id
            WHERE EXISTS (
                SELECT 1 
                FROM clinic_insurance ci2 
                JOIN insurances i2 ON ci2.insurance_id = i2.insurance_id 
                WHERE ci2.clinic_id = c.clinic_id 
                AND i2.insurance_name LIKE ?
            )
            GROUP BY c.clinic_id
        `, [`%${query}%`]);

        const allResults = [...hospitalResults, ...clinicResults];
        
        // Modify the groupedResults reduction:
        const groupedResults = allResults.reduce((acc, result) => {
            const key = result.type === 'hospital' ? result.hospital_name : result.clinic_name;
            if (!acc[key]) {
                acc[key] = { 
                    ...result, 
                    insurances: result.all_insurances ? result.all_insurances.split(',') : [] 
                };
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
