const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');

const config = require('./config');
const seedWords = require('./word/seeder');
const seedDayWords = require('./dayWord/seeder');
const guessDayWord = require('./route_handlers/guess');
const getUserState = require('./route_handlers/state');
const setUserPreference = require('./route_handlers/preference');
const { languages } = require('./word/constants');

global.dayWords = [];

// Startup procedures
const app = express();
mongoose.connect(config.mongoConnStr)
    .then(async () => {
        console.log('connected to db');
        // Seed dictionary
        await seedWords({ path: './resources/shakespiro.txt', language: languages.en },
            { path: './resources/poezia.txt', language: languages.bg });
        // Initial load of dayWords
        await seedDayWords();
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });

app.use(express.json());

// Change dayWords every day at midnight
// TODO: Check if this works
cron.schedule('0 0 * * *', async () => {
    await seedDayWords();
});


app.post('/preference', setUserPreference);
app.post('/guess', guessDayWord);
app.get('/state', getUserState);