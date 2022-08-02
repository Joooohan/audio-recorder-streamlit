import React, { useState, useEffect } from "react";
import tw from "twin.macro";
// import styled from "styled-components";
import { SectionHeading as HeadingTitle } from "../misc/Headings.js";
import { ReactComponent as SvgDecoratorBlob1 } from "../../images/svg-decorator-blob-1.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "../../images/svg-decorator-blob-3.svg";
import { ReactComponent as SvgPrevIcon } from "../../images/prev-icon.svg";
import { ReactComponent as SvgNextIcon } from "../../images/next-icon.svg";
import AudioReactRecorder, {
  RecordState,
} from "components/accentpal/AudioRecorder";
import { config } from "Constants.js";
import RecordButton from "components/accentpal/RecordButton.js";
import PlayButton from "components/accentpal/PlayButton.js";
import PhonemeViewer from "components/accentpal/PhonemeViewer.js";
import { Tooltip } from "@material-ui/core";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;
const HorizontalContainer = tw.div`flex flex-row items-center`;
const VerticalContainer = tw.div`flex flex-col items-center`;

const HeadingDescription = tw.p`mt-2 text-xl font-medium text-gray-600 text-center max-w-sm`;
const TextToRead = tw.p`m-4 font-normal text-gray-800 text-center text-xl max-w-sm`;
const Audio = tw.audio`mt-4`;
const Image = tw.img`m-4 h-40 w-48 sm:h-64 sm:w-96 rounded-lg inline`;

const DecoratorBlob1 = tw(
  SvgDecoratorBlob1
)`-z-10 absolute bottom-0 right-0 w-48 h-48 transform translate-x-40 -translate-y-8 opacity-25`;
const DecoratorBlob2 = tw(
  SvgDecoratorBlob2
)`-z-10 absolute top-0 left-0 w-48 h-48 transform -translate-x-32 translate-y-full opacity-25`;

