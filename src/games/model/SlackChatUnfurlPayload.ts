import type { SlackBlockKitLayoutElement } from '../model/SlackBlockKit';
interface SlackUnfurlUrl {
  [key: string]: {
    blocks: SlackBlockKitLayoutElement[];
  };
}

export interface SlackChatUnfurlUrl {
  ts: string;
  channel: string;
  unfurls: SlackUnfurlUrl;
}
