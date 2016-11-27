import React from 'react';
import URIUtil from '../../utils/URIUtil';
import CheckboxItem from './CheckboxItem';

class CheckListBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: []};
    }
    doesExist(value){
        let selected=[];
        if(!this.props.propertyURI){
            for(let prop in this.props.selection){
                selected.push(prop);
            }
        }else{
            if(this.props.selection[this.props.propertyURI]){
                this.props.selection[this.props.propertyURI].forEach((node)=>{
                    selected.push(node.value);
                });
            }
        }
        let pos = selected.indexOf(value);
        if(pos === -1){
            return false;
        }else{
            return true;
        }
    }
    handleSelect(status, value) {
        if(this.doesExist(value)){
            this.props.onCheck(0, value);
        }else{
            this.props.onCheck(1, value);
        }
    }
    render() {
        let self = this;
        let checkDIV = self.props.instances.map((node, index)=>{
            return (<CheckboxItem checked={self.doesExist(node.value)} key={index} datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={self.props.propertyURI ? node.total: 0} onCheck={self.handleSelect.bind(self)}/>);
        });
        return (
            <div className="ui" ref="checkListBrowser">
                {checkDIV}
            </div>
        );
    }
}

export default CheckListBrowser;
