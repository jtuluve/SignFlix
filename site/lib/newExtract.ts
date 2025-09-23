import parseSRT from 'parse-srt'
export async function newExtract(filePath: string) {
    const response = await fetch(`http://localhost:3000/${filePath}`);
    const inputSrt = await response.text();
    let jsonSubs = await parseSRT(inputSrt)
    return jsonSubs
}
