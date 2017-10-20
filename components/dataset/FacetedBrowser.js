import React from 'react';
import PropTypes from 'prop-types';
import Facet from './Facet';
import {NavLink} from 'fluxible-router';
import FacetedBrowserStore from '../../stores/FacetedBrowserStore';
import {connectToStores} from 'fluxible-addons-react';
import createASampleFacetsConfig from '../../actions/createASampleFacetsConfig';
import loadFacets from '../../actions/loadFacets';
import ResourceList from './ResourceList';
import ResourceListPager from './ResourceListPager';
import YASQEViewer from '../object/viewer/individual/YASQEViewer';
import URIUtil from '../utils/URIUtil';
import {Popup} from 'semantic-ui-react';

class FacetedBrowser extends React.Component {
    componentDidMount() {
        //check if it is loaded from an API
        //then: set the state and generate the UI
        if(this.props.FacetedBrowserStore.loadedFromAPI){
            //clone states
            this.setState({selection: JSON.parse(JSON.stringify(this.props.FacetedBrowserStore.facets))});
            this.context.executeAction(loadFacets, {mode: 'master', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {prevSelection: this.props.FacetedBrowserStore.facets, options: {invert: this.state.invert, range: this.state.range, facetConfigs: {}}}});
            this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, selection: { prevSelection: this.props.FacetedBrowserStore.facets, options: {invert: this.state.invert, range: this.state.range, facetConfigs: {}}}});
        }

    }
    constructor(props) {
        super(props);
        this.dynamicSelection = {};
        this.state = {searchMode: 0, selection: {}, expandedFacet: 0, expandedResources: 0, hideFirstCol: false, invert: {}, range:{}};
    }
    handleSearchMode(searchMode) {
        this.setState({searchMode: searchMode});
    }
    componentDidMount() {
        //check if it is loaded from an API
        //then: set the state and generate the UI
        if(this.props.FacetedBrowserStore.loadedFromAPI){
            //clone states
            this.setState({selection: JSON.parse(JSON.stringify(this.props.FacetedBrowserStore.facets))});
            this.context.executeAction(loadFacets, {mode: 'master', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {prevSelection: this.props.FacetedBrowserStore.facets, options: {invert: this.state.invert, range: this.state.range, facetConfigs: {}}}});
            this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, selection: { prevSelection: this.props.FacetedBrowserStore.facets, options: {invert: this.state.invert, range: this.state.range, facetConfigs: {}}}});
        }

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
        let facetConfigs = this.getNecessaryFaccetsConfig();
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: page, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
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
    //here we can determine the configs which should be considered in the query
    getNecessaryFaccetsConfig(){
        let facetConfigs = {};
        let cnf = JSON.parse(JSON.stringify(this.props.FacetedBrowserStore.config));
        if(!cnf.config || !Object.keys(cnf.config).length){
            return facetConfigs;
        }else{
            cnf = cnf.config;
        }
        for(let prop in cnf){
            if(cnf[prop].dataType && cnf[prop].dataType.length){
                facetConfigs[prop] = {dataType: cnf[prop].dataType[0]};
            }
        }
        return facetConfigs;
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
    handleShowMoreFacet(propertyURI, fpage){
        this.context.executeAction(loadFacets, {mode: 'masterMore', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: propertyURI, value: propertyURI, status: 1, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range}}, fpage: fpage});
    }
    handleToggleInvert(propertyURI){
        //todo: only if an item is selected inversion works
        let self = this;
        let facetConfigs = self.getNecessaryFaccetsConfig();
        if(!this.state.invert[propertyURI]){
            this.state.invert[propertyURI] = 1;
        }else{
            delete this.state.invert[propertyURI];
        }
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
        //apply side effects
        let sideEffectsArr = [];
        //allow refreshing the facet itself
        sideEffectsArr.push(propertyURI);
        for (let key in this.state.selection) {
            //apply on active but non-selected
            if(!this.state.selection[key].length){
                sideEffectsArr.push(key);
            }
        }
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, selection: {status: 0, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
        });
    }
    handleToggleRange(propertyURI, rangeObj){
        let self = this;
        //we can inject some config to the queries e.g. to force a certain data types
        let facetConfigs = self.getNecessaryFaccetsConfig();
        if(!this.state.range[propertyURI]){
            this.state.range[propertyURI] = rangeObj;
            //sends a fake value to service which is ignored only to refresh the query
            this.state.selection[propertyURI] = [{value: 'ldr:range', valueType: 'literal', dataType: ''}];
        }else{
            delete this.state.range[propertyURI];
            this.state.selection[propertyURI] = [];
        }
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
        //apply side effects
        let sideEffectsArr = [];
        //allow refreshing the facet itself
        sideEffectsArr.push(propertyURI);
        for (let key in this.state.selection) {
            //apply on active but non-selected
            if(!this.state.selection[key].length){
                sideEffectsArr.push(key);
            }
        }
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, selection: {status: 0, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
        });
    }
    handleOnCheck(level, valueType, dataType, status, value, propertyURI) {
        // console.log(level, valueType, dataType, status, value, propertyURI);
        let self = this;
        //--add facet configs to queries
        let facetConfigs = self.getNecessaryFaccetsConfig();
        //------------------
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
                //only if there are more than one facets available
                if(!this.state.selection[key].length && Object.keys(this.state.selection).length > 1){
                    sideEffectsArr.push(key);
                }else{
                    atLeastOne = 1;
                }
            }
            this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
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
                //empty invert
                delete this.state.invert[value];
                //empty range
                delete this.state.range[value];
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
                this.context.executeAction(loadFacets, {mode: 'master', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
            }
            //on uncheck update list of resources
            if(!status && hadAnySelected){
                this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, selection: {propertyURI: value, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
                //add new type of side effect on uncheck
                for (let key in this.state.selection) {
                    sideEffectsArr.push(key);
                }
            }
        }
        // console.log(sideEffectsArr);
        //apply side effects
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, selection: {status: status, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
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
        //check erros first
        if(this.props.FacetedBrowserStore.error){
            return (
                <div className="ui fluid container ldr-padding" ref="facetedBrowser">
                    <div className="ui grid">
                        <div className="ui column">
                            <div className="ui warning message"><h2>{this.props.FacetedBrowserStore.error}</h2></div>
                        </div>
                    </div>
                </div>
            )
        }
        //continue
        let self = this;
        let showFactes = 0;
        let configDiv = '';
        let properties = this.buildMasterFacet(this.props.FacetedBrowserStore.datasetURI);
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
                                <Facet selection={self.state.selection} invert={self.state.invert} range={self.state.range} minHeight={550} maxHeight={700} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} onInvert={self.handleToggleInvert.bind(self, node.value)} onRange={self.handleToggleRange.bind(self, node.value)} onShowMore={self.handleShowMoreFacet.bind(self, node.value)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value], total: self.props.FacetedBrowserStore.facetsCount[node.value], query: self.props.FacetedBrowserStore.facetQuery[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)}/>
                            );
                        }
                    }else{
                        return (
                            <Facet selection={self.state.selection} invert={self.state.invert} range={self.state.range} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} onInvert={self.handleToggleInvert.bind(self, node.value)} onRange={self.handleToggleRange.bind(self, node.value)} onShowMore={self.handleShowMoreFacet.bind(self, node.value)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value], total: self.props.FacetedBrowserStore.facetsCount[node.value], query: self.props.FacetedBrowserStore.facetQuery[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)}/>
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
            let facetConfigs = this.getNecessaryFaccetsConfig();
            let datasetTitle = <a target="_blank" href={this.props.FacetedBrowserStore.datasetURI}> {this.props.FacetedBrowserStore.datasetURI} </a>;
            if(dcnf.datasetLabel){
                datasetTitle = <a target="_blank" href={this.props.FacetedBrowserStore.datasetURI}> {dcnf.datasetLabel} </a>;
            }
            if(dcnf.allowInlineConfig){
                configDiv = <a onClick={this.createFConfig.bind(this, this.props.FacetedBrowserStore.datasetURI)} className="ui icon mini black circular button"><i className="ui settings icon"></i> </a>;
            }
            let typeSt, typesLink = [];
            if(dcnf.resourceFocusType){
                if(!dcnf.resourceFocusType.length || (dcnf.resourceFocusType.length && !dcnf.resourceFocusType[0]) ){
                    typeSt = '';
                }else{
                    dcnf.resourceFocusType.forEach(function(uri) {
                        typesLink.push(<a key={uri} className="ui black label" target="_blank" href={uri}> {URIUtil.getURILabel(uri)} </a>);
                    });
                    typeSt = typesLink;
                }
            }
            let constraintSt, constraints = [];
            if(dcnf.constraint){
                for (let prop in dcnf.constraint){
                    constraints.push(self.getPropertyLabel(prop) + ': ' + dcnf.constraint[prop].join(','));
                }
                constraintSt = constraints.join(' && ');
            }
            if(this.props.FacetedBrowserStore.total){
                resourceDIV = <div className="ui">
                    <h3 className="ui header">
                        {this.props.FacetedBrowserStore.total ? <a target="_blank" href={'/export/NTriples/' + encodeURIComponent(this.props.FacetedBrowserStore.datasetURI)}><span className="ui blue circular label">{this.state.searchMode ? this.addCommas(this.props.FacetedBrowserStore.resources.length) + '/' :''}{this.addCommas(this.props.FacetedBrowserStore.total)}</span></a> : ''} Resources {typeSt ? <span>of type{typeSt}</span>: ''} from {datasetTitle} {dcnf.constraint ? <span><Popup trigger={<i className="ui orange filter icon link "> </i>} content={constraintSt} wide position='bottom center' /></span>: ''}
                    </h3>
                    <div className="ui segments">
                        <div className="ui segment">
                            <ResourceList resources={this.props.FacetedBrowserStore.resources} datasetURI={this.props.FacetedBrowserStore.datasetURI} OpenInNewTab={true} isBig={!showFactes} config={dcnf}/>
                        </div>
                        <div className= "ui secondary segment ">
                            <ResourceListPager onSearchMode={this.handleSearchMode.bind(this)} visibleResourcesTotal={this.props.FacetedBrowserStore.resources.length} selection={{prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}} onExpandCollapse={this.toggleResourceCol.bind(this)} handleClick={this.gotoPage.bind(this)} datasetURI={this.props.FacetedBrowserStore.datasetURI} total={this.props.FacetedBrowserStore.total} threshold={pagerSize} currentPage={this.props.FacetedBrowserStore.page} maxNumberOfResourcesOnPage={dcnf.maxNumberOfResourcesOnPage}/>
                        </div>
                        {this.props.FacetedBrowserStore.loadedFromAPI || dcnf.displayQueries ?
                            <div className= "ui tertiary segment">
                                <YASQEViewer spec={{value: this.props.FacetedBrowserStore.resourceQuery}} />
                            </div>
                            : ''}
                    </div>
                </div>;
            }
            return (
                <div className="ui fluid container ldr-padding" ref="facetedBrowser">
                    <div className="ui vertically padded stackable grid">
                        {this.state.hideFirstCol ? '' :
                            <div className="ui stackable four wide column">
                                <Facet color="teal" selection={this.state.selection} invert={self.state.invert} range={self.state.range} onCheck={this.handleOnCheck.bind(this, 1, 'uri', '')} key="master" maxHeight={700} minHeight={300} spec={{property: '', propertyURI: '', instances: properties}} config={{label: 'Selected Properties'}} datasetURI={this.props.FacetedBrowserStore.datasetURI} />
                                {configDiv}
                            </div>
                        }
                        {facetsDIV}
                        <div className={'ui stackable ' + resSize + ' wide column'}>
                            {resourceDIV}
                        </div>
                    </div>
                </div>
            );
        }else{
            return (
                <div className="ui fluid container ldr-padding" ref="facetedBrowser">
                    <div className="ui vertically padded stackable grid">
                        <div className="ui column">
                            <div className="ui segment">
                                <h2>List of available datasets to browse</h2>
                                <div className="ui big divided animated list">
                                    No Dataset is selected to browse!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }


    }
}
FacetedBrowser.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
FacetedBrowser = connectToStores(FacetedBrowser, [FacetedBrowserStore], function (context, props) {
    return {
        FacetedBrowserStore: context.getStore(FacetedBrowserStore).getState()
    };
});
export default FacetedBrowser;
