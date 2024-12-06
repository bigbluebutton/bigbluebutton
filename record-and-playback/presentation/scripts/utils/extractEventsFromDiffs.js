let fs = require('fs');
const Changeset = require("./Changeset")
const AttributePool = require("./AttributePool");
const ExportHtml = require("./ExportHtml")

const pathOfFile = process.argv[2];
const fileNameToRead = process.argv[3];
const fileNameToWrite = process.argv[4]
const eventsToReturn = [];

const fileToRead = `${pathOfFile}/${fileNameToRead}`;
const fileToWrite = `${pathOfFile}/${fileNameToWrite}`;

fs.readFile(fileToRead, {encoding: 'utf-8'}, (err, data) => {
    if (err) throw err;
    const data_json = JSON.parse(data)
    let attr = new AttributePool();
    let actualAText = Changeset.makeAText("\n", "|1+1");
    for (var prop in data_json) {
        if (data_json[prop].changeset !== undefined && data_json[prop].meta !== undefined) {
            const currentEvent = {}
            currentEvent.timestamp = data_json[prop].meta.timestamp;
            actualAText = Changeset.applyToAText(data_json[prop].changeset, actualAText, attr)
            const actualATextHtml = ExportHtml.getHTMLFromAtext(attr, actualAText)
            currentEvent.text = actualATextHtml;
            eventsToReturn.push(JSON.parse(JSON.stringify(currentEvent)));
        }else if(data_json[prop].pool !== undefined) {
            for (var index in data_json[prop].pool.numToAttrib) {
                attr.putAttrib(data_json[prop].pool.numToAttrib[index]);
            }
        }
    }

    fs.writeFile(fileToWrite, JSON.stringify(eventsToReturn), (err) => {
        if (err) throw err;
    })
})
