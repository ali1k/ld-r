'use strict';

module.exports = {
  parseDBpediaLookup: function (body){
    var output=[];
    var desc='',parsed = JSON.parse(body);
    if(!parsed){
      return output;
    }
    parsed.results.forEach(function(el) {
      if(el.description && el.description.length>150){
        desc=el.description.substr(0, 150)+'...';
      }else{
        desc='';
      }
      output.push({title:el.label, description: desc, uri: el.uri});
    });
    return output;
  }
};
