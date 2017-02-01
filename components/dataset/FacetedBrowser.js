import React from 'react';
import Facet from './Facet';
import {NavLink} from 'fluxible-router';
import FacetedBrowserStore from '../../stores/FacetedBrowserStore';
import {connectToStores} from 'fluxible-addons-react';
import createASampleFacetsConfig from '../../actions/createASampleFacetsConfig';
import loadFacets from '../../actions/loadFacets';
import ResourceList from './ResourceList';
import ResourceListPager from './ResourceListPager';

class FacetedBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchMode: 0, selection: {}, expandedFacet: 0, expandedResources: 0, hideFirstCol: false};
    }
    handleSearchMode(searchMode) {
        this.setState({searchMode: searchMode});
    }
    toggleFirstCol(){
        this.setState({hideFirstCol: !this.state.hideFirstCol})
    }
    toggleResourceCol(){
        this.setState({hideFirstCol: !this.state.hideFirstCol, expandedResources: !this.state.expandedResources})
    }
    toggleExpandFacet(propertyURI){
        this.toggleFirstCol();
        if(this.state.expandedFacet){
            this.setState({expandedFacet: 0})
        }else{
            this.setState({expandedFacet: propertyURI})
        }

    }
    gotoPage(page) {
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: page, selection: { prevSelection: this.state.selection}});
    }
    createFConfig(datasetURI) {
        this.context.executeAction(createASampleFacetsConfig, {dataset: datasetURI, redirect: 1});
    }
    addCommas(n){
        let rx = /(\d+)(\d{3})/;
        return String(n).replace(/^\d+/, function(w){
            while(rx.test(w)){
                w = w.replace(rx, '$1,$2');
            }
            return w;
        });
    }
    compareProps(a,b) {
        if (parseFloat(a.position) < parseFloat(b.position))
            return -1;
        if (parseFloat(a.position) > parseFloat(b.position))
            return 1;
        //sort by alphabet
        if(a.label < b.label){
            return -1;
        }
        if(a.label > b.label){
            return 1;
        }
        return 0;
    }
    getPropertyConfig(datasetURI, propertyURI){
        let cnf = this.props.FacetedBrowserStore.config;
        return cnf.config[propertyURI];
    }
    buildMasterFacet(datasetURI) {
        let self = this;
        let properties = [];
        let cnf = this.props.FacetedBrowserStore.config;
        let propConfig;
        if(cnf.list){
            cnf.list.forEach(function(el) {
                propConfig = self.getPropertyConfig(datasetURI, el);
                if(propConfig){
                    if(!propConfig.isHidden){
                        properties.push({label: (propConfig ? (propConfig.label ? propConfig.label : self.getPropertyLabel(el)) : self.getPropertyLabel(el)), value: el, valueType: 'uri', position: (propConfig && propConfig.position) ? propConfig.position : 0, category: (propConfig && propConfig.category) ? propConfig.category : ''});
                    }
                }else{
                    properties.push({label: (propConfig ? (propConfig.label ? propConfig.label : self.getPropertyLabel(el)) : self.getPropertyLabel(el)), value: el, valueType: 'uri', position: (propConfig && propConfig.position) ? propConfig.position : 0, category: (propConfig && propConfig.category) ? propConfig.category : ''});
                }
            });
            //apply ordering if in config
            properties.sort(self.compareProps);
        }
        return properties;
    }
    findIndexInSelection(arr, value){
        let i = -1;
        arr.forEach(function(el, index){
            if(el.value === value){
                i = index;
            }
        });
        return i;
    }
    handleOnCheck(level, valueType, dataType, status, value, propertyURI) {
        // console.log(level, valueType, dataType, status, value, propertyURI);
        let self = this;
        let hadAnySelected = 0;
        //handling cascading facet update
        let sideEffectsArr = [];
        let atLeastOne = 0;
        if(level === 2){
            //keep history of selection up to date
            if(status){
                if(!this.state.selection[propertyURI]){
                    this.state.selection[propertyURI] = [];
                }
                this.state.selection[propertyURI].push({value: value, valueType: valueType, dataType: dataType});
            }else{
                this.state.selection[propertyURI].splice(this.findIndexInSelection(this.state.selection[propertyURI], value), 1);
            }
            //check if there are active facets to be updated as side effect
            sideEffectsArr = [];
            atLeastOne = 0;
            for (let key in this.state.selection) {
                //apply on active but non-selected
                if(key !== propertyURI && !this.state.selection[key].length){
                    sideEffectsArr.push(key);
                }else{
                    atLeastOne = 1;
                }
            }
            this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection}});
        }else{
            //for master level
            if(this.state.selection[value] && this.state.selection[value].length){
                hadAnySelected = 1;
            }else{
                hadAnySelected = 0;
            }
            if(!status){
                //empty the selection
                delete this.state.selection[value];
            }else{
                //initiate facet
                this.state.selection[value] = [];
            }
            sideEffectsArr = [];
            atLeastOne = 0;
            for (let key in this.state.selection) {
                //apply on active but non-selected
                if(!this.state.selection[key].length){
                    sideEffectsArr.push(key);
                }else{
                    atLeastOne = 1;
                }
            }
            // there should be at least one second level facet selected for cascading effect
            if(!atLeastOne){
                sideEffectsArr = [];
            }
            //should not run if there is a side effect -> prevents duplicate runs
            if(sideEffectsArr.indexOf(value) === -1){
                this.context.executeAction(loadFacets, {mode: 'master', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection}});
            }
            //on uncheck update list of resources
            if(!status && hadAnySelected){
                this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: value, value: value, status: status, prevSelection: this.state.selection}});
                //add new type of side effect on uncheck
                for (let key in this.state.selection) {
                    sideEffectsArr.push(key);
                }
            }
        }
        // console.log(sideEffectsArr);
        //apply side effects
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, selection: {status: status, propertyURI: el, prevSelection: self.state.selection}});
        });
    }
    //used to fix the key of component in dynamic cases
    findIndexInProperties(properties, value) {
        let i = 0;
        properties.forEach(function(el, index){
            if(el.value === value){
                i = index;
            }
        });
        return i;
    }
    extractNameFromPropertyURI(uri) {
        let property = uri;
        let tmp2 = uri.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = uri.split('/');
            property = tmp2[tmp2.length - 1];
        }
        //make first letter capital case
        property = property.charAt(0).toUpperCase() + property.slice(1);
        return property;
    }
    getPropertyLabel(uri) {
        let property = '';
        let tmp = uri;
        let self = this;
        //handle the prop path case
        if(uri.indexOf('->') !==-1){
            let tmp12 = uri.split('->');
            let tmp2 = [];
            tmp12.forEach((el)=> {
                tmp2.push(self.extractNameFromPropertyURI(el.trim()));
            });
            property = tmp2.join('/');
        }else{
            property = self.extractNameFromPropertyURI(uri);
        }
        return property;
    }
    render() {
        let self = this;
        let showFactes = 0;
        let configDiv = '';
        let properties = this. buildMasterFacet(this.props.FacetedBrowserStore.datasetURI);
        //console.log(self.props.FacetedBrowserStore.facets);
        //if no default graph is selected, show all the graph names
        if(this.props.FacetedBrowserStore.datasetURI){
            let list = properties.map(function(node, index) {
                //console.log(self.props.FacetedBrowserStore.facets);
                if(self.props.FacetedBrowserStore.facets[node.value] && self.props.FacetedBrowserStore.facets[node.value].length){
                    showFactes = 1;
                    //console.log(self.findIndexInProperties(properties, node.value));
                    if(self.state.expandedFacet){
                        if(self.state.expandedFacet===node.value){
                            return (
                                <Facet selection={self.state.selection} minHeight={550} maxHeight={700} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)}/>
                            );
                        }
                    }else{
                        return (
                            <Facet selection={self.state.selection} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)}/>
                        );
                    }
                }else{
                    return undefined;
                }
            });
            let pagerSize = showFactes ? 4 : 10;
            let resSize = showFactes ? 'seven' : 'eleven';
            resSize = this.state.expandedResources ? 16 : resSize;
            let facetsDIV;
            if(this.state.hideFirstCol){
                facetsDIV = showFactes ? <div className="ui stackable nine wide column">{list}</div> : '';
            }else{
                facetsDIV = showFactes ? <div className="ui stackable five wide column">{list}</div> : '';
            }
            if(this.state.expandedResources){
                facetsDIV = '';
            }
            let resourceDIV;
            let dcnf = this.props.FacetedBrowserStore.datasetConfig;
            let cnf = this.props.FacetedBrowserStore.config;
            let datasetTitle = <a target="_blank" href={this.props.FacetedBrowserStore.datasetURI}> {this.props.FacetedBrowserStore.datasetURI} </a>;
            if(dcnf.datasetLabel){
                datasetTitle = <a target="_blank" href={this.props.FacetedBrowserStore.datasetURI}> {dcnf.datasetLabel} </a>;
            }
            if(dcnf.allowInlineConfig){
                configDiv = <a onClick={this.createFConfig.bind(this, this.props.FacetedBrowserStore.datasetURI)} className="ui icon mini black circular button"><i className="ui settings icon"></i> </a>;
            }
            if(this.props.FacetedBrowserStore.total){
                resourceDIV = <div className="ui">
                                <h3 className="ui header">
                                    {this.props.FacetedBrowserStore.total ? <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.FacetedBrowserStore.datasetURI)}><span className="ui blue circular label">{this.state.searchMode ? this.addCommas(this.props.FacetedBrowserStore.resources.length) + '/' :''}{this.addCommas(this.props.FacetedBrowserStore.total)}</span></a> : ''} Resources from {datasetTitle}
                                 </h3>
                                <div className="ui segment top attached">
                                    <ResourceList resources={this.props.FacetedBrowserStore.resources} datasetURI={this.props.FacetedBrowserStore.datasetURI} OpenInNewTab={true} isBig={!showFactes} config={dcnf}/>
                                </div>
                                 <div className= "ui secondary segment bottom attached">
                                     <ResourceListPager onSearchMode={this.handleSearchMode.bind(this)} visibleResourcesTotal={this.props.FacetedBrowserStore.resources.length} selection={{prevSelection: this.state.selection}} onExpandCollapse={this.toggleResourceCol.bind(this)} handleClick={this.gotoPage.bind(this)} datasetURI={this.props.FacetedBrowserStore.datasetURI} total={this.props.FacetedBrowserStore.total} threshold={pagerSize} currentPage={this.props.FacetedBrowserStore.page} maxNumberOfResourcesOnPage={dcnf.maxNumberOfResourcesOnPage}/>
                                </div>
                              </div>;
            }
            return (
                <div className="ui page grid" ref="facetedBrowser">
                    {this.state.hideFirstCol ? '' :
                        <div className="ui stackable four wide column">
                            <Facet color="teal" selection={this.state.selection} onCheck={this.handleOnCheck.bind(this, 1, 'uri', '')} key="master" maxHeight={700} minHeight={300} spec={{property: '', propertyURI: '', instances: properties}} config={{label: 'Selected Properties'}} datasetURI={this.props.FacetedBrowserStore.datasetURI} />
                            {configDiv}
                        </div>
                    }
                        {facetsDIV}
                        <div className={'ui stackable ' + resSize + ' wide column'}>
                            {resourceDIV}
                        </div>
                </div>
            );
        }else{
            return (
                <div className="ui page grid" ref="facetedBrowser">
                    <div className="ui column">
                        <div className="ui segment">
                            <h2>List of available datasets to browse</h2>
                            <div className="ui big divided animated list">
                                No Dataset is selected to browse!
                            </div>
                        </div>
                    </div>
                </div>
            );
        }


    }
}
FacetedBrowser.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
FacetedBrowser = connectToStores(FacetedBrowser, [FacetedBrowserStore], function (context, props) {
    return {
        FacetedBrowserStore: context.getStore(FacetedBrowserStore).getState()
    };
});
export default FacetedBrowser;
