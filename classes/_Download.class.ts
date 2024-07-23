import fs from 'node:fs';
import * as path from "node:path";

import { promises as fsPromises } from 'node:fs';

import ytbDl from 'youtube-dl-exec'
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import consola from "consola";


interface DownloadOptions {
    outputDir?: string;
    defaultVideoQuality?: string;
    defaultAudioQuality?: string;
}

export default class Download {
    private readonly url: string;
    private title: string | undefined;
    private info: ytdl.videoInfo | undefined;

    private readonly options: DownloadOptions;

    private USER_AGENT: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    /**
     * Creates a new Download instance
     * @param url The YouTube video URL to download
     */
    public constructor(url: string) {
        this.url = url;
        this.options = {
            outputDir: 'videos',
            defaultVideoQuality: 'highest',
            defaultAudioQuality: 'highestaudio',
        };
    }

    /**
     * Initializes the video information
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        consola.start('Initializing video information...');
        this.info = await ytdl.getInfo(this.url);
        this.title = this.formatTitle(this.info.videoDetails.title);
    }

    /**
     * Returns the video URL
     * @returns {string}
     */
    public getUrl(): string {
        return this.url;
    }

    /**
     * Validates the video URL
     * @param url
     * @private
     */
    private validateUrl(url: string): boolean {
        return ytdl.validateURL(url);
    }

    /**
     * Returns the video title
     * @returns {string | undefined}
     */
    public getTitle(): string | undefined {
        return this.title;
    }

