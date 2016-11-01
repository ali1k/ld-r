'use strict';
import Immutable from 'immutable';
class ResourceStoreUtil {
    constructor() {

    }
    //main public method to be called in store
    preservePropertiesOrder(oldProps, newProps) {
        //assuming we are not inserting new rdf properties and just add multiple instances of existing properties
        let self = this;
        if (oldProps.size && oldProps.size === newProps.size) {
            newProps.forEach((v, i) => {
                newProps.get(i).updateIn('instances', self.preserveValueOrder(oldProps.get(i).get('instances'), newProps.get(i).get('instances')));
            });
        }
        return newProps;
    }
    preserveValueOrder(oldArr, newArr) {
        let output = oldArr;
        let self = this;
        let tmp;
        if (self.calculateArrLength(oldArr) < newArr.size) {
            //insertion case
            newArr.forEach((v, i)=> {
                if (self.checkInArray(newArr.get(i), oldArr).found) {
                    // preserve the order
                } else {
                    output.push({
                        value: newArr.get(i).get('value'),
                        valueType: newArr.get(i).get('valueType')
                    });
                }
            });
        } else {
            if (self.calculateArrLength(oldArr) > newArr.size) {
                //delete case
                oldArr.forEach((v, i) =>{
                    if (self.checkInArray(oldArr.get(i), newArr).found) {
                        // preserve the order
                    } else {
                        output.updateIn(i, 0);
                    }
                });
            } else {
                //in edit mode we should still preserve empty indices
                //we should update the value of our old array with 0 indices
                //only works for single changes
                tmp = self.detectChangeInArray(oldArr, newArr);
                output.updateIn(tmp.oldIndex, newArr.get(tmp.newIndex));
            }
        }
        return output;
    }
    //to detect a single update
    //caveat: does not work for batch update
    //works based on the nodes which are unchanged
    detectChangeInArray(oldArr, newArr) {
        let self = this;
        let tmp, out = 0,
            oldIndex, newIndex, foundIndices = [];
        oldArr.forEach((v, i)=> {
            //if it was not found and was not 0 it means it is the change point
            tmp = self.checkInArray(oldArr.get('i'), newArr);
            if (tmp.found) {
                foundIndices.push(tmp.index);
            } else {
                if (oldArr.get('i')) {
                    //the index in orld array when the change occured
                    oldIndex = i;
                }
            }
        });
        //check found indices to detect non-found indices
        newArr.forEach((v, i)=> {
            if (foundIndices.indexOf(i) !== -1) {
                //it is unchanged
            } else {
                //it is changed
                newIndex = i;
                out = {
                    oldIndex: oldIndex,
                    newIndex: newIndex
                };
                return out;
            }
        });
        return {
            oldIndex: oldIndex,
            newIndex: newIndex
        };
    }
        //this is required to ignore 0 values when getting array length
    calculateArrLength(arr) {
        let count = 0;
        arr.forEach((v, i) => {
            if (arr.get(i)) {
                count++;
            }
        });
        return count;
    }
    areEqualInstance(firstI, secondI) {
        if (firstI && secondI && (firstI.get('value') === secondI.get('value') ) && (firstI.get('valueType') === secondI.get('valueType'))) {
            return true;
        } else {
            return false;
        }
    }
    checkInArray(instance, arr) {
        let found = {
            found: false,
            index: 0
        };
        let self = this;
        arr.forEach((v, i)=> {
            if (self.areEqualInstance(arr.get(i), instance)) {
                //returns the index of matched element
                found = {
                    found: true,
                    index: i
                };
                return found;
            }
        });
        return found;
    }
}
export default ResourceStoreUtil;
