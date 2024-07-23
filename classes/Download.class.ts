import * as path from "node:path";
import { promises as fsPromises } from 'node:fs';
import youtubedl from 'youtube-dl-exec';
import consola from "consola";

interface DownloadOptions {
    outputDir?: string;
    defaultVideoQuality?: string;
    defaultAudioQuality?: string;
}

export default class Download {
    private readonly url: string;
    private title: string | undefined;
    private info: any | undefined;

    private readonly options: DownloadOptions;

    public constructor(url: string) {
        this.url = url;
        this.options = {
            outputDir: '.output',
            defaultVideoQuality: 'bestvideo',
            defaultAudioQuality: 'bestaudio',
        };
    }

    public async init(): Promise<void> {
        consola.box("WELCOME !");
        console.info("Your video will be downloaded in the '.output' folder");
        consola.start('Initializing video information...');
        this.info = await youtubedl(this.url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });
        this.title = this.formatTitle(this.info.title);
        consola.success('Initialization complete');
    }

    public getUrl(): string {
        return this.url;
    }

    public getTitle(): string | undefined {
        return this.title;
    }

    public formatTitle(title: string): string | undefined {
        return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    public getInfo(): any | undefined {
        return this.info;
    }

    public setAudioFormat(format: string): void {
        this.options.defaultAudioQuality = format;
    }

    public setVideoFormat(format: string): void {
        this.options.defaultVideoQuality = format;
    }

    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const directory = path.dirname(filePath);
        try {
            await fsPromises.access(directory);
        } catch (error) {
            await fsPromises.mkdir(directory, { recursive: true });
        }
    }

    public async download(): Promise<string> {
        try {
            await this.init();

            consola.start('Starting download process');
            const outputPath = path.join(this.options.outputDir!, `${this.title}.mp4`);
            await this.ensureDirectoryExists(outputPath);

            const downloadProcess = youtubedl.exec(this.url, {
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                mergeOutputFormat: 'mp4',
                output: outputPath,
            });

            downloadProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString();
                if (output.includes('%')) {
                    const progressMatch = output.match(/(\d+\.\d+)%/);
                    if (progressMatch) {
                        const progress = parseFloat(progressMatch[1]);
                        consola.info(`Download progress: ${progress.toFixed(1)}%`);
                    }
                }
            });

            await downloadProcess;

            consola.success('Download complete');
            console.log(`Downloaded video to: ${outputPath}`);
            return outputPath;
        } catch (error) {
            consola.error('An error occurred while downloading the video:', error);
            throw error;
        }
    }
}