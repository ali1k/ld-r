import React from 'react';
import CheckboxItem from './CheckboxItem';

class DataBrowseReactor extends React.Component {
    handleSelect(status, value) {
        this.props.onSelect(status, value);
    }
    render() {
        let self = this;
        let browser, browserConfig, output;
        if(this.props.config){
            if(this.props.config.browser){
                browserConfig = this.props.config.browser[0];
            }
        }
        switch(browserConfig){
            case 'CheckboxItem':
                browser = this.props.spec.instances.map(function(node, index) {
                    return (
                        <CheckboxItem shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={!self.props.spec.propertyURI ? 0 : node.total} onCheck={self.handleSelect.bind(self)}/>
                    );
                });
            break;
            default:
            browser = this.props.spec.instances.map(function(node, index) {
                return (
                    <CheckboxItem key={index} shortenURI={self.props.shortenURI} spec={node} config={self.props.config} total={!self.props.spec.propertyURI ? 0 : node.total} onCheck={self.handleSelect.bind(self)}/>
                );
            });
        }
        output = browser;
        return (
            <div className="ui" ref="dataBrowseReactor">
                {output}
            </div>
        );
    }
}

export default DataBrowseReactor;
