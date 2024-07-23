/**
 * TODO:
 * - [ ] Put all the code into classes and methods
 * - [ ] Add some interaction in what the user can chose or not
 */

import Download from "./classes/Download.class";

const download = new Download('https://www.youtube.com/watch?v=nUvhwK4Asgk');
await download.download();
