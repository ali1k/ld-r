'use strict';
let flashtext_dict = require('../../data/ner_dict.json');
class CustomUtil {
    constructor() {

    }
    parseFlashTextOutput(body, stopWords) {
        let tmp = [];
        let stopWordsArr = [];
        if(stopWords){
            tmp = stopWords.split(',');
        }
        //trimming
        if(tmp.length){
            tmp.forEach((w)=>{
                stopWordsArr.push(w.trim().toLowerCase());
            });
        }
        let output = [];
        if (body.length) {
            body.forEach((el)=> {
                let dtypes = ['ldr:MatchedEntity'];
                //do not add stop words
                if(stopWordsArr.length && stopWordsArr.indexOf(flashtext_dict[el][0].toLowerCase()) !== -1){
                    //do nothing
                }else{
                    output.push({
                        uri: el,
                        types: dtypes,
                        surfaceForm: flashtext_dict[el][0]
                    });
                }
            });
        }
        return output;
    }
}
export default CustomUtil;
