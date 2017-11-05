import React from 'react';
import MasterBrowser from './browser/MasterBrowser';
import TagListBrowser from './browser/TagListBrowser';
import CheckListBrowser from './browser/CheckListBrowser';
import GeoListBrowser from './browser/GeoListBrowser';
import BarChartBrowser from './browser/BarChartBrowser';
import PieChartBrowser from './browser/PieChartBrowser';
import TaxonomyBrowser from './browser/TaxonomyBrowser';
import TreeMapBrowser from './browser/TreeMapBrowser';
import TagCloudBrowser from './browser/TagCloudBrowser';

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
            case 'PieChartBrowser':
                browser = <PieChartBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
                break;
            case 'TreeMapBrowser':
                browser = <TreeMapBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
                break;
            case 'TagCloudBrowser':
                browser = <TagCloudBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
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
        }else{
            //in case no total value is defined, charts make no sense: e.g. when regenerating UI
            if(self.props.spec.instances.length && !self.props.spec.instances[0].total){
                browser = <CheckListBrowser selection={self.props.selection} expanded={self.props.expanded} datasetURI={self.props.datasetURI} propertyURI={self.props.spec.propertyURI} shortenURI={self.props.shortenURI}  config={self.props.config} instances={self.props.spec.instances} onCheck={self.handleSelect.bind(self)}/>;
            }
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
