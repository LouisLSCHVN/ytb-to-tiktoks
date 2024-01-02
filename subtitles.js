const ytdl = require("ytdl-core");
const fs = require("fs");
const { getSubtitles } = require("youtube-captions-scraper");

let emotiveMoments = [];
async function downloadSubtitles(url) {
  try {
    console.log("Retrieving video subtitles...");
    const info = await ytdl.getInfo(url);

    if (info.videoDetails.captions) {
      const tracks =
        info.videoDetails.captions.playerCaptionsTracklistRenderer
          .captionTracks;
      const frenchTrack = tracks.find((track) => track.languageCode === "fr");

      if (frenchTrack) {
        console.log("Downloading subtitles...");
        const res = await fetch(frenchTrack.baseUrl);
        const text = await res.text();
        fs.writeFileSync("subtitles.vtt", text);
        console.log("Subtitles downloaded.");
        console.log(text);
        findInterestingParts(text);
      }
    }

    console.log(
      "No subtitles available, retrieving auto-generated subtitles..."
    );
    const subtitles = await getSubtitles({
      videoID: url.split("v=")[1],
      lang: "fr",
    });

    if (subtitles && subtitles.length) {
      console.log("Subtitles retrieved.");
      const text = subtitles
        .map((sub) => `${sub.start} - ${sub.end || ""}: ${sub.text}`)
        .join("\n");
      fs.writeFileSync("subtitles.vtt", text);
      console.log("Subtitles saved.");
      emotiveMoments = findInterestingParts(subtitles); // Return subtitles with timings
      return emotiveMoments;
    } else {
      console.log("No subtitles available for this video.");
    }
  } catch (error) {
    console.error("Error downloading subtitles:", error);
  }
}

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

function findInterestingParts(transcript) {
  let interestingParts = [];
  const blockSize = 10;

  for (let i = 0; i < transcript.length; i += blockSize) {
    const block = transcript.slice(i, i + blockSize);
    const blockText = block.map((segment) => segment.text).join(" ");
    const blockStart = block[0].start;
    const blockEnd = block[block.length - 1].end;

    const result = sentiment.analyze(blockText);
    if (result.score !== 0) {
      interestingParts.push({
        start: blockStart,
        end: blockEnd,
        text: blockText,
        score: result.score,
      });
    }
  }

  emotiveMoments = interestingParts;
  bestMoments();
  return interestingParts;
}

function bestMoments() {
  emotiveMoments = emotiveMoments.sort((a, b) => b.score - a.score);
  return emotiveMoments;
}

module.exports = downloadSubtitles;
