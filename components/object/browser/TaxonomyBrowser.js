import React from 'react';
import URIUtil from '../../utils/URIUtil';
import Tree from './common/Tree';
import {child_parent} from '../../../data/dbpedia_en_taxonomy';

class TaxonomyBrowser extends React.Component {
    constructor(props) {
        super(props);
    }
    buildTree(instances){
        let self = this;
        let parent, label, tree = {};
        let found = 0;
        instances.forEach((instance)=>{
            //only considers dbpedia types
            if(instance.value.indexOf('dbpedia') !== -1){
                label = URIUtil.getURILabel(instance.value);
                tree[label]= {selected: self.doesExist(instance.value), value: instance.value, id: label, count: instance.total, derived: 0};
            }
        });
        let continueFlag = 0;
        const stackDepth = 10;
        let depthCounter = 0;
        let parents = [];
        while(continueFlag !== 1){
            parents = [];
            depthCounter++;
            //prevent deadlock situation
            if(depthCounter > stackDepth){
                break;
            }
            continueFlag = 0;
            //find immediate parents first
            for(let prop in tree){
                continueFlag++;
                parent = child_parent[prop];
                parents.push(parent);
                if(!parent){
                    parent = 'Thing';
                }
                if(prop==='Thing' && parent==='Thing'){
                    //do nothing when child and parent are the same
                }else{
                    if(tree[parent]){
                        if(tree[parent].children){
                            tree[parent].children.push(tree[prop]);
                        }else{
                            tree[parent].children = [tree[prop]];
                        }
                    }else{
                        tree[parent]={selected: false, value: '', active: 1, derived: 1, id: parent, count: 0, children:[tree[prop]]};
                    }
                }
            }
            let checkThings = 0;
            //if there is only Thing as parent left, stop the loop
            parents.forEach((p)=>{
                if(p !== 'Thing'){
                    checkThings++;
                }
            });
            if(!checkThings || continueFlag === 1){
                break;
            }

            //delete inactive ones
            for(let prop in tree){
                if(!tree[prop].active){
                    delete tree[prop];
                }
            }
        }
        return tree;
    }
    doesExist(value){
        let selected=[];
        if(this.props.selection[this.props.propertyURI]){
            this.props.selection[this.props.propertyURI].forEach((node)=>{
                selected.push(node.value);
            });
        }
        let pos = selected.indexOf(value);
        if(pos === -1){
            return false;
        }else{
            return true;
        }
    }
    selectTag(value) {
        if(this.doesExist(value)){
            this.props.onCheck(0, value);
        }else{
            this.props.onCheck(1, value);
        }
    }
    render() {
        let tree = this.buildTree(this.props.instances);
        return (
            <div className="ui list" ref="taxonomyBrowser">
                <Tree tree={tree.Thing} onNodeClick={this.selectTag.bind(this)}/>
            </div>
        );
    }
}

export default TaxonomyBrowser;
