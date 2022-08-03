import React, { ReactNode } from "react"
import {
  StreamlitComponentBase,
  withStreamlitConnection
} from "streamlit-component-lib"
import RecordButton from "./RecordButton"

interface State {
  numClicks: number
  isFocused: boolean
}

interface AudioData {
  blob: Blob
  url: string
  type: string
}

class MyComponent extends StreamlitComponentBase<State> {
  public state = { numClicks: 0, isFocused: false }

  stream: MediaStream | null = null;
  AudioContext = window.AudioContext || window.webkitAudioContext;
  type: string = "audio/wav";
  sampleRate: number | null = null;
  phrase_buffer_count: number | null = null;
  pause_buffer_count: number | null = null;
  pause_count: number | null = null;
  pause_threshold: number = 0.8;
  phrase_threshold: number = 0.3;
  stage: string | null = null;
  volume: any = null;
  audioInput: any = null;
  analyser: any = null;
  recorder: any = null;
  recording: boolean = false;
  leftchannel: Float32Array[] = [];
  rightchannel: Float32Array[] = [];
  leftBuffer: Float32Array | null = null;
  rightBuffer: Float32Array | null = null;
  recordingLength: number = 0;

  //get mic stream
  getStream = (): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  };

  setupMic = async () => {
    try {
      window.stream = this.stream = await this.getStream();
    } catch (err) {
      console.log("Error: Issue getting mic", err);
    }

    this.startRecording();
  };

  closeMic = () => {
    this.stream!.getAudioTracks().forEach((track) => {
      track.stop();
    });
    this.audioInput.disconnect(0);
    this.analyser.disconnect(0);
    this.recorder.disconnect(0);
  };

  writeUTFBytes = (view: DataView, offset: number, string: string) => {
    let lng = string.length;
    for (let i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  mergeBuffers = (channelBuffer: Float32Array[], recordingLength: number) => {
    let result = new Float32Array(recordingLength);
    let offset = 0;
    let lng = channelBuffer.length;
    for (let i = 0; i < lng; i++) {
      let buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  };

  interleave = (leftChannel: Float32Array, rightChannel: Float32Array) => {
    let length = leftChannel.length + rightChannel.length;
    let result = new Float32Array(length);

    let inputIndex = 0;

    for (let index = 0; index < length; ) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  };

  startRecording = () => {
    this.context = new this.AudioContext();
    this.sampleRate = this.context.sampleRate;

    // create buffer states counts
    let bufferSize = 2048;
    let seconds_per_buffer = bufferSize / this.sampleRate!;
    this.phrase_buffer_count = Math.ceil(
      this.phrase_threshold / seconds_per_buffer
    );
    this.pause_buffer_count = Math.ceil(
      this.pause_threshold / seconds_per_buffer
    );
    this.pause_count = 0;
    this.stage = "start";

    // creates a gain node
    this.volume = this.context.createGain();

    // creates an audio node from teh microphone incoming stream
    this.audioInput = this.context.createMediaStreamSource(this.stream);

    // Create analyser
    this.analyser = this.context.createAnalyser();

    // connect audio input to the analyser
    this.audioInput.connect(this.analyser);

    // connect analyser to the volume control
    // analyser.connect(volume);

    this.recorder = this.context.createScriptProcessor(bufferSize, 2, 2);

    // we connect the volume control to the processor
    // volume.connect(recorder);

    this.analyser.connect(this.recorder);

    // finally connect the processor to the output
    this.recorder.connect(this.context.destination);

    this.recorder.onaudioprocess = function (e: any) {
      // Check
      if (!this.recording) return;
      // Do something with the data, i.e Convert this to WAV
      let left = e.inputBuffer.getChannelData(0);
      let right = e.inputBuffer.getChannelData(1);
      if (!this.tested) {
        this.tested = true;
        // if this reduces to 0 we are not getting any sound
        if (!left.reduce((a: number, b: number) => a + b)) {
          console.log("Error: There seems to be an issue with your Mic");
          // clean up;
          this.stop();
          this.stream.getTracks().forEach(function (track: any) {
            track.stop();
          });
          this.context.close();
        }
      }
      // Check energy level
      let energy = Math.sqrt(
        left.map((x: number) => x * x).reduce((a: number, b: number) => a + b) / left.length
      );
      if (this.stage === "start" && energy > this.energy_threshold) {
        this.stage = "speaking";
      } else if (this.stage === "speaking") {
        if (energy > this.energy_threshold) {
          this.pause_count = 0;
        } else {
          this.pause_count += 1;
          if (this.pause_count > this.pause_buffer_count) {
            this.stop();
          }
        }
      }
      let radius = 33.0 + Math.sqrt(1000.0 * energy);
      this.props.setRadius(radius.toString());

      // we clone the samples
      this.leftchannel.push(new Float32Array(left));
      this.rightchannel.push(new Float32Array(right));
      this.recordingLength += bufferSize;
    };
    // this.visualize();
  };

  start = async () => {
    await this.setupMic();
    this.recording = true;
    // reset the buffers for the new recording
    this.leftchannel.length = this.rightchannel.length = 0;
    this.recordingLength = 0;
  };

  stop = () => {
    this.recording = false;
    this.closeMic();

    // we flat the left and right channels down
    this.leftBuffer = this.mergeBuffers(this.leftchannel, this.recordingLength);
    this.rightBuffer = this.mergeBuffers(
      this.rightchannel,
      this.recordingLength
    );
    // we interleave both channels together
    let interleaved = this.interleave(this.leftBuffer, this.rightBuffer);

    ///////////// WAV Encode /////////////////
    // from http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
    //

    // we create our wav file
    let buffer = new ArrayBuffer(44 + interleaved.length * 2);
    let view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    this.writeUTFBytes(view, 8, "WAVE");
    // FMT sub-chunk
    this.writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, this.sampleRate!, true);
    view.setUint32(28, this.sampleRate! * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    this.writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    let lng = interleaved.length;
    let index = 44;
    let volume = 1;
    for (let i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
      index += 2;
    }

    // our final binary blob
    const blob = new Blob([view], { type: this.type });
    const audioUrl = URL.createObjectURL(blob);


    this.onStop({
      blob: blob,
      url: audioUrl,
      type: this.type,
    });
  };

  public render = (): ReactNode => {
    // Arguments that are passed to the plugin in Python are accessible
    // via `this.props.args`. Here, we access the "name" arg.
    const name = this.props.args["name"]

    // Streamlit sends us a theme object via props that we can use to ensure
    // that our component has visuals that match the active theme in a
    // streamlit app.
    const { theme } = this.props
    const style: React.CSSProperties = {}

    // Maintain compatibility with older versions of Streamlit that don't send
    // a theme object.
    if (theme) {
      // Use the theme object to style our button border. Alternatively, the
      // theme style is defined in CSS vars.
      const borderStyling = `1px solid ${
        this.state.isFocused ? theme.primaryColor : "gray"
      }`
      style.border = borderStyling
      style.outline = borderStyling
    }

    return (
      <span>
        Click to record &nbsp;
        <RecordButton onClick={this.onClicked}></RecordButton>
      </span>
    )
  }

  private onClicked = async () => {
    if (!this.recording){
      await this.start()
    } else {
      this.stop()
    }

  }

  onStop = (data: AudioData) => {
    console.log(data.url);
  }

}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(AudioRecorder)
