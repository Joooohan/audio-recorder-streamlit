# Audio record streamlit

This streamlit component allows to register an audio utterence from a user.

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
