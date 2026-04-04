import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: async (channel: 'getDesktopSources') => {
      return ipcRenderer.invoke(channel);
    }
  }
});
