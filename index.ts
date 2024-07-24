/**
 * TODO:
 * - [ ] Put all the code into classes and methods
 * - [ ] Add some interaction in what the user can chose or not
 */

// import Download from "./classes/Download.class";
import Subtitles from "./classes/Subtitles.class";

const url = 'https://www.youtube.com/watch?v=it5e9jU0IiI';

/**
 * const downloader = new Download(url);
 *
 * downloader.setOutputDir('./.output');
 * await downloader.download();
 */

const subtitles = new Subtitles(url)
subtitles.setLanguage('fr');
await subtitles.retrieve();