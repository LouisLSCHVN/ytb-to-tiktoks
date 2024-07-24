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
 *
 * const url = "https://www.youtube.com/watch?v=DG1OgqwbFv8"
 * const videoTop = new Download(url);
 * videoTop.setOutputFile(`video-top.mp4`);
 * const path = await videoTop.download();
 * /** *
 *
 *  * consola.info(`Video downloaded at ${path}`);
 *  *
 *  *
*
*
const urlBottom = "https://www.youtube.com/watch?v=_Qey9es30cI&pp=ygUQdmlkZW8gc2F0aXNmeWluZw%3D%3D"
    *
const videoBottom = new Download(urlBottom);
*
videoBottom.setOutputFile(`video-bottom.mp4`);
*
const pathBottom = await videoBottom.download('bestvideo');
*
*
*
    await editor.makeShorts(path, pathBottom, '.output/output-short-helydia.mp4');
 *
 *
*/

const editor = new Editor();
const inputPath = '.output/output-short-helydia.mp4';
const partDuration = 1000 * 65// 60 secondes en millisecondes
const title: string = 'Helydia et Fugu au ski';
const outputFolder = '.output/output-short-helydia';

try {
    //splitVideo(inputPath: string, partDuration: number, title: string, outputFolder: string): Promise<string[]>
    const outputPaths = await editor.splitVideo(inputPath, partDuration, title, outputFolder);
    console.log('Vidéos créées :', outputPaths);
} catch (error) {
    console.error('Erreur lors de la découpe de la vidéo :', error);
}