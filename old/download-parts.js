const ytdl = require("ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
async function download(url) {
  const info = await ytdl.getInfo(url);
  let title = info.videoDetails.title;
  // Remplacer les caractères non valides dans le titre
  title = title.replace(/[<>:"\/\\|?*]+/g, "");
  title = title.replace(/ /g, "_");
  const outputFileName = path.join("videos", `${title}.mp4`);

  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
  });
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });

  const videoStream = ytdl.downloadFromInfo(info, { format: videoFormat });
  const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });

  let videoSize = 0;
  let lastVideoPercent = 0;

  videoStream.on("progress", (chunkLength, downloaded, total) => {
    const percent = Math.floor((downloaded / total) * 100);
    if (percent >= lastVideoPercent + 5) {
      console.log(`Progression du téléchargement de la vidéo : ${percent}%`);
      lastVideoPercent = percent;
    }
    videoSize = total;
  });

  let audioSize = 0;
  let lastAudioPercent = 0;

  audioStream.on("progress", (chunkLength, downloaded, total) => {
    const percent = Math.floor((downloaded / total) * 100);
    if (percent >= lastAudioPercent + 5) {
      console.log(`Progression du téléchargement de l'audio : ${percent}%`);
      lastAudioPercent = percent;
    }
    audioSize = total;
  });

  videoStream.pipe(fs.createWriteStream(path.join("videos", "video.mp4")));
  audioStream.pipe(fs.createWriteStream(path.join("videos", "audio.mp3")));

  const videoDownload = new Promise((resolve) => {
    videoStream.on("end", () => {
      console.log(
        `Téléchargement de la vidéo terminé. Taille totale : ${videoSize}`
      );
      resolve();
    });
  });

  const audioDownload = new Promise((resolve) => {
    audioStream.on("end", () => {
      console.log(
        `Téléchargement de l'audio terminé. Taille totale : ${audioSize}`
      );
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
        console.log("Assemblage terminé.");
        fs.unlinkSync(path.join("videos", "video.mp4"));
        fs.unlinkSync(path.join("videos", "audio.mp3"));

        // Ajout du découpage de la vidéo
        splitVideo(outputFileName);
      })
      .on("error", (err) => {
        console.error("Erreur lors de l'assemblage : " + err.message);
      })
      .save(outputFileName);
  });
}

function splitVideo(outputFileName) {
  ffmpeg.ffprobe(outputFileName, function (err, metadata) {
    if (err) {
      console.error(
        "Erreur lors de la récupération des métadonnées de la vidéo : " +
          err.message
      );
      return;
    }

    const duration = metadata.format.duration;

    if (duration < 300) {
      console.log(
        "La vidéo fait moins de 5 minutes, pas de découpage nécessaire."
      );
    } else {
      let numberOfSplits;
      if (duration < 600) {
        numberOfSplits = 5;
      } else {
        numberOfSplits = Math.floor(duration / 60 / 9);
      }

      const splitDuration = duration / numberOfSplits;

      // Créer un nouveau dossier pour les segments de la vidéo
      const videoName = path.basename(
        outputFileName,
        path.extname(outputFileName)
      );
      const videoDir = path.join("videos", videoName);
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir);
      }

      function splitSegment(i) {
        if (i < numberOfSplits) {
          const start = splitDuration * i;
          // Nommer chaque segment en ajoutant un index à la fin du nom de la vidéo
          const output = path.join(videoDir, `${videoName}_${i + 1}.mp4`);

          console.log(`Commence le découpage du segment ${i + 1}`);

          ffmpeg(outputFileName)
            .setStartTime(start)
            .setDuration(splitDuration)
            .output(output)
            .on("end", function (err) {
              if (!err) {
                console.log(`Segment ${i + 1} a été créé`);
                // Appeler récursivement la fonction pour le prochain segment
                splitSegment(i + 1);
              } else {
                console.log("Erreur lors de la création du segment : " + err);
              }
            })
            .on("error", function (err) {
              console.log("Erreur : " + err.message);
            })
            .run();
        }
      }

      // Commencer le découpage du premier segment
      splitSegment(0);
    }
  });
}

module.exports = download;

// time code = 1142.96
// time code -= 5%
// time code = 1085.81