    /**
     * Formats the video title by replacing non-alphanumeric characters with underscores
     * @returns {string | undefined}
     */
    public formatTitle(title: string): string | undefined {
        if (this.title) title = this.title;
        return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    /**
     * Returns the video information
     * @returns {ytdl.videoInfo | undefined}
     */
    public getInfo(): ytdl.videoInfo | undefined {
        return this.info;
    }

    /**
     * Sets the audio format to use
     * @param format The audio format
     */
    public setAudioFormat(format: string): void {
        this.options.defaultAudioQuality = format;
    }

    /**
     * Sets the video format to use
     * @param format The video format
     */
    public setVideoFormat(format: string): void {
        this.options.defaultVideoQuality = format;
    }

    /**
     * Gets the audio format
     * @returns {Promise<ytdl.videoFormat>}
     */
    public async getAudioFormat(): Promise<ytdl.videoFormat> {
        await this.init();
        const format = ytdl.chooseFormat(this.info!.formats, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        if (!format) {
            consola.error(Error('Audio format not found.'));
        }
        return format;
    }

    /**
     * Gets the video format
     * @returns {Promise<ytdl.videoFormat>}
     */
    public async getVideoFormat(): Promise<ytdl.videoFormat> {
        await this.init();
        const format = ytdl.chooseFormat(this.info!.formats, {
            quality: 'highestvideo',
            filter: 'videoonly'
        });
        if (!format) {
            consola.error(Error('Video format not found.'));
        }
        return format;
    }

    /**
     * Gets all available formats
     * @returns {Promise<ytdl.videoFormat[]>}
     */
    public async getAvailableFormats(): Promise<ytdl.videoFormat[]> {
        await this.init();
        return this.info!.formats;
    }

    /**
     * Ensures the directory exists
     * @param filePath
     * @private
     */
    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const directory = path.dirname(filePath);
        try {
            await fsPromises.access(directory);
        } catch (error) {
            // The directory does not exist, create it
            await fsPromises.mkdir(directory, { recursive: true });
        }
    }

    /**
     * Downloads the audio stream
     * @returns {Promise<string>}
     */
    public async audio(): Promise<string> {
        if (!this.info || !this.title) consola.error(Error('Not initialized'));
        const audioFormat = await this.getAudioFormat();
        const outputPath = path.join('videos', `${this.title}_audio.mp3`);
        return this.downloadStream(this.info!, audioFormat, outputPath, 'audio');
    }

    /**
     * Downloads the video stream
     * @returns {Promise<string>}
     */
    public async video(): Promise<string> {
        if (!this.info || !this.title) consola.error(Error('Not initialized'));
        const videoFormat = await this.getVideoFormat();
        const outputPath = path.join('videos', `${this.title}_video.mp4`);
        return this.downloadStream(this.info!, videoFormat, outputPath, 'video');
    }

    /**
     * Downloads both audio and video in parallel
     * @returns {Promise<void>}
     */
    public async download(): Promise<string> {
        if (!this.validateUrl(this.url)) {
            throw new Error('Invalid YouTube URL');
        }

        try {
            consola.start('Starting download process');
            await this.init();
            consola.info('Initialization complete');

            consola.start('Downloading video');
            const videoPath = await this.video();
            consola.success('Video download complete');

            consola.start('Downloading audio');
            const audioPath = await this.audio();
            consola.success('Audio download complete');

            const outputPath = path.join(this.options.outputDir!, `${this.title}.mp4`);
            consola.start('Merging audio and video');
            await this.mergeAudioVideo(videoPath, audioPath, outputPath);
            consola.success('Merge complete');

            console.log(`Downloaded video to: ${outputPath}`);
            return outputPath;
        } catch (error) {
            consola.error('An error occurred while downloading the video:', error);
            await this.cleanup();
            throw error;
        }
    }

    public async mergeAudioVideo(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
        await this.ensureDirectoryExists(outputPath);
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(videoPath)
                .input(audioPath)
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .on('end', () => {
                    fs.unlinkSync(videoPath);
                    fs.unlinkSync(audioPath);
                    resolve();
                })
                .on('error', reject)
                .save(outputPath);
        });
    }

    /**
     * Downloads the stream
     * @param info
     * @param format
     * @param outputPath
     * @param type
     * @private
     */
    private async downloadStream(info: ytdl.videoInfo, format: ytdl.videoFormat, outputPath: string, type: 'video' | 'audio'): Promise<string> {
        if (!this.validateUrl(this.url)) {
            consola.error('Invalid YouTube URL');
            throw new Error('Invalid YouTube URL');
        }
        await this.ensureDirectoryExists(outputPath);
        return new Promise((resolve, reject) => {
            const stream = ytdl.downloadFromInfo(info,
                {
                    format: format, requestOptions: {
                    headers: { 'User-Agent': this.USER_AGENT }
                }
            });
            consola.info(`Downloading ${type} to: ${outputPath}, and format: ${format.qualityLabel || format.audioBitrate}, ${format.container}`);
            consola.info(`Format details: itag=${format.itag}, container=${format.container}, codecs=${format.codecs}, quality=${format.qualityLabel || format.audioQuality}`);

            let downloadedBytes = 0;
            stream.on("data", (chunk) => {
                downloadedBytes += chunk.length;
                consola.info(`Downloaded ${downloadedBytes} bytes of ${type}`);
            });

            stream.on("progress", (_, downloaded, total) => {
                const percent = Math.floor((downloaded / total) * 100);
                consola.start(`Downloading ${type}: ${percent}%`);
            });

            stream.on("end", () => {
                consola.info(`${type} stream ended`);
            });

            stream.on("error", (error) => {
                consola.error(`Error in ${type} stream:`, error.message);
                reject(error.message);
            });

            const writeStream = fs.createWriteStream(outputPath);
            writeStream.on('ready', () => consola.info(`${type} write stream ready`));
            writeStream.on('finish', () => {
                consola.info(`${type} write stream finished`);
                resolve(outputPath);
            });
            writeStream.on('error', (error) => {
                consola.error(`Error in ${type} write stream:`, error);
                reject(error);
            });

            stream.pipe(writeStream).on('error', reject);
        });
    }

    private async cleanup() {
        if (this.title) {
            const videoPath = path.join(this.options.outputDir!, `${this.title}_video.mp4`);
            const audioPath = path.join(this.options.outputDir!, `${this.title}_audio.mp3`);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }
        }
    }

    public async downloadTest() {
        const res = await ytbDl(this.getUrl(), {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        })
        console.log(res);
    }
}