import React from 'react';
import MasterBrowser from './browser/MasterBrowser';
import TagListBrowser from './browser/TagListBrowser';
import CheckListBrowser from './browser/CheckListBrowser';
import GeoListBrowser from './browser/GeoListBrowser';
import BarChartBrowser from './browser/BarChartBrowser';
import TaxonomyBrowser from './browser/TaxonomyBrowser';

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
                browser = <CheckListBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            case 'TagListBrowser':
                browser = <TagListBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            case 'GeoListBrowser':
                browser = <GeoListBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            case 'BarChartBrowser':
                browser = <BarChartBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            case 'TaxonomyBrowser':
                browser = <TaxonomyBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            break;
            default:
                browser = <CheckListBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
        }
        //treat master facet different than normal ones
        if(!self.props.spec.propertyURI){
            browser = <MasterBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
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
