const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const { randomColor } = require('./utils');



const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Change '*' to a specific origin if needed
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

const httpPort = 3000;
const httpsPort = 3001;

const httpsOptions = {
    key: fs.readFileSync('ssl/new_key.pem'),
    cert: fs.readFileSync('ssl/new_cert.pem'),
};
const httpsServer = require('https').createServer(httpsOptions, app);

httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server running on https://localhost:${httpsPort}`);
});

// HTTP server
const httpServer = app.listen(httpPort, () => {
    console.log(`HTTP server running on http://localhost:${httpPort}`);
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'vertrigo',
    database: 'notes',
    connectionLimit: 10,
});

app.get('/notes/:userId', (req, res) => {

    const userId = req.params.userId;

    const query = `SELECT notes.id, notes.title, notes.content, group_concat(tags.id) as tagsIds
                    FROM notes
                    LEFT JOIN tagged_notes ON notes.id = tagged_notes.note_id LEFT JOIN tags ON tagged_notes.tag_id=tags.id
                    WHERE notes.owner=${userId}
                    GROUP BY notes.id;`;

    pool.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        results.forEach(note => {
            if (note.tagsIds == null) {
                note.tagsIds = []
            } else {
                note.tagsIds = note.tagsIds.split(',');
            }
        });

        res.status(200).json(results);
    });
});

app.get('/tags/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `SELECT id, name, color
                    from tags
                    where owner=${userId}`;

    pool.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(200).json(results);
    });
});

app.post('/notes', (req, res) => {
    const postData = req.body;

    const insertQuery = 'INSERT INTO notes(title, content, owner) VALUES (?, ?, ?)';
    const insertValues = [postData.title, postData.content, postData.owner];

    pool.query(insertQuery, insertValues, (error, insertResults) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        const lastInsertedId = insertResults.insertId;
        const insertQuery = 'INSERT INTO tagged_notes(note_id, tag_id) VALUES (?, ?)';

        postData.tagsIds.forEach(tagId => {
            const insertValues = [lastInsertedId, tagId];
            pool.query(insertQuery, insertValues, (error, insertResults) => {
                if (error) {
                    console.error('Error inserting into the database:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        });

        res.status(201).send('Data successfully added');
    });
});

app.post('/tags', (req, res) => {
    const postData = req.body;

    const insertQuery = 'INSERT INTO tags(name, color, owner) VALUES (?, ?, ?)';
    const insertValues = [postData.name, randomColor(), postData.owner];

    pool.query(insertQuery, insertValues, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(201).send('Data successfully added');
    });
});

app.patch('/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;
    const patchData = req.body;

    const patchQuery = `UPDATE notes
                        SET title = ?, content = ?
                        WHERE id=${noteId}`;
    const patchValues = [patchData.title, patchData.content];

    pool.query(patchQuery, patchValues, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(200).send('Data successfully modified');
    });
});

app.patch('/tags/:tagId', (req, res) => {
    const tagId = req.params.tagId;
    const patchData = req.body;

    const patchQuery = `UPDATE tags
                        SET name = ?
                        WHERE id=${tagId}`;
    const patchValues = [patchData.name];

    pool.query(patchQuery, patchValues, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(200).send('Data successfully modified');
    });
});

app.delete('/tags/:tagId', (req, res) => {
    const tagId = req.params.tagId;

    const deleteQuery = `DELETE from tags where id=${tagId}`;

    pool.query(deleteQuery, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(202).send('Data successfully deleted');
    });
});

app.delete('/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;

    const deleteQuery = `DELETE from notes where id=${noteId}`;

    pool.query(deleteQuery, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(202).send('Data successfully deleted');
    });
});

app.delete('/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;

    const deleteQuery = `DELETE from notes where id=${noteId}`;

    pool.query(deleteQuery, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(202).send('Data successfully deleted');
    });
});

app.post('/mark', (req, res) => {
    const postData = req.body;

    const insertQuery = 'INSERT INTO tagged_notes(note_id, tag_id) VALUES (?, ?)';
    const insertValues = [postData.noteId, postData.tagId];

    pool.query(insertQuery, insertValues, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(201).send('Data successfully added');
    });
});

app.delete('/mark', (req, res) => {
    const postData = req.body;

    const deleteQuery = `DELETE from tagged_notes where note_id=? and tag_id=?`;
    const deleteValues = [postData.noteId, postData.tagId];

    pool.query(deleteQuery, deleteValues, (error) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(202).send('Data successfully deleted');
    });
});

app.post('/login', (req, res) => {
    const postData = req.body;

    const query = `SELECT id, password from users where login='${postData.login}'`

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (result.length == 0) {
            res.status(401).send('Incorrect login!');
        } else {
            if (result[0].password == postData.password) {
                console.log(result[0], postData.password);
                res.status(200).send(result[0].id.toString());
            } else {
                res.status(401).send('Incorrect password!');
            }
        }
    });
});

app.post('/register', (req, res) => {
    const postData = req.body;

    const insertQuery = 'INSERT INTO users(login, password) VALUES (?, ?)';
    const insertValues = [postData.login, postData.password];

    pool.query(insertQuery, insertValues, (error, insertResult) => {
        console.log(insertResult);
        if (error) {
            console.error('Error inserting into the database:', error);
            res.status(500).send('Bad login');
            return;
        }

        res.status(201).send(insertResult.insertId.toString());
    });
});


app.get('/', (req, res) => {
    res.send('Hello, HTTP!');
});
