// setup-session.js
import fs from 'fs';
import axios from 'axios';
import config from './config.js';

// Fonction pour lire le SESSION_ID depuis kh.json
export function getSessionIdFromKh() {
    try {
        if (fs.existsSync('./kh.json')) {
            const khData = JSON.parse(fs.readFileSync('./kh.json', 'utf8'));
            const sessionId = khData.env?.SESSION_ID?.value;
            if (sessionId && sessionId !== "") {
                console.log('✅ Session ID trouvé dans kh.json:', sessionId);
                return sessionId;
            }
        }
        console.log('⚠️ Aucun Session ID trouvé dans kh.json');
        return null;
    } catch (error) {
        console.error('❌ Erreur lecture kh.json:', error.message);
        return null;
    }
}

// Fonction pour configurer la session automatiquement
export async function setupSessionFromKh() {
    try {
        const sessionId = getSessionIdFromKh();
        
        if (!sessionId) {
            console.log('❌ Impossible de configurer la session: Pas de SESSION_ID');
            console.log('💡 Assurez-vous que kh.json contient un SESSION_ID valide');
            return;
        }
        
        const BASE_URL = process.env.BOT_API_URL || 'https://default.lionelmelo.qzz.io';
        
        // Lire les autres paramètres depuis kh.json
        let khData = {};
        if (fs.existsSync('./kh.json')) {
            khData = JSON.parse(fs.readFileSync('./kh.json', 'utf8'));
        }
        
        const payload = {
            sessionId: sessionId,
            config: {
                prefix: khData.env?.PREFIX?.value || config.PREFIX,
                ownerNumber: config.OWNER_NUMBER,
                ownerName: config.OWNER_NAME,
                botName: khData.env?.BOT_NAME?.value || config.BOT_NAME,
                autoRead: khData.env?.AUTO_READ_STATUS?.value === 'true',
                autoLikeStatus: config.AUTO_LIKE_STATUS,
                autoTyping: khData.env?.FAKE_RECORDING?.value === 'true',
                autoRecording: khData.env?.FAKE_RECORDING?.value === 'true',
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
        
        console.log('📡 Envoi de la configuration à l\'API...');
        
        const response = await axios.post(`${BASE_URL}/api/connect-session`, payload, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
            console.log('✅ Session configurée avec succès!');
            console.log('📱 Bot connecté et prêt à l\'emploi');
        } else {
            console.log('⚠️ Réponse API:', response.data);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration automatique:', error.message);
        if (error.response) {
            console.error('📡 Réponse API:', error.response.data);
        }
    }
}

// Exécuter automatiquement si fichier lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    setupSessionFromKh();
}