import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import config from './config.js';
import { setupSessionFromKh } from './setup-session.js';

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
        // Priorité: req.body > config.js > kh.json
        let sessionId = req.body.botId || config.SESSION_ID;
        
        // Si toujours vide, essayer de lire depuis kh.json
        if (!sessionId) {
            const { getSessionIdFromKh } = await import('./setup-session.js');
            sessionId = getSessionIdFromKh();
        }
        
        const payload = {
            sessionId: sessionId,
            config: {
                prefix: req.body.prefix || config.PREFIX,
                ownerNumber: req.body.ownerNumber || config.OWNER_NUMBER,
                ownerName: req.body.ownerName || config.OWNER_NAME,
                botName: req.body.botName || config.BOT_NAME,
                autoRead: req.body.autoRead ?? config.AUTO_READ,
                autoLikeStatus: req.body.autoLikeStatus ?? config.AUTO_LIKE_STATUS,
                autoTyping: req.body.autoTyping ?? config.AUTO_TYPING,
                autoRecording: req.body.autoRecording ?? config.AUTO_RECORDING,
                autoTypingBeforeReply: req.body.autoTypingBeforeReply ?? config.AUTO_TYPING_BEFORE_REPLY,
                logLevel: req.body.logLevel || config.LOG_LEVEL,
                reconnectDelay: req.body.reconnectDelay || config.RECONNECT_DELAY,
                debugMode: req.body.debugMode ?? config.DEBUG_MODE,
                dossierAuth: req.body.dossierAuth || config.DOSSIER_AUTH,
                githubUsername: req.body.githubUsername || config.GITHUB_USERNAME,
                githubToken: req.body.githubToken || config.GITHUB_TOKEN,
                autoPairOnStart: req.body.autoPairOnStart ?? config.AUTO_PAIR_ON_START
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

// =================== DÉMARRAGE AUTOMATIQUE ===================

// Démarrer le serveur et configurer la session automatiquement
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Backend API: ${BASE_URL}`);
    console.log(`📡 GET  /api/sessions`);
    console.log(`📡 GET  /api/session/:botId`);
    console.log(`📡 POST /api/connect-session`);
    console.log(`📡 PUT  /api/session/:botId/settings`);
    
    // Auto-setup session au démarrage
    await setupSessionFromKh();
});

export default app;