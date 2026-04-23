
import { ImageResponse } from 'workers-og';

export async function onRequest(context) {
    //const { searchParams } = new URL(context.request.url);    
    //const gridId = searchParams.get("board");

    const html = `<div style="display: flex; flex-wrap: wrap; gap:2px; width: 312px; height: 260px;">`;
    for (let i = 0; i < 30; i++) {
        html += `<img src="https://padsolver.com/assets/orbs/dark.png" width="50" height="50">`;
    }
    html += "</div>"
    return new ImageResponse(html, { width: 312, height: 260 });
}