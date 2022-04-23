import { contextBridge } from 'electron';

import { exposedElectron } from './exposed.js';

contextBridge.exposeInMainWorld('electron', exposedElectron);
