import React from 'react';
import URIUtil from '../../utils/URIUtil';

class TagCloudBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.tags = [];
    }
    componentDidMount() {
        if(this.tags.length){
            //$('.tagCloud').jQCloud(this.prepareTagsForCloud(this.props.DatasetAnnotationStore.tags));
            $('.tagCloud').jQCloud(this.tags, {autoResize: true});
        }
    }
    componentDidUpdate() {
        if(this.tags.length){
            //$('.tagCloud').jQCloud(this.prepareTagsForCloud(this.props.DatasetAnnotationStore.tags));
            $('.tagCloud').css('width', '100%');
            $('.tagCloud').css('height', '100%');
            $('.tagCloud').empty();
            $('.tagCloud').jQCloud('update', this.tags, {autoResize: true});
        }
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
        this.tags = [];
        let title, cls, selected = 0, style = '';
        let tagsDIV = self.props.instances.map((node, index)=>{
            if(self.doesExist(node.value)){
                selected = 1;
                cls = 'ui label basic mini';
                style='color:red;'
            }else{
                selected = 0;
                cls = '';
                style = ''
            }
            title = node.value;
            if(node.label){
                title = node.label;
            }else if(this.props.shortenURI && !(this.props.config && this.props.config.shortenURI === 0)){
                title = URIUtil.getURILabel(title);
            }
            this.tags.push({weight: parseInt(node.total), text: title, html: {style: style, title: node.value}, handlers: {click: self.selectTag.bind(this, node.value)}});
        });
        return (
            <div className='ui segment' ref="tagCloudBrowser" >
                <div ref="tagCloud" className="tagCloud" style={{minHeight: self.props.expanded ? 500 : 100, minWidth: self.props.expanded ? 500 : 100}}></div>
            </div>
        );
    }
}

export default TagCloudBrowser;
