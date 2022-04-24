import { initializeSecurityRestrictions } from './security-restrictions.js';
import { setupApp } from './setup-app.js';
import { createTray } from './tray.js';

async function main() {
	setupApp();
	await initializeSecurityRestrictions();
	await createTray();
}

void main();
