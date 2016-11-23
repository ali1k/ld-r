import React from 'react';
import URIUtil from '../../utils/URIUtil';
import CheckboxItem from './CheckboxItem';

class CheckListBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: []};
    }
    handleSelect(status, value) {
        let pos = this.state.selected.indexOf(value);
        if(pos === -1){
            this.props.onCheck(1, value);
            this.state.selected.push(value);
        }else{
            this.props.onCheck(0, value);
            this.state.selected.splice(pos, 1);
        }
    }
    render() {
        let self = this;

        let checkDIV = self.props.instances.map((node, index)=>{
            return (<CheckboxItem checked={self.state.selected.indexOf(node.value) !== -1} key={index} datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={self.props.propertyURI ? node.total: 0} onCheck={self.handleSelect.bind(self)}/>);
        });
        return (
            <div className="ui" ref="checkListBrowser">
                {checkDIV}
            </div>
        );
    }
}

export default CheckListBrowser;
