type DesktopSource = {
  id: string;
  name: string;
  display_id?: string;
};

interface ElectronBridge {
  ipcRenderer: {
    invoke: (channel: 'getDesktopSources', data?: unknown) => Promise<DesktopSource[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronBridge;
  }
}

export {};
