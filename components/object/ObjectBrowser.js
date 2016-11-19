import React from 'react';
import CheckboxItem from './browser/CheckboxItem';
import TagListBrowser from './browser/TagListBrowser';

class ObjectBrowser extends React.Component {
    handleSelect(status, value) {
        this.props.onSelect(status, value);
    }
    render() {
        let self = this;
        let browser, browserConfig, output;
        if(this.props.config){
            if(this.props.config.objectBrowser){
                browserConfig = this.props.config.objectBrowser[0];
            }
        }
        switch(browserConfig){
            case 'CheckboxItem':
                browser = this.props.spec.instances.map(function(node, index) {
                    return (
                        <CheckboxItem datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={!self.props.spec.propertyURI ? 0 : node.total} onCheck={self.handleSelect.bind(self)}/>
                    );
                });
            break;
            case 'TagListBrowser':
                browser = <TagListBrowser datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            default:
            browser = this.props.spec.instances.map(function(node, index) {
                return (
                    <CheckboxItem datasetURI={self.props.datasetURI} shortenURI={self.props.shortenURI} key={index} spec={node} config={self.props.config} total={!self.props.spec.propertyURI ? 0 : node.total} onCheck={self.handleSelect.bind(self)}/>
                );
            });
        }
        output = browser;
        return (
            <div className="ui" ref="objectBrowser">
                {output}
            </div>
        );
    }
}

export default ObjectBrowser;
