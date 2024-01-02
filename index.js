// idée quand même vachement bien, prendre la transcription d'une vidéo,
// la donner à chatgpt et lui il doit resortir les meilleurs moments et leurs timings grâce à la transcription
// ensuite on découpe la vidéo en fonction des timings
// et on fait un montage avec les meilleurs moments

// pour l'instant mon script prend une vidéo et la découpe selon son temps
// mais je vais voir pour récupérer la transcription de la vidéo et la donner à chatgpt

// const fs = require("fs");
// const { exec } = require("child_process");

// function splitVideoIntoParts(videoPath, outputFolder) {
//   const command = `ffmpeg -i ${videoPath} -c copy -segment_time 120 -f segment ${outputFolder}/part-%03d.mp4`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error splitting video: ${error}`);
//       return;
//     }
//     console.log("Video split into parts successfully!");
//   });
// }

// const videoPath = "./backgrounds/video.mp4";
// const outputFolder = "./backgrounds/";

// splitVideoIntoParts(videoPath, outputFolder);

const readline = require("readline");
const download = require("./download");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter the video link: ", (link) => {
  download(link);
  rl.close();
});
