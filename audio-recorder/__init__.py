import os
from typing import Optional

import streamlit.components.v1 as components

_RELEASE = False

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _audio_recorder = components.declare_component(
        "audio_recorder",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _audio_recorder = components.declare_component("audio_recorder", path=build_dir)


def audio_recorder(key=None) -> Optional[bytes]:
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
    data = _audio_recorder(key=key, default=None)
    audio_bytes = bytes(json.loads(data)) if data else None
    return audio_bytes


if not _RELEASE:
    import json

    import streamlit as st

    st.subheader("Audio recorder")
    audio_bytes = audio_recorder()
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
