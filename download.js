const ytdl = require("ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const path = require("path");
const assembling = require("./assembling");
const downloadSubtitles = require("./subtitles");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
async function download(url) {
  const info = await ytdl.getInfo(url);
  let title = info.videoDetails.title;
  title = title.replace(/[<>:"\/\\|?*]+/g, "");
  title = title.replace(/ /g, "_");
  const outputFileName = path.join("videos", `${title}.mp4`);

  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
  });
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });

  const videoStream = ytdl.downloadFromInfo(info, { format: "videoFormat" });
  const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });

  let videoSize = 0;
  let lastVideoPercent = 0;

  videoStream.on("progress", (chunkLength, downloaded, total) => {
    const percent = Math.floor((downloaded / total) * 100);
    if (percent >= lastVideoPercent + 5) {
      console.log(`Downloading video : ${percent}%`);
      lastVideoPercent = percent;
    }
    videoSize = total;
  });

  let audioSize = 0;
  let lastAudioPercent = 0;

  audioStream.on("progress", (chunkLength, downloaded, total) => {
    const percent = Math.floor((downloaded / total) * 100);
    if (percent >= lastAudioPercent + 5) {
      console.log(`Downloading audio : ${percent}%`);
      lastAudioPercent = percent;
    }
    audioSize = total;
  });

  videoStream.pipe(fs.createWriteStream(path.join("videos", "video.mp4")));
  audioStream.pipe(fs.createWriteStream(path.join("videos", "audio.mp3")));

  const videoDownload = new Promise((resolve) => {
    videoStream.on("end", () => {
      console.log(`The video is download, full size : ${videoSize}`);
      resolve();
    });
  });

  const audioDownload = new Promise((resolve) => {
    audioStream.on("end", () => {
      console.log(`The audio is download, full size : ${audioSize}`);
      resolve();
    });
  });

  Promise.all([videoDownload, audioDownload]).then(() => {
    ffmpeg()
      .input(path.join("videos", "video.mp4"))
      .input(path.join("videos", "audio.mp3"))
      .outputOptions("-c:v copy") // copy video codec
      .outputOptions("-c:a aac") // convert audio codec to aac
      .on("end", () => {
        console.log("End of assembling");
        fs.unlinkSync(path.join("videos", "video.mp4"));
        fs.unlinkSync(path.join("videos", "audio.mp3"));

        // Ajout du découpage de la vidéo
        Promise.all([videoDownload, audioDownload]).then(async () => {
          // ... (code existant)

          // Ajout du découpage de la vidéo
          const emotiveMoments = await downloadSubtitles(url);
          // Appel de cutEmotiveMoments une fois la vidéo téléchargée
          cutEmotiveMoments(outputFileName, emotiveMoments);
        });
      })
      .on("error", (err) => {
        console.error("Erreur lors de l'assemblage : " + err.message);
      })
      .save(outputFileName);
  });
}

module.exports = download;

// time code = 1142.96
// time code -= 5%
// time code = 1085.81

function cutVideo(inputFile, startTime, duration, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputFile)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}
function getVideoMetadata(videoFile) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoFile, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

async function cutEmotiveMoments(videoFile, emotiveMoments) {
  console.log("Finding emotive moments");
  const videoDir = path.dirname(videoFile);
  const videoName = path.basename(videoFile, path.extname(videoFile));

  console.log("Retrieving video metadata");
  const metadata = await getVideoMetadata(videoFile);
  if (!metadata || !metadata.format) {
    console.error("Unable to retrieve video metadata");
    return;
  }
  const totalDuration = metadata.format.duration;
  console.log(`Total video duration: ${totalDuration}`);

  console.log("Starting to cut emotive moments");
  for (let i = 0; i < 4; i++) {
    console.log(`Processing emotive moment ${i + 1}`);
    const moment = emotiveMoments[i];
    if (!moment) {
      console.error(`No emotive moment found at index ${i}`);
      continue;
    }

    const tiktokOutput = path.join(
      "tiktoks",
      `${videoName}_emotive_moment_pt${i + 1}.mp4`
    );

    const start = moment.start - totalDuration * 0.07;
    const duration = 120;
    const output = path.join(
      videoDir,
      `${videoName}_emotive_moment_pt${i + 1}.mp4`
    );
    console.log(`Cutting video from ${start} to ${start + duration}`);
    try {
      await cutVideo(videoFile, start, duration, output);
      console.log(`Finished cutting emotive moment ${i + 1}`);
      const title = videoName.replace(/_/g, " "); // Remplacer les _ par des espaces
      await assembling(
        output,
        `./backgrounds/part-00${i + 1}.mp4`,
        title,
        tiktokOutput
      )
        .then(() => console.log("Assembling completed"))
        .catch((err) => console.error("An error occurred:", err));
    } catch (error) {
      console.error(`Error while processing emotive moment ${i + 1}: ${error}`);
    }
  }
  console.log("Finished cutEmotiveMoments function");
}
