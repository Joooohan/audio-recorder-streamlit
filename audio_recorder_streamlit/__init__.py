import json
import os
from typing import Optional

import streamlit.components.v1 as components

_RELEASE = True

if _RELEASE:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _audio_recorder = components.declare_component(
        "audio_recorder", path=build_dir
    )
else:
    _audio_recorder = components.declare_component(
        "audio_recorder",
        url="http://localhost:3001",
    )


def audio_recorder(
    text: str = "Click to record",
    energy_threshold: float = 0.01,
    pause_threshold: float = 0.8,
    key: Optional[str] = None,
) -> Optional[bytes]:
    """Create a new instance of "audio_recorder".

    Parameters
    ----------
    text: str
        The text to display next to the recording button.
    energy_threshold: float
        The energy recording sensibility above which we consider that the user
        is speaking.
    pause_threshold: float
        The number of seconds to spend below `energy_level` to automatically
        stop the recording.
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will be
        re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    Optional[bytes]
        Bytes representing the recorded audio in the `audio/wav` format.

    """
    data = _audio_recorder(
        text=text,
        energy_threshold=energy_threshold,
        pause_threshold=pause_threshold,
        key=key,
        default=None,
    )
    audio_bytes = bytes(json.loads(data)) if data else None
    return audio_bytes


if not _RELEASE:
    import streamlit as st

    st.subheader("Audio recorder")
    audio_bytes = audio_recorder(text="", pause_threshold=2.0)
    st.text("Click to record")
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
