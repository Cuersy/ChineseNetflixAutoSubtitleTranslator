/*                           
                             ^
                            ^^^
                          ^^^^^^^
                         ^^^^^^^^^
                        ^^^^^^^^^^^
                       ^^^^^^^^^^^^^ 
                      ^^^^^^^^^^^^^^^
                     ||||||||||||||||
                  _||                ||_
                 |        ~~~~~~        |
                 |                      |
                 |    ALL COPYRIGHTS    |
                 |       RESERVED       |
                 |                      |
             ____|______|_______|_______|____
            |                                |
            |        MADE BY CUERSY          |
            |                                |
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        /                                       \
       /_________________________________________\
       |                                         |
       |     [ ]                     [ ]         |
       |     [ ]                     [ ]         |
       |                 [ ]    [ ]              |
                       /____________\
                       /____________\
                       /____________\
*/
'use strict';
//SETTING
const language = "tr"
//////////////////

const deepl = require("deepl-node");
const xml2js = require('xml2js');
const fs = require("fs");
const axios = require("axios").default;

const auth_key = "45ec84c3-"; // your deepl api-key
const translator = new deepl.Translator(auth_key);
const xml_builder = new xml2js.Builder();
const xml_parser = new xml2js.Parser();

async function convert_json_to_xml(input_file, output_file) {
    try {
        const json_data = fs.readFileSync(input_file, 'utf-8');
        const parsed_json = JSON.parse(json_data);
        const xml_data = xml_builder.buildObject({ xml: { dia: parsed_json } });
        fs.writeFileSync(output_file, xml_data, 'utf-8');
        console.log(`xml file successfully saved: ${output_file}`);
    } catch (error) {
        console.error("Error while converting json to xml:", error);
    }
}

async function process_subtitles(response) {
    try {
        const parsed_xml = await xml_parser.parseStringPromise(response.data);
        const subtitles = await Promise.all(
            parsed_xml.xml.dia.map(async (item) => {
                const translation = await translator.translateText(item.sub[0], null, language);
                return {
                    sub: translation.text,
                    style: item.style,
                    st: item.st,
                    et: item.et,
                };
            })
        );
        return subtitles;
    } catch (error) {
        console.error("Error in process_subtitles:", error);
        throw error;
    }
}

async function main() {
    try {
        const response = await axios.get("https://meta.video.iqiyi.com/20240112/e2/5d/339c1036e0b133bc0bbfe8cd97a9671f.xml?qd_uid=0&qd_tm=1736032365246&qd_tvid=6396971823983200&qyid=bd2acec310534e8764847ccc784ddb24&lid"); // serie's english subtitle xml link (you can find in network section)
        const subtitles = await process_subtitles(response);

        fs.writeFile("output.json", JSON.stringify(subtitles, null, 2), (error) => {
            if (error) {
                console.error("Error writing to file:", error);
            } else {
                console.log("JSON file written successfully");
                convert_json_to_xml("output.json", "output.xml");
            }
        });
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main();
