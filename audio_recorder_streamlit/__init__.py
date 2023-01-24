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
    neutral_color: str = "#303030",
    recording_color: str = "#de1212",
    icon_name: str = "microphone",
    icon_size: str = "3x",
    sample_rate: Optional[int] = None,
    key: Optional[str] = None,
) -> Optional[bytes]:
    """Create a new instance of "audio_recorder".

    Parameters
    ----------
    text: str
        The text to display next to the recording button.
    energy_threshold: Union[float, Tuple[float, float]]
        The energy recording sensibility above which we consider that the user
        is speaking. If it is a float, then this is the energy threshold used
        to automatically detect recording start and recording end. You can
        provide a tuple for specifying different threshold for recording start
        detection and recording end detection.
    pause_threshold: float
        The number of seconds to spend below `energy_level` to automatically
        stop the recording.
    neutral_color: str
        Color of the recorder icon while stopped.
    recording_color: str
        Color of the recorder icon while recording.
    icon_name: str
        Font Awesome solid icon name
        (https://fontawesome.com/search?o=r&s=solid)
    icon_size: str
        Size of the icon (https://fontawesome.com/docs/web/style/size)
    sample_rate: Optional[int]
        Sample rate of the recorded audio. If not provided, this will use the
        default sample rate
        (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext).
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will be
        re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    Optional[bytes]
        Bytes representing the recorded audio in the `audio/wav` format.

    """
    if type(energy_threshold) in [list, tuple]:
        start_threshold, end_threshold = energy_threshold
    else:
        start_threshold = energy_threshold
        end_threshold = energy_threshold

    data = _audio_recorder(
        text=text,
        start_threshold=start_threshold,
        end_threshold=end_threshold,
        pause_threshold=pause_threshold,
        neutral_color=neutral_color,
        recording_color=recording_color,
        icon_name=icon_name,
        icon_size=icon_size,
        sample_rate=sample_rate,
        key=key,
        default=None,
    )
    audio_bytes = bytes(json.loads(data)) if data else None
    return audio_bytes


if not _RELEASE:
    import streamlit as st

    st.subheader("Base audio recorder")
    base_audio_bytes = audio_recorder(key="base")
    if base_audio_bytes:
        st.audio(base_audio_bytes, format="audio/wav")

    st.subheader("Custom recorder")
    custom_audio_bytes = audio_recorder(
        text="",
        recording_color="#e8b62c",
        neutral_color="#6aa36f",
        icon_name="user",
        icon_size="6x",
        sample_rate=41_000,
        key="custom"
    )
    st.text("Click to record")
    if custom_audio_bytes:
        st.audio(custom_audio_bytes, format="audio/wav")

    st.subheader("Fixed length recorder")
    fixed_audio_bytes = audio_recorder(
        energy_threshold=(-1.0, 1.0),
        pause_threshold=3.0,
        key="fixed",
    )
    st.text("Click to record 3 seconds")
    if fixed_audio_bytes:
        st.audio(fixed_audio_bytes, format="audio/wav")
