'use strict';
class DBpediaUtil {
    constructor() {

    }
    parseDBpediaSpotlight(body) {
        let output = [];
        let desc = '',
            parsed = JSON.parse(body);
        if (!parsed) {
            return output;
        }
        let types = '';
        if (parsed.Resources && parsed.Resources.length) {
            parsed.Resources.forEach(function(el) {
                types = el['@types'];
                if (!types) {
                    types = 'DBpedia:Misc';
                }
                output.push({
                    uri: el['@URI'],
                    types: types.split(','),
                    surfaceForm: el['@surfaceForm'],
                    offset: el['@offset'],
                    similarityScore: el['@similarityScore'],
                    percentageOfSecondRank: el['@percentageOfSecondRank']
                });
            });
        }
        return output;
    }
    parseDBpediaLookup(body) {
        let output = [];
        let desc = '',
            parsed = JSON.parse(body);
        if (!parsed) {
            return output;
        }
        parsed.results.forEach(function(el) {
            if (el.description && el.description.length > 150) {
                desc = el.description.substr(0, 150) + '...';
            } else {
                desc = '';
            }
            output.push({
                title: el.label,
                description: desc,
                uri: el.uri
            });
        });
        return output;
    }
    parseDBpediaCoordinates(body) {
        let output = [];
        let desc = '',
            parsed = JSON.parse(body);
        if (!parsed) {
            return output;
        }
        parsed.results.bindings.forEach(function(el, key) {
            output.push({
                position: {
                    lat: parseFloat(el.lat.value),
                    lng: parseFloat(el.long.value)
                },
                key: el.s.value
            });
        });
        return output;
    }
}
export default DBpediaUtil;
