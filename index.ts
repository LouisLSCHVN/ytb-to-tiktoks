/**
 * TODO:
 * - [ ] Put all the code into classes and methods
 * - [ ] Add some interaction in what the user can chose or not
 */

import Download from "./classes/Download.class";
import Subtitles from "./classes/Subtitles.class";
import Editor from "./classes/Editor.class";
import consola from "consola";


/**
 * const vidUrl = 'https://www.youtube.com/watch?v=it5e9jU0IiI';
 *
 * const downloader = new Download(vidUrl);
 *
 * downloader.setOutputDir('./.output');
 * const videoPath = await downloader.download("bestvideo");
 *
 * const subtitles = new Subtitles(vidUrl)
 * subtitles.setLanguage('fr');
 * await subtitles.retrieve();
 *
 *
 * const downloadAudio = new Download('https://www.youtube.com/watch?v=nh6gI_hzjdw')
 * downloadAudio.setOutputFile('audio.mp3')
 * const audioPath = await downloadAudio.download('bestaudio')
 * */

const url = "https://www.youtube.com/watch?v=gn2rzICWCuU"

/** *
 * const videoTop = new Download(url);
 * videoTop.setOutputFile(`video-top.mp4`);
 * const path = await videoTop.download();
 * consola.info(`Video downloaded at ${path}`);
 *
 * const videoBottom = new Download('https://www.youtube.com/watch?v=3clqk2U3T9Y');
 * videoBottom.setOutputFile(`video-bottom.mp4`);
 * const pathBottom = await videoBottom.download('bestvideo');
 */
const path = '.output/video-top.mp4';
const pathBottom = '.output/video-bottom.mp4';
const editor = new Editor();
await editor.makeShorts(path, pathBottom, '.output/output-short.mp4');