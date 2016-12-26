import React from 'react';
import URIUtil from '../../utils/URIUtil';
import {child_parent} from '../../../data/dbpedia_en_taxonomy';

class TaxonomyBrowser extends React.Component {
    constructor(props) {
        super(props);
    }
    buildTree(instances){
        let parent, label, tree = {};
        let found = 0;
        instances.forEach((instance)=>{
            //only considers dbpedia types
            if(instance.value.indexOf('dbpedia') !== -1){
                label = URIUtil.getURILabel(instance.value);
                tree[label]= {id: label, count: instance.total};
            }
        });
        let continueFlag = 1;
        while(continueFlag){
            //find immediate parents first
            for(let prop in tree){
                parent = child_parent[prop];
                if(!parent){
                    parent = 'Thing';
                }
                //finish when only Thing can be returned
                if(parent!== 'Thing'){
                    continueFlag = 1;
                }else{
                    continueFlag = 0;
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
                        tree[parent]={active: 1, id: parent, count: 0, children:[tree[prop]]};
                    }
                }
            }
            if(!continueFlag){
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
                                    tree[prop].count = tree[prop].count + child.count;
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
        console.log(tree);
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
        this.buildTree(this.props.instances);
        let self = this;
        let title, cls, selected = 0;
        let tagsDIV = self.props.instances.map((node)=>{
            if(self.doesExist(node.value)){
                selected = 1;
                cls = 'ui label blue';
            }else{
                selected = 0;
                cls = 'ui label basic';
            }
            title = node.value;
            title = URIUtil.getURILabel(title);
            return (<a style={{marginTop: 1}} key={node.value} className={cls} onClick={self.selectTag.bind(this, node.value)}>{title} <span className="ui small blue circular label">{node.total}</span></a>);
        });
        return (
            <div className="ui" ref="taxonomyBrowser">
                {tagsDIV}
            </div>
        );
    }
}

export default TaxonomyBrowser;
