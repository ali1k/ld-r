import React from 'react';
import URIUtil from '../../utils/URIUtil';

class TagListBrowser extends React.Component {
    constructor(props) {
        super(props);
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
        let self = this;
        let title, cls, selected = 0;
        let tagsDIV = self.props.instances.map((node, index)=>{
            if(self.doesExist(node.value)){
                selected = 1;
                cls = 'ui label blue';
            }else{
                selected = 0;
                cls = 'ui label basic';
            }
            title = node.value;
            if(node.label){
                title = node.label;
            }else if(this.props.shortenURI && !(this.props.config && this.props.config.shortenURI === 0)){
                title = URIUtil.getURILabel(title);
            }
            return (<a style={{marginTop: 1}} key={index} className={cls} onClick={self.selectTag.bind(this, node.value)}>{title} <span className="ui small blue circular label">{node.total}</span></a>);
        });
        return (
            <div className="ui" ref="tagListBrowser">
                {tagsDIV}
            </div>
        );
    }
}

export default TagListBrowser;
