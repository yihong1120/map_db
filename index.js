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

// Add this route after the '/cases' route
app.get('/details', async (req, res) => {
    try {
        const selectedRegion = req.query.region;
        const selectedCase = req.query.case;

        const result = await pool.query(`
            SELECT view_24hr_max.casename,view_24hr_max.caseseq, hr1, hr3, hr6, hr12, hr24,depth,ROUND((R1.ha::NUMERIC),1) AS ha
            FROM view_24hr_max,floodcase,(
                select regioncode,floodarea.caseseq,sum(ST_Area(geom::geography))/10000 as ha
                from floodarea
                GROUP BY regioncode,caseseq
                order by regioncode,caseseq
            ) R1
            WHERE  view_24hr_max.caseseq = floodcase.seq
            AND R1.regioncode = view_24hr_max.regioncode
            AND R1.caseseq = view_24hr_max.caseseq
            AND view_24hr_max.regioncode = $1
            AND view_24hr_max.caseseq <= $2
            ORDER BY ABS(hr24 - (SELECT hr24 FROM view_24hr_max WHERE regioncode = $1 AND caseseq = $2 ))
            LIMIT 4;
        `, [selectedRegion, selectedCase]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});