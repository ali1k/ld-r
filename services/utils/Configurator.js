'use strict';
import {config} from '../../configs/reactor';
class Configurator{
    constructor() {

    }
    prepareDatasetConfig(graphName) {
        //default config
        let output = config.dataset.generic;
        if(config.dataset[graphName]){
            //there is a user-defined config, overwrite default config then
            for(let prop in config.dataset[graphName]) {
                output[prop] = config.dataset[graphName][prop];
            }
        }
        return output;
    }

}
export default Configurator;
