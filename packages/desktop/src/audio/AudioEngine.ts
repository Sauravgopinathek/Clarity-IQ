// AudioEngine handles capturing desktop and microphone audio, 
// mixing them, and recording them into a WebM chunk.

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recorderMimeType = 'audio/webm;codecs=opus';
  
  // Streams
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;
  private mixedStream: MediaStream | null = null;
  
  public onDataAvailable?: (blob: Blob) => void;
  public onStop?: (fullBlob: Blob) => void;

  private getPreferredRecorderMimeType() {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm'];
    return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || '';
  }

  private async convertBlobToMonoWav(blob: Blob): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer();
    const decodeContext = new AudioContext();

    try {
      const decoded = await decodeContext.decodeAudioData(arrayBuffer.slice(0));
      const frameCount = Math.ceil(decoded.duration * 16000);
      const offlineContext = new OfflineAudioContext(1, frameCount, 16000);
      const monoBuffer = offlineContext.createBuffer(1, decoded.length, decoded.sampleRate);
      const monoChannel = monoBuffer.getChannelData(0);

      for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
        const input = decoded.getChannelData(channel);
        for (let index = 0; index < input.length; index += 1) {
          monoChannel[index] += input[index] / decoded.numberOfChannels;
        }
      }

      const source = offlineContext.createBufferSource();
      source.buffer = monoBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      const rendered = await offlineContext.startRendering();
      const pcm = rendered.getChannelData(0);
      const wavBuffer = new ArrayBuffer(44 + pcm.length * 2);
      const view = new DataView(wavBuffer);
      const writeString = (offset: number, value: string) => {
        for (let i = 0; i < value.length; i += 1) {
          view.setUint8(offset + i, value.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + pcm.length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 16000, true);
      view.setUint32(28, 16000 * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, pcm.length * 2, true);

      let offset = 44;
      for (let index = 0; index < pcm.length; index += 1) {
        const sample = Math.max(-1, Math.min(1, pcm[index]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }

      return new Blob([wavBuffer], { type: 'audio/wav' });
    } finally {
      await decodeContext.close();
    }
  }

  async startRecording() {
    this.recordedChunks = [];
    this.recorderMimeType = this.getPreferredRecorderMimeType();
    
    // 1. Get microphone audio
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
    } catch (e) {
      console.error('Failed to get mic stream', e);
      throw new Error('Microphone permission denied or not available');
    }

    // 2. Get system audio via desktopCapturer (requires user to pick screen source or just capture entire screen)
    // Electron IPC invoke exposed via preload
    let sourceId = '';
    try {
      const sources = await window.electron.ipcRenderer.invoke('getDesktopSources');
      if (sources && sources.length > 0) {
        // usually we want 'screen:0:0' or the first one
        sourceId = sources[0].id;
      }
    } catch (e) {
      console.warn('Failed to get desktop sources, recording only mic if system audio fails', e);
    }
    
    try {
      this.systemStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        } as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxWidth: 1, // we don't need video, but it might be required for desktopCapture depending on OS
            maxHeight: 1
          }
        } as any
      });
      
      // We don't actually want the video tracks, so remove them
      this.systemStream.getVideoTracks().forEach(track => track.stop());
    } catch (e) {
      console.error('Failed to capture system audio', e);
      // We might proceed with just mic if system audio fails
    }

    // 3. Mix streams via AudioContext
    this.audioCtx = new AudioContext();
    const dest = this.audioCtx.createMediaStreamDestination();
    
    // Add mic
    if (this.micStream && this.micStream.getAudioTracks().length > 0) {
      const micSource = this.audioCtx.createMediaStreamSource(this.micStream);
      micSource.connect(dest);
    }
    
    // Add system
    if (this.systemStream && this.systemStream.getAudioTracks().length > 0) {
      const sysSource = this.audioCtx.createMediaStreamSource(this.systemStream);
      sysSource.connect(dest);
    }

    this.mixedStream = dest.stream;

    // 4. Record the mixed stream
    this.mediaRecorder = this.recorderMimeType
      ? new MediaRecorder(this.mixedStream, { mimeType: this.recorderMimeType })
      : new MediaRecorder(this.mixedStream);
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
        this.onDataAvailable?.(e.data);
      }
    };
    
    this.mediaRecorder.onstop = async () => {
      const fullBlob = new Blob(this.recordedChunks, {
        type: this.recorderMimeType || 'audio/webm'
      });

      try {
        const wavBlob = await this.convertBlobToMonoWav(fullBlob);
        this.onStop?.(wavBlob);
      } catch (error) {
        console.error('Failed to convert recorded audio to WAV', error);
        this.onStop?.(fullBlob);
      }
    };

    // start recording, generate data available events every 5 seconds (5000ms)
    this.mediaRecorder.start(5000);
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    // Cleanup streams
    this.micStream?.getTracks().forEach(t => t.stop());
    this.systemStream?.getTracks().forEach(t => t.stop());
    this.mixedStream?.getTracks().forEach(t => t.stop());
    
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}
