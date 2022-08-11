import setuptools

setuptools.setup(
    name="audio-recorder-streamlit",
    version="0.0.3",
    author="Johan Leduc",
    author_email="johan.leduc90@gmail.com",
    description="",
    long_description="",
    long_description_content_type="text/plain",
    url="",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.8",
    install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit >= 0.63",
    ],
)
