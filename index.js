import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import config from './config.js';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BOT_API_URL || 'https://default.lionelmelo.qzz.io';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =================== SESSIONS ===================

// GET /api/sessions - Liste des sessions actives
app.get('/api/sessions', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/sessions`, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// GET /api/session/:botId - Détails d'une session
app.get('/api/session/:botId', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/session/${req.params.botId}`, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// =================== AJOUTER UNE SESSION ===================
// POST /api/connect-session - Connecter une session
app.post('/api/connect-session', async (req, res) => {
    try {
        // Utilisation des variables du config.js
        const payload = {
            sessionId: req.body.botId || config.SESSION_ID,
            config: {
                prefix: config.PREFIX,
                ownerNumber: config.OWNER_NUMBER,
                ownerName: config.OWNER_NAME,
                botName: config.BOT_NAME,
                autoRead: config.AUTO_READ,
                autoLikeStatus: config.AUTO_LIKE_STATUS,
                autoTyping: config.AUTO_TYPING,
                autoRecording: config.AUTO_RECORDING,
                autoTypingBeforeReply: config.AUTO_TYPING_BEFORE_REPLY,
                logLevel: config.LOG_LEVEL,
                reconnectDelay: config.RECONNECT_DELAY,
                debugMode: config.DEBUG_MODE,
                dossierAuth: config.DOSSIER_AUTH,
                githubUsername: config.GITHUB_USERNAME,
                githubToken: config.GITHUB_TOKEN,
                autoPairOnStart: config.AUTO_PAIR_ON_START
            }
        };
        
        const response = await axios.post(`${BASE_URL}/api/connect-session`, payload, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: error.response?.data?.message || error.message 
        });
    }
});

// =================== SETTINGS ===================

// PUT /api/session/:botId/settings - Mettre à jour un setting
app.put('/api/session/:botId/settings', async (req, res) => {
    try {
        // Fusion : req.body écrase les valeurs par défaut du config.js
        const settings = {
            prefix: req.body.prefix ?? config.PREFIX,
            autoRead: req.body.autoRead ?? config.AUTO_READ,
            autoLikeStatus: req.body.autoLikeStatus ?? config.AUTO_LIKE_STATUS,
            autoTyping: req.body.autoTyping ?? config.AUTO_TYPING,
            autoRecording: req.body.autoRecording ?? config.AUTO_RECORDING,
            autoTypingBeforeReply: req.body.autoTypingBeforeReply ?? config.AUTO_TYPING_BEFORE_REPLY,
            logLevel: req.body.logLevel ?? config.LOG_LEVEL,
            reconnectDelay: req.body.reconnectDelay ?? config.RECONNECT_DELAY,
            debugMode: req.body.debugMode ?? config.DEBUG_MODE
        };
        
        const response = await axios.put(`${BASE_URL}/api/session/${req.params.botId}/settings`, settings, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// =================== DÉMARRAGE ===================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Backend API: ${BASE_URL}`);
    console.log(`📡 GET  /api/sessions`);
    console.log(`📡 GET  /api/session/:botId`);
    console.log(`📡 POST /api/connect-session (utilise config.js)`);
    console.log(`📡 PUT  /api/session/:botId/settings (valeurs par défaut depuis config.js)`);
});

export default app;