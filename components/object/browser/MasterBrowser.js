import React from 'react';
import CheckboxItem from './common/CheckboxItem';
import { Accordion } from 'semantic-ui-react';

class MasterBrowser extends React.Component {
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
        let cpanels = [];
        let categoryObj = {};
        let categoryOthers = [];
        self.props.instances.forEach((node)=>{
            if(node.category && node.category.length){
                if(categoryObj[node.category[0]]){
                    categoryObj[node.category[0]].push(node);
                }else{
                    categoryObj[node.category[0]]=[node];
                }
            }else{
                categoryOthers.push(node);
            }
        });
        let checkDIV;
        let checkDIVc;
        let keyI = 0;
        for(let prop in categoryObj){
            checkDIVc = categoryObj[prop].map((node, index)=>{
                return (<CheckboxItem checked={self.doesExist(node.value)} key={index} datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={self.props.propertyURI ? node.total: 0} onCheck={self.handleSelect.bind(self)}/>);
            });
            keyI++;
            //cpanels.push({title: prop, content: checkDIVc});
            cpanels.push({
                content: {
                    content: checkDIVc,
                    key: prop + keyI
                },
                title: prop
            });
        }
        //add others to the end
        if(cpanels.length){
            if(categoryOthers.length){
                checkDIVc = categoryOthers.map((node, index)=>{
                    return (<CheckboxItem checked={self.doesExist(node.value)} key={index} datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={self.props.propertyURI ? node.total: 0} onCheck={self.handleSelect.bind(self)}/>);
                });
                //cpanels.push({title: 'Others', content: checkDIVc});
                cpanels.push({
                    content: {
                        content: checkDIVc,
                        key: 'Others' + keyI
                    },
                    title: 'Others'
                });
            }
            checkDIV= <Accordion panels={cpanels} styled exclusive={false} fluid />;
        }else{
            checkDIV = self.props.instances.map((node, index)=>{
                return (<CheckboxItem checked={self.doesExist(node.value)} key={index} datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={self.props.propertyURI ? node.total: 0} onCheck={self.handleSelect.bind(self)}/>);
            });
        }
        return (
            <div className="ui" ref="masterBrowser">
                {checkDIV}
            </div>
        );
    }
}

export default MasterBrowser;