export default () => {
  const title = "Try the demo";
  const description = "Click and speak";

  const [recordState, setRecordState] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [text, setText] = useState("no word");
  const [imageSrc, setImageSrc] = useState("");
  const [target, setTarget] = useState([]);
  const [pred, setPred] = useState([]);
  const [recorderHeight, setRecorderHeight] = useState("150");
  const [examples, setExamples] = useState([]);
  const [examplesPhonemes, setExamplesPhonemes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [recordColor, setRecordColor] = useState("white");
  const [radius, setRadius] = useState("0");
  const [playCircleRef, setPlayCircleRef] = useState("#F0F3F4");
  const [playIconRef, setPlayIconRef] = useState("#4F4F4F");
  const [playCircleSelf, setPlayCircleSelf] = useState("#F0F3F4");
  const [playIconSelf, setPlayIconSelf] = useState("#4F4F4F");
  const _cache = {};

  useEffect(() => {
    async function submitAudio() {
      if (!audioData) {
        return;
      }

      const fdata = new FormData();
      fdata.append("text", text);
      fdata.append("audio", audioData.blob);
      await fetch(`${config.API_URL}/api/utterance`, {
        method: "POST",
        body: fdata,
      })
        .then((response) => response.json())
        .then((data) => presentResult(data))
        .catch((error) =>
          console.log(`An error occurred sending the audio. ${error}`)
        );
    }

    submitAudio();
  }, [audioData, text]);

  useEffect(() => {
    async function fetchSentence() {
      await fetch(`${config.API_URL}/api/sentence`, {
        method: "GET",
      })
        .then((response) => response.json())
        .catch((error) =>
          console.log(` Error: fetching the sentence to pronounce. ${error}`)
        )
        .then((data) => {
          const fetched_examples = data["examples"];
          setExamples(fetched_examples);
          setText(fetched_examples[current]["word"]);
          setImageSrc(fetched_examples[current]["imageSrc"]);
          setTarget(fetched_examples[current]["target"]);
        })
        .catch((error) =>
          console.log(
            `An error occured while fetching the sentence to pronounce. ${error}`
          )
        );
    }

    fetchSentence();
  }, []);

  useEffect(() => {
    async function fetchPhonemesExamples() {
      await fetch(`${config.API_URL}/api/examples`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          setExamplesPhonemes(data["examples"]);
          console.log(data["examples"]);
        })
        .catch((error) =>
          console.log(
            `An error occured while fetching the phonemes examples. ${error}`
          )
        );
    }

    fetchPhonemesExamples();
  }, []);

  useEffect(() => {
    if (examples.length > 0) {
      setText(examples[current]["word"]);
      setImageSrc(examples[current]["imageSrc"]);
      setTarget(examples[current]["target"]);
      setAudioData(null);
      setPred("");
    }
  }, [current, examples]);

  const presentResult = (data) => {
    setPred(data["pred"]);
  };

  const handleClick = () => {
    if (recordState !== RecordState.START) {
      setRecordState(RecordState.START);
      setRecorderHeight("0");
      setTimeout(() => {
        setRecordColor("#FBC4AC");
      }, 500);
    } else {
      setRecordState(RecordState.STOP);
    }
  };

  const handleStop = (data) => {
    setRecordState(RecordState.STOP);
    setRecorderHeight("0");
    setRadius("0");
    setRecordColor("white");
    setAudioData(data);
  };

  const getVoices = (locale) => {
    if (_cache[locale]) return _cache[locale];

    const synth = window.speechSynthesis;
    const _voices = synth.getVoices();
    _cache[locale] = _voices.filter((voice) => voice.lang === locale);
    return _cache[locale];
  };

  const speakWord = () => {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance();
    const voices = getVoices("en-US");
    utterThis.voice = voices[0];
    utterThis.lang = "en-US";
    utterThis.rate = 0.7;
    utterThis.text = text;
    utterThis.onend = () => {
      setPlayCircleRef("#F0F3F4");
      setPlayIconRef("#4F4F4F");
    };
    setPlayCircleRef("#515151");
    setPlayIconRef("white");
    synth.speak(utterThis);
  };

  const playAudio = () => {
    const audio = document.getElementById("audio");
    audio.onended = () => {
      setPlayCircleSelf("#F0F3F4");
      setPlayIconSelf("#4F4F4F");
    };
    setPlayCircleSelf("#515151");
    setPlayIconSelf("white");
    audio.play();
  };

  const handleNext = () => {
    setCurrent((current + 1) % examples.length);
  };

  const handlePrev = () => {
    let new_value = current - 1;
    if (new_value < 0) {
      new_value += examples.length;
    }
    setCurrent(new_value);
  };

  return (
    <Container id="demo">
      <Content>
        <VerticalContainer>
          <HeadingTitle>{title}</HeadingTitle>
          <HeadingDescription>{description}</HeadingDescription>
          <HorizontalContainer>
            <Tooltip title="Previous">
              <SvgPrevIcon onClick={handlePrev} />
            </Tooltip>
            <Image src={imageSrc} />
            <Tooltip title="Next">
              <SvgNextIcon onClick={handleNext} />
            </Tooltip>
          </HorizontalContainer>
          <TextToRead>{text}</TextToRead>
          <HorizontalContainer>
            <PhonemeViewer phonemes={target} examples={examplesPhonemes} />
            <PlayButton
              onClick={speakWord}
              circleColor={playCircleRef}
              iconColor={playIconRef}
            />
          </HorizontalContainer>
          {pred.length !== 0 ? (
            <HorizontalContainer>
              <PhonemeViewer phonemes={pred} examples={examplesPhonemes} />
              <PlayButton
                onClick={playAudio}
                circleColor={playCircleSelf}
                iconColor={playIconSelf}
              />
            </HorizontalContainer>
          ) : null}
          <RecordButton
            fillColor={recordColor}
            radius={radius}
            onClick={handleClick}
          />
          <AudioReactRecorder
            setRadius={setRadius}
            state={recordState}
            onStop={handleStop}
            backgroundColor="rgb(255,255,255)"
            canvasHeight={recorderHeight}
            canvasWidth="0"
          />
          {audioData ? (
            <Audio
              id="audio"
              // controls
              src={audioData ? audioData.url : null}
            />
          ) : null}
        </VerticalContainer>
      </Content>
      <DecoratorBlob1 />
      <DecoratorBlob2 />
    </Container>
  );
};
