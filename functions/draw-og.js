import { ImageResponse } from 'workers-og';

export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const board = searchParams.get("board");

    const map = ["fire", "water", "wood", "light", "dark", "heart", "poison", "mortal_poison", "jammer", "bomb"];
    let typeArr = decode(board);
    let html = `<div style="display: flex; flex-wrap: wrap; width: 300px; height: 250px;">`;
    let colors = ["#1c130f", "#2e201a"];
    for (let i = 0; i < typeArr.length; i++) {
        if (i % 6 == 0 && i != 0) {
            colors.reverse();
        }
        let color = (i % 2 == 0) ? colors[0] : colors[1];
        html += `<img src="http://padsolver.com/assets/orbs/${map[typeArr[i]]}.png" width="50" height="50" style="background-color:${color};">`;
    }
    html += "</div>"
    return new ImageResponse(html, { width: 300, height: 250 });
}

function decode(board) {
    let s = decodeBase62(board);
    let result = [];
    let temp = s;
    for (let i = 0; i < 30; i++) {
        result.unshift(Number(temp % 10n));
        temp = temp / 10n;
    }
    return result;
}

function decodeBase62(str) {
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0n;
    for (let char of str) {
        result = result * 62n + BigInt(ALPHABET.indexOf(char));
    }
    return result;
}
