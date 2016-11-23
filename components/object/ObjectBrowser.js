import React from 'react';
import TagListBrowser from './browser/TagListBrowser';
import CheckListBrowser from './browser/CheckListBrowser';

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
            case 'CheckListBrowser':
                browser = <CheckListBrowser datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            case 'TagListBrowser':
                browser = <TagListBrowser datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            default:
                browser = <CheckListBrowser datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
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
