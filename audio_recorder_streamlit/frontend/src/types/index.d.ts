export { };

declare global {
    interface Window {
        stream: any;
        webkitAudioContext: any;
    }

    interface AudioContext {
        sampleRate: number;
    }
}