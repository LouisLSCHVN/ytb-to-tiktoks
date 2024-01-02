const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

function assembling(video16_9Path, videoPortraitPath, title, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting assembling function");

      const stats = fs.statSync(videoPortraitPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
      if (fileSizeInMegabytes > 500) {
        console.error("The file is too large. Please use a smaller file.");
        reject("The file is too large. Please use a smaller file.");
        return;
      }

      ffmpeg.setFfmpegPath(ffmpegPath);
      console.log("Setting up ffmpeg command");

      ffmpeg()
        .input(video16_9Path)
        .input(videoPortraitPath)
        .complexFilter(
          `[0:v]scale=-1:768,crop=1080:768[upper];` +
            `[1:v]scale=-1:1152,crop=1080:1152[lower];` +
            `[upper][lower]vstack`
        )
        .on("stderr", function (stderrLine) {
          console.log("Stderr output: " + stderrLine);
        })
        .outputOptions("-c:v", "libx264", "-crf", "23", "-r", "60")
        .output(outputPath)
        .on("error", function (err) {
          console.log("Erreur : " + err.message);
          reject(err);
        })
        .on("end", function () {
          console.log("Finished processing tiktok video!");
        })
        .run();
    } catch (error) {
      console.error("An error occurred in the assembling function:", error);
      reject(error);
    }
  });
}

module.exports = assembling;
