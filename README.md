# YouTube Video Analysis and Editing Tool
This Node.js project automates the process of downloading YouTube videos, analyzing their subtitles for emotive content, and then assembling edited clips in high quality. It's an innovative approach to content curation and video editing.

### Features
Video and Audio Download: Utilizes download.js to separately download video and audio components using ytdl-core and then reassemble them in high quality with ffmpeg-fluent.
Subtitle Extraction and Analysis: Extracts subtitles from YouTube videos and analyzes them for interesting or emotive segments.
Automated Video Editing: Assembles the identified interesting parts into a new video with professional quality, suitable for platforms like TikTok.

### Technologies Used
- Node.js
- ytdl-core for downloading YouTube content.
- ffmpeg-fluent for video processing and editing.
- youtube-captions-scraper for subtitle extraction.
- sentiment for analyzing the emotional content of the subtitles.

### Future Enhancements
This project is continuously evolving, with several enhancements planned for upcoming versions to provide more flexibility and functionality:

1. **Selectable Background Videos**: A feature is in the works to allow the selection of satisfying background videos through a link, offering more control over the final output.

2. **Advanced Video Segment Selection**: Upcoming updates will introduce options for more nuanced video segment selection. This will include choosing segments based on specific parts of the video, selecting starting points for video analysis and editing, and options for manual or automated segment selection based on various criteria.

3. **Customizable Subtitles and Titles**: The ability to add custom subtitles and titles to the edited videos is being developed, enabling the creation of more personalized and engaging content.


### Usage
Before running the project, you need to set up the necessary directory structure:

Create Folders: In the project root, create three folders:
- `videos`: This folder will be used to store the downloaded YouTube videos.
- `tiktoks`: The edited and processed videos will be saved in this folder.
- `backgrounds`: Add satisfying 2-minute videos in this folder. These videos will be used as backgrounds.
  
Please note that these folders are essential for the proper functioning of the project. Without them, the script may not work correctly.

To launch the project, run the index.js script from the command line. The script will prompt you to enter a YouTube video URL. This URL will then be processed by the download.js script.

```bash
node index.js
```
Once started, follow the on-screen instructions to input the YouTube video URL you wish to download and analyze.

### Workflow Process
- URL Input: The index.js script prompts the user to input the URL of a YouTube video.
- Download and Processing: download.js is invoked to separately download the audio and video tracks, then reassemble them in high quality.
- Subtitle Extraction: Subtitles are extracted and analyzed to identify emotive or interesting moments.
- Video Assembly: The video segments identified as interesting are then compiled into a new video file.

### Contributions and Support
Contributions, suggestions, and bug reports are warmly welcomed. For any assistance or to report issues, please open an issue on this GitHub repository.
