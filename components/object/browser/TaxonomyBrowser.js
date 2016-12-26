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
        while(continueFlag !== 1){
            continueFlag = 0;
            //find immediate parents first
            for(let prop in tree){
                continueFlag++;
                parent = child_parent[prop];
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
            if(continueFlag === 1){
                break;
            }
            //merge duplicates
            for(let prop in tree){
                for(let prop2 in tree){
                    if(prop!==prop2){
                        if(tree[prop2].children){
                            tree[prop2].children.forEach((child, index)=>{
                                if(child.id === prop){
                                    //found a match
                                    tree[prop].count = parseInt(tree[prop].count) + parseInt(child.count);
                                    tree[prop2].children[index] = tree[prop];
                                    tree[prop].active = 0;
                                }
                            });
                        }
                    }
                }
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
