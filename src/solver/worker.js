import { Solve } from "../solver/Solve.js";

onmessage = (e) =>{
    let res = new Solve(e.data.model, e.data.configs, e.data.startPositions).beamSearch();
    postMessage(res);
}