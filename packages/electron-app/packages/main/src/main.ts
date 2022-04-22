import { initializeSecurityRestrictions } from './security-restrictions.js';
import { createTray } from './tray.js';
import { setupApp } from './setup-app.js';

async function main() {
	setupApp();
	await initializeSecurityRestrictions();
	createTray();
}

void main();
