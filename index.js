const express = require('express'); // import express
const { Pool } = require('pg'); // import pg module
const app = express(); // initialize express
const port = 3000;

// 配置 PostgreSQL 連接
const pool = new Pool({
    user: 'ann',
    host: 'localhost',
    database: 'flood',
    password: '0000',
    port: 5432, // PostgreSQL port
});

app.use(express.static('public'));

app.get('/regions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM region');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add this route after the '/regions' route
app.get('/cases', async (req, res) => {
    try {
        const selectedRegion = req.query.region;
        const result = await pool.query(`
            SELECT regionname,CAST(caseseq AS INTEGER) AS caseseq,casename,casedate
            FROM floodarea, floodcase, region
            WHERE floodarea.regioncode = region.code
            AND floodarea.caseseq = floodcase.seq
            AND regionname = $1
            GROUP BY regionname,casedate,casename,caseseq
            ORDER BY  floodcase.casedate;
        `, [selectedRegion]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});