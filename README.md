# Audio record streamlit

This streamlit component allows to register an audio utterence from a user.

<img src="https://raw.githubusercontent.com/Joooohan/audio-recorder-streamlit/main/img/recorder.png" alt="recorder.png" width="200"/>

## Installation

`pip install audio-recorder-streamlit`

## Usage

```python
import streamlit as st
from audio_recorder_streamlit import audio_recorder

audio_bytes = audio_recorder()
if audio_bytes:
    st.audio(audio_bytes, format="audio/wav")
```

## Recording parameters

You can adjust the recording parameters `energy_threshold` and
`pause_threshold`:
- `energy_threshold`: The energy recording sensibility above which we consider
    that the user is speaking. If it is a float, then this is the energy
    threshold used to automatically detect recording start and recording end.
    You can provide a tuple for specifying different threshold for recording
    start detection and recording end detection.
- `pause_threshold`: The number of seconds to spend below `energy_level` to
    automatically stop the recording.
- `sample_rate`: Sample rate of the recorded audio. If not provided, this will use the
    default sample rate (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext).


```python
# The recording will stop automatically
# 2 sec after the utterance end
audio_bytes = audio_recorder(pause_threshold=2.0, sample_rate=41_000)
```

## Styling parameters

You can adjust the button style parameters:
- **Text**: specify the text displayed next to the icon
- **Icon**: specify the icon among the font awesome solid icons
  (https://fontawesome.com/search?o=r&s=solid)
- **Color**: specify the neutral color and recording color.
- **Size**: specify the icon size using font awesome sizing
  (https://fontawesome.com/docs/web/style/size).

```python
audio_bytes = audio_recorder(
    text="",
    recording_color="#e8b62c",
    neutral_color="#6aa36f",
    icon_name="user",
    icon_size="6x",
)
```
<img src="https://raw.githubusercontent.com/Joooohan/audio-recorder-streamlit/main/img/custom.png" alt="custom.png" width="200"/>

# Frequently Asked Question
## How can I record for a fixed duration ?

You can record for a fixed duration by setting the `energy_threshold=(-1.0, 1.0)`
so that the recorder considers that you are speaking at the beginning and then
you are never speaking from this point on.

Then simply set `pause_threshold` to your desired recording length.

```python
# Records 3 seconds in any case
audio_bytes = audio_recorder(
  energy_threshold=(-1.0, 1.0),
  pause_threshold=3.0,
)
```
