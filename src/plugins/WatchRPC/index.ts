/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { ApplicationAssetUtils, FluxDispatcher } from "@webpack/common";


// copyed from plugin customRPC
interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

interface Activity {
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: ActivityAssets;
    buttons?: Array<string>;
    name: string;
    application_id: string;
    metadata?: {
        button_urls?: Array<string>;
    };
    type: ActivityType;
    url?: string;
    flags: number;
}

const enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}

const enum TimestampMode {
    NONE,
    NOW,
    TIME,
    CUSTOM,
}


async function getApplicationAsset(key: string): Promise<string> {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\//.test(key)) return "mp:" + key.replace(/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//, "");
    return (await ApplicationAssetUtils.fetchAssetIds("995095535709081670", [key]))[0];
}
// copyed from plugin customRPC \\


async function main() {
    const webSocket = new WebSocket("ws://localhost:9494");
    webSocket.onmessage = async event => {
        const json = JSON.parse(event.data);
        switch (json.event) {
            case "setActivity":
                const activity: Activity = {
                    application_id: "995095535709081670",
                    name: json.app,
                    state: json.state,
                    details: json.details,
                    type: 2,
                    flags: 1 << 0,
                    assets: {
                        large_image: await getApplicationAsset(json.largeImageKey),
                        large_text: json.largeImageText,
                        small_image: await getApplicationAsset("ytlogo4"),
                        small_text: json.smallImageText
                    }
                };
                FluxDispatcher.dispatch({
                    type: "LOCAL_ACTIVITY_UPDATE",
                    activity: activity,
                    socketId: "CustomRPC",
                });
        }
        console.log(event.data);
        webSocket.send("idk :sob:");
    };
}

export default definePlugin({
    name: "WatchRPC",
    description: "This plugin is absolutely epic",
    authors: [
        {
            id: 877743969503682612n,
            name: "WaterWolf5918",
        },
    ],
    patches: [],
    // Delete these two below if you are only using code patches
    start() { main(); },
    stop() {
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: null,
            socketId: "CustomRPC",
        });
    },
});
