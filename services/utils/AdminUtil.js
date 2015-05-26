'use strict';
class AdminUtil{

    parseUsers(body) {
        let parsed = JSON.parse(body);
        let output=[];
        if(parsed.results.bindings.length){
          parsed.results.bindings.forEach(function(el) {
            output.push({title: el.username.value, v: el.subject.value, isActive: el.isActive.value, isSuperUser: el.isSuperUser.value, mbox: el.mbox.value});
          });
          return output;
        }
    }

}
export default AdminUtil;
