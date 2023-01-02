# Development mode
Start backend:
```shell
cd audio_recorder_streamlit/frontend
npm start
```

Start frontend:
Set `_RELEASE = False` in `__init__.py` then run
```shell
streamlit run audio_recorder_streamlit/__init__.py
```

# Release version
Build backend
```shell
cd audio_recorder_streamlit/frontend
npm run build
```

Change `_RELEASE` to `True` in `audio_recorder_streamlit/__init__.py`.

Deploy package with `tox -e deploy`.
