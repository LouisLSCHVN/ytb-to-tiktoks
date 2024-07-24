import fs from 'fs';
import path from 'path';
import consola from "consola";
// @ts-ignore
import ytbSubs from 'youtube-transcript-api';

interface SubtitlesOptions {
    outputDir: string;
    outputFile: string;
    language: string;
}

interface SubtitleEntry {
    text: string;
    start: number;
    duration: number;
}

export default class Subtitles {
    private readonly url: string;
    private options: SubtitlesOptions;
    private subtitles: SubtitleEntry[] = [];

    constructor(url: string) {
        this.url = url;
        this.options = {
            outputDir: '.output',
            outputFile: 'subtitles.srt',
            language: 'en'
        }
    }

    /**
     * Get the language of the subtitles
     * @returns string
     */
    public getLanguage() {
        return this.options.language;
    }

    /**
     * Set the language of the subtitles
     * @param language default 'en'
     * @returns string
     */
    public setLanguage(language: string = 'en'): string {
        this.options.language = language;
        return language
    }

    /**
     * Get the subtitles
     * @returns SubtitleEntry[]
     */
    public getSubtitles(): SubtitleEntry[] {
        return this.subtitles;
    }

    /**
     * Get the video ID
     * @returns string
     */
    public getVideoId(): string {
        const url = new URL(this.url);
        return url.searchParams.get('v') || '';
    }

    /**
     * Retrieve the subtitles
     * @returns Promise<boolean>
     */
    public async retrieve(): Promise<SubtitleEntry[]> {
        const subs = await this.downloadTranscript();
        if (!subs || subs.length === 0) {
            consola.warn('No subtitles found for the specified language');
            return [];
        }
        consola.success('Subtitles retrieved successfully!');

        this.subtitles = subs;
        const parsedSubs = this.parseSubtitles(subs);
        await this.writeSubtitlesToFile(parsedSubs);
        return subs;
    }

    /**
     * Download the transcript
     * @private
     * @returns Promise<SubtitleEntry[]>
     */
    private async downloadTranscript(): Promise<SubtitleEntry[]> {
        try {
            const transcript = await ytbSubs.getTranscript(this.getVideoId(), {
                lang: this.getLanguage(),
                country: 'US'
            });
            return transcript;
        } catch (error) {
            consola.warn(`Error fetching transcript in ${this.getLanguage()}, trying auto-generated...`);
            return [];
        }
    }

    /**
     * Parse the subtitles into SRT format
     * @param subs
     * @private
     * @returns string
     */
    private parseSubtitles(subs: SubtitleEntry[]): string {
        let srtContent = '';
        subs.forEach((sub, index) => {
            const startTime = this.formatTime(sub.start);
            const endTime = this.formatTime(sub.start + sub.duration);
            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${sub.text}\n\n`;
        });
        return srtContent;
    }

    /**
     * Format the time into SRT format
     * @param seconds
     * @private
     * @returns string
     */
    private formatTime(seconds: number): string {
        const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
        return `${hh}:${mm}:${ss},${ms}`;
    }

    /**
     * Write the subtitles to a file
     * @param content
     * @private
     * @returns Promise<void>
     */
    private async writeSubtitlesToFile(content: string): Promise<void> {
        const fullPath = path.join(this.options.outputDir, this.options.outputFile);
        try {
            await fs.promises.mkdir(this.options.outputDir, { recursive: true });
            await fs.promises.writeFile(fullPath, content);
            consola.success(`Subtitles written to ${fullPath}`);
        } catch (error) {
            consola.error('Error writing subtitles to file:', error);
        }
    }
}