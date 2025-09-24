import parseSRT from 'parse-srt'
export async function newExtract(filePath: string) {
    const response = await fetch(filePath);
    const inputSrt = await response.text();
    let jsonSubs = await parseSRT(inputSrt)
    return jsonSubs
}
