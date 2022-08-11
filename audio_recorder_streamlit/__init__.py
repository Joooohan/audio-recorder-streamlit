import json
import os
from typing import Optional

import streamlit.components.v1 as components

_RELEASE = True

if not _RELEASE:
    _audio_recorder = components.declare_component(
        "audio_recorder",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _audio_recorder = components.declare_component("audio_recorder", path=build_dir)


def audio_recorder(text="Click to record", key=None) -> Optional[bytes]:
    """Create a new instance of "audio_recorder".

    Parameters
    ----------
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    Optional[bytes]
        Bytes representing the recorded audio in the `audio/wav` format.

    """
    data = _audio_recorder(text=text, key=key, default=None)
    audio_bytes = bytes(json.loads(data)) if data else None
    return audio_bytes


if not _RELEASE:
    import streamlit as st

    st.subheader("Audio recorder")
    audio_bytes = audio_recorder(text="")
    st.text("Click to record")
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
