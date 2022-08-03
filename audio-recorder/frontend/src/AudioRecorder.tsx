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

/**
 * This is a React-based component template. The `render()` function is called
 * automatically when your component should be re-rendered.
 */
class AudioRecorder extends StreamlitComponentBase<State> {
  public state = { numClicks: 0, isFocused: false }
  stream: MediaStream | null = null

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

    // this.setUpRecording();
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
    await this.setupMic();
  }

}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(AudioRecorder)
