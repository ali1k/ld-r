'use strict';
class ResourceStoreUtil{
    constructor() {

    }
    //main public method to be called in store
    preservePropertiesOrder (oldProps, newProps) {
      //assuming we are not inserting new rdf properties and just add multiple instances of existing properties
      let self=this;
      if(oldProps.length && oldProps.length === newProps.length){
          newProps.forEach(function(v, i) {
              newProps[i].instances=self.preserveValueOrder(oldProps[i].instances, newProps[i].instances);
        });
      }
      return newProps;
    }
    preserveValueOrder (oldArr, newArr) {
      let output = oldArr.slice();
      let self = this;
      let tmp;
      if(self.calculateArrLength(oldArr)<newArr.length){
        //insertion case
        newArr.forEach(function(v, i) {
          if(self.checkInArray(newArr[i], oldArr).found){
            // preserve the order
          }else{
            output.push({value: newArr[i].value, valueType: newArr[i].valueType});
          }
        });
      }else{
        if(self.calculateArrLength(oldArr)>newArr.length){
          //delete case
          oldArr.forEach(function(v, i) {
            if(self.checkInArray(oldArr[i], newArr).found){
              // preserve the order
            }else{
              output[i]=0;
            }
          });
        }else{
            //in edit mode we should still preserve empty indices
            //we should update the value of our old array with 0 indices
            //only works for single changes
              tmp = self.detectChangeInArray(oldArr, newArr);
              output[tmp.oldIndex] = newArr[tmp.newIndex];
        }
      }
      return output;
    }
    //to detect a single update
    //caveat: does not work for batch update
    //works based on the nodes which are unchanged
    detectChangeInArray (oldArr, newArr) {
      let self = this;
      let tmp, out = 0, oldIndex, newIndex, foundIndices = [];
      oldArr.forEach(function(v, i) {
        //if it was not found and was not 0 it means it is the change point
        tmp=self.checkInArray(oldArr[i], newArr);
        if(tmp.found){
          foundIndices.push(tmp.index);
        }else{
          if(oldArr[i]){
            //the index in orld array when the change occured
            oldIndex=i;
          }
        }
      });
      //check found indices to detect non-found indices
      newArr.forEach(function(v, i) {
        if(foundIndices.indexOf(i)!==-1){
          //it is unchanged
        }else{
          //it is changed
          newIndex=i;
          out={oldIndex: oldIndex, newIndex: newIndex};
          return out;
        }
      });
      return {oldIndex: oldIndex, newIndex: newIndex};
    }
    //this is required to ignore 0 values when getting array length
    calculateArrLength (arr){
      let count=0;
      arr.forEach(function(v, i) {
        if(arr[i]){
          count++;
        }
      });
      return count;
    }
    areEqualInstance (firstI, secondI) {
      if(firstI && secondI && (firstI.value===secondI.value) && (firstI.valueType===secondI.valueType)){
        return true;
      }else{
        return false;
      }
    }
    checkInArray (instance, arr) {
      let found={found:false, index:0};
      let self=this;
      arr.forEach(function(v, i) {
        if(self.areEqualInstance(arr[i],instance)){
          //returns the index of matched element
          found={found:true, index:i};
          return found;
        }
      });
      return found;
    }
}
export default ResourceStoreUtil;
