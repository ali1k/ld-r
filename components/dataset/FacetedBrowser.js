import React from 'react';
import PropTypes from 'prop-types';
import Facet from './Facet';
import {NavLink} from 'fluxible-router';
import FacetedBrowserStore from '../../stores/FacetedBrowserStore';
import {connectToStores} from 'fluxible-addons-react';
import createASampleFacetsConfig from '../../actions/createASampleFacetsConfig';
import loadFacets from '../../actions/loadFacets';
import getEnvState from '../../actions/getEnvState';
import DatasetFB from './DatasetFB';

class FacetedBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selection: {}, expandedFacet: 0, showAllResources: 0, expandedResources: 0, hideFirstCol: false, invert: {}, range:{}, analysisProps: {}, pivotConstraint: '', envState: [], importedEnvState: 0, importedMode: 0};
    }
    componentDidMount() {
        if(this.props.FacetedBrowserStore.importedEnvState){
            this.context.executeAction(getEnvState, { stateURI: this.props.FacetedBrowserStore.importedEnvState});
            this.setState({importedEnvState: this.props.FacetedBrowserStore.importedEnvState, importedMode: 1});
        }
    }
    componentDidUpdate() {
        //check if it is loaded from an address
        //then: set the state and generate the UI
        let vars = this.props.FacetedBrowserStore;
        if(this.state.importedMode){
            if(vars.envState.length){
                this.state.envState.push(vars.envState[0]);
                this.loadAnEnvState(vars.envState[0]);
            }
        }
    }
    handlePivotChange(queryConstraints, config) {
        let datasetURI = config.pivotDataset[0];
        //save the previous state for the back button
        //get the total resources of selections form facets
        //do not get all facet items for performace reasons, only the selected ones
        //todo: add also configs for the selected props
        for(let prop in this.state.selection){
            this.state.selection[prop].forEach((s)=>{
                this.props.FacetedBrowserStore.facets[prop].forEach((facet)=>{
                    if(facet.value === s.value){
                        s.total = facet.total;
                    }
                });
            });
        }
        this.state.envState.push({selection: this.state.selection, pivotConstraint: this.state.pivotConstraint, id: this.props.FacetedBrowserStore.datasetURI,  invert: this.state.invert, range: this.state.range, analysisProps: this.state.analysisProps, page: 1});
        //reset the state
        this.setState({selection: {}, expandedFacet: 0, showAllResources: 0, expandedResources: 0, hideFirstCol: false, invert: {}, range:{}, analysisProps: {}, pivotConstraint: queryConstraints});
        this.context.executeAction(loadFacets, {mode: 'init', id: datasetURI, page: 1, selection: { }, pivotConstraint: queryConstraints});
    }
    loadAnEnvState(env){
        //console.log(env);
        let selection = {};
        //remove facets with no slected values
        for(let prop in env.selection){
            if(env.selection[prop].length){
                selection[prop] = env.selection[prop];
            }
        }
        this.setState({importedMode: 0, selection: selection, expandedFacet: 0, showAllResources: 0, expandedResources: 0, hideFirstCol: false, invert: env.invert, range: env.range, analysisProps: env.analysisProps, pivotConstraint: env.pivotConstraint});
        this.context.executeAction(loadFacets, {mode: 'init', stateURI: env.stateURI, id: env.id, searchTerm: env.searchTerm, page: env.page, pivotConstraint: env.pivotConstraint, selection: { prevSelection: selection, options: {invert: env.invert, range: env.range, analysisProps: env.analysisProps, facetConfigs: {}}}});
        this.context.executeAction(loadFacets, {mode: 'masterFromState', id: env.id, page: env.page, pivotConstraint: env.pivotConstraint, selection: selection});
        //this.context.executeAction(loadFacets, {mode: 'second', id: env.id, searchTerm: env.searchTerm, page: env.page, pivotConstraint: env.pivotConstraint, selection: { prevSelection: selection, options: {invert: env.invert, range: env.range, analysisProps: env.analysisProps, facetConfigs: {}}}});
    }
    handleBackToPrevPivotState(){
        //find the env
        let env = this.state.envState[this.state.envState.length-1];
        this.state.envState.splice(-1,1);
        this.loadAnEnvState(env);
    }
    closeEnvDesc(){
        this.setState({envState: []});
    }
    toggleFirstCol(){
        this.setState({hideFirstCol: !this.state.hideFirstCol})
    }
    toggleShowAllResources(){
        this.setState({showAllResources: !this.state.showAllResources})
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
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: page, pivotConstraint: this.state.pivotConstraint, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
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
        if (Number(a.position) < Number(b.position))
            return -1;
        if (Number(a.position) > Number(b.position))
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
            if(cnf[prop].objectIViewer && cnf[prop].objectIViewer.length){
                facetConfigs[prop] = cnf[prop];
            }
            if(cnf[prop].dataType && cnf[prop].dataType.length){
                if(!facetConfigs[prop]){
                    facetConfigs[prop] = {dataType: cnf[prop].dataType[0]};
                }
            }
            if(cnf[prop].restrictAnalysisToSelected){
                if(!facetConfigs[prop]){
                    facetConfigs[prop] = {restrictAnalysisToSelected: cnf[prop].restrictAnalysisToSelected};
                }else{
                    facetConfigs[prop].restrictAnalysisToSelected = cnf[prop].restrictAnalysisToSelected;
                }
            }
            if(cnf[prop].pivotDataset){
                if(!facetConfigs[prop]){
                    facetConfigs[prop] = {pivotDataset: cnf[prop].pivotDataset};
                }else{
                    facetConfigs[prop].pivotDataset = cnf[prop].pivotDataset;
                }
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
                        properties.push({label: (propConfig ? (propConfig.label ? propConfig.label : self.getPropertyLabel(el)) : self.getPropertyLabel(el)), value: el, valueType: 'uri', position: (propConfig && propConfig.position) ? propConfig.position : 0, category: (propConfig && propConfig.category) ? propConfig.category : (propConfig && propConfig.pivotDataset) ? ['Linked Entities'] : ''});
                    }
                }else{
                    properties.push({label: (propConfig ? (propConfig.label ? propConfig.label : self.getPropertyLabel(el)) : self.getPropertyLabel(el)), value: el, valueType: 'uri', position: (propConfig && propConfig.position) ? propConfig.position : 0, category: (propConfig && propConfig.category) ? propConfig.category : (propConfig && propConfig.pivotDataset) ? ['Linked Entities'] : ''});
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
        this.exitFromImportMode();
        this.context.executeAction(loadFacets, {mode: 'masterMore', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, pivotConstraint: this.state.pivotConstraint, selection: {propertyURI: propertyURI, value: propertyURI, status: 1, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range}}, fpage: fpage});
    }
    handleAnalysisProps(propertyURI){
        this.exitFromImportMode();
        //revert showAll on facet interactions
        this.state.showAllResources = 0;
        let self = this;
        let facetConfigs = self.getNecessaryFaccetsConfig();
        if(!this.state.analysisProps[propertyURI]){
            this.state.analysisProps[propertyURI] = 1;
        }else{
            delete this.state.analysisProps[propertyURI];
        }
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, pivotConstraint: this.state.pivotConstraint, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
        /*
        //apply side effects
        let sideEffectsArr = [];
        for (let key in this.state.selection) {
            //apply on active but non-selected
            if(!this.state.selection[key].length){
                sideEffectsArr.push(key);
            }
        }
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, selection: {status: 0, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
        });
        */
    }
    handleToggleInvert(propertyURI){
        this.exitFromImportMode();
        //revert showAll on facet interactions
        this.state.showAllResources = 0;
        //todo: only if an item is selected inversion works
        let self = this;
        let facetConfigs = self.getNecessaryFaccetsConfig();
        if(!this.state.invert[propertyURI]){
            this.state.invert[propertyURI] = 1;
        }else{
            delete this.state.invert[propertyURI];
        }
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, pivotConstraint: this.state.pivotConstraint, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
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
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, pivotConstraint: self.state.pivotConstraint, selection: {status: 0, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
        });
    }
    handleToggleRange(propertyURI, rangeObj){
        this.exitFromImportMode();
        //revert showAll on facet interactions
        this.state.showAllResources = 0;
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
        this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: 1, selection: { prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
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
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, pivotConstraint: self.state.pivotConstraint, selection: {status: 0, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
        });
    }
    exitFromImportMode(){
        //exit form the imported query mode after first user interactions
        if(this.state.importedEnvState){
            this.setState({envState: []});
        }
    }
    handleOnCheck(level, valueType, dataType, status, value, propertyURI) {
        this.exitFromImportMode();
        //revert showAll on facet interactions
        this.state.showAllResources = 0;
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
                if(Array.isArray(value)){
                    value.forEach((item)=>{
                        self.state.selection[propertyURI].push({value: item, valueType: valueType, dataType: dataType});
                    });
                }else{
                    this.state.selection[propertyURI].push({value: value, valueType: valueType, dataType: dataType});
                }
            }else{
                if(Array.isArray(value)){
                    value.forEach((item)=>{
                        this.state.selection[propertyURI].splice(this.findIndexInSelection(this.state.selection[propertyURI], item), 1);
                    });
                }else{
                    this.state.selection[propertyURI].splice(this.findIndexInSelection(this.state.selection[propertyURI], value), 1);
                }
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
            this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, pivotConstraint: this.state.pivotConstraint, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
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
                //empty analysis
                delete this.state.analysisProps[value];
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
                this.context.executeAction(loadFacets, {mode: 'master', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, pivotConstraint: this.state.pivotConstraint, selection: {propertyURI: propertyURI, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs}}});
            }
            //on uncheck update list of resources
            if(!status && hadAnySelected){
                this.context.executeAction(loadFacets, {mode: 'second', id: this.props.FacetedBrowserStore.datasetURI, page: this.props.FacetedBrowserStore.page, pivotConstraint: this.state.pivotConstraint, selection: {propertyURI: value, value: value, status: status, prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}});
                //add new type of side effect on uncheck
                for (let key in this.state.selection) {
                    sideEffectsArr.push(key);
                }
            }
        }
        // console.log(sideEffectsArr);
        //apply side effects
        sideEffectsArr.forEach(function(el){
            self.context.executeAction(loadFacets, {mode: 'sideEffect', id: self.props.FacetedBrowserStore.datasetURI, page: self.props.FacetedBrowserStore.page, pivotConstraint: self.state.pivotConstraint, selection: {status: status, propertyURI: el, prevSelection: self.state.selection, options: {invert: self.state.invert, range: self.state.range, facetConfigs: facetConfigs}}});
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
        //todo: handle multigraph labels
        let tmp001, tmp01 = tmp.split('->[');
        if(tmp01.length > 1){
            tmp001 = tmp.split(']');
            tmp = tmp001[tmp001.length -1];
        }
        let tmp02 = tmp.split('>>');
        if(tmp02.length > 1){
            tmp001 = tmp.split(']');
            tmp = tmp001[tmp001.length -1];
        }
        let tmp03 = tmp.split('->');
        if(tmp03.length > 1){
            tmp = tmp03[tmp03.length -1];
        }
        //---------
        let tmp2 = tmp.split('#');
        if (tmp2.length > 1) {
            property = tmp2[1];
        } else {
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
            tmp2 = property.split(':');
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
                                <Facet selection={self.state.selection} invert={self.state.invert} analysisProps={self.state.analysisProps} range={self.state.range} minHeight={550} maxHeight={700} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} onInvert={self.handleToggleInvert.bind(self, node.value)} onAnalyzeProp={self.handleAnalysisProps.bind(self, node.value)} onRange={self.handleToggleRange.bind(self, node.value)} onShowMore={self.handleShowMoreFacet.bind(self, node.value)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value], total: self.props.FacetedBrowserStore.facetsCount[node.value], query: self.props.FacetedBrowserStore.facetQuery[node.value], queryConstraints: self.props.FacetedBrowserStore.facetQueryConstraints[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)} onPivotChange={self.handlePivotChange.bind(self, self.props.FacetedBrowserStore.facetQueryConstraints[node.value], self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value))}/>
                            );
                        }
                    }else{
                        return (
                            <Facet selection={self.state.selection} invert={self.state.invert} analysisProps={self.state.analysisProps} range={self.state.range} onCheck={self.handleOnCheck.bind(self, 2, self.props.FacetedBrowserStore.facets[node.value][0].valueType, self.props.FacetedBrowserStore.facets[node.value][0].dataType)} onInvert={self.handleToggleInvert.bind(self, node.value)} onAnalyzeProp={self.handleAnalysisProps.bind(self, node.value)} onRange={self.handleToggleRange.bind(self, node.value)} onShowMore={self.handleShowMoreFacet.bind(self, node.value)} key={self.findIndexInProperties(properties, node.value)} spec={{propertyURI: node.value, property: self.getPropertyLabel(node.value), instances: self.props.FacetedBrowserStore.facets[node.value], total: self.props.FacetedBrowserStore.facetsCount[node.value], query: self.props.FacetedBrowserStore.facetQuery[node.value], queryConstraints: self.props.FacetedBrowserStore.facetQueryConstraints[node.value]}} config={self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value)} datasetURI={self.props.FacetedBrowserStore.datasetURI} toggleExpandFacet={self.toggleExpandFacet.bind(self)} onPivotChange={self.handlePivotChange.bind(self, self.props.FacetedBrowserStore.facetQueryConstraints[node.value], self.getPropertyConfig(self.props.FacetedBrowserStore.datasetURI, node.value))}/>
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
            let storeObj = this.props.FacetedBrowserStore;
            let dcnf = storeObj.datasetConfig;
            let cnf = storeObj.config;
            let facetConfigs = this.getNecessaryFaccetsConfig();
            if(dcnf.allowInlineConfig){
                configDiv = <a onClick={this.createFConfig.bind(this, storeObj.datasetURI)} className="ui icon mini black circular button"><i className="ui settings icon"></i> </a>;
            }
            return (
                <div className="ui fluid container ldr-padding" ref="facetedBrowser">
                    {this.state.envState.length && this.state.envState[this.state.envState.length-1].desc ? <div className="ui info message"><i className="close link icon" onClick={this.closeEnvDesc.bind(this)}></i><NavLink className="ui mini blue icon button" href="/wysiwyq"><i className="chevron circle left icon"></i> Back to Queries</NavLink> <b>Query:</b> {this.state.envState[this.state.envState.length-1].desc}</div>: null}
                    <div className="ui vertically padded stackable grid">
                        {this.state.hideFirstCol ? '' :
                            <div className="ui stackable four wide column">
                                <Facet color="teal" selection={this.state.selection} invert={self.state.invert} analysisProps={self.state.analysisProps} range={self.state.range} onCheck={this.handleOnCheck.bind(this, 1, 'uri', '')} key="master" maxHeight={700} minHeight={300} spec={{property: '', propertyURI: '', instances: properties}} config={{label: 'Selected Properties'}} datasetURI={this.props.FacetedBrowserStore.datasetURI} />
                                {configDiv}
                            </div>
                        }
                        {facetsDIV}
                        <div className={'ui stackable ' + resSize + ' wide column'}>
                            <DatasetFB importedEnvState={this.state.importedEnvState} expanded={this.state.expandedResources} showAllResources={this.state.showAllResources} resourceQuery={this.props.FacetedBrowserStore.resourceQuery} config={dcnf} total={this.props.FacetedBrowserStore.total} pagerSize={pagerSize} currentPage={this.props.FacetedBrowserStore.page} resources={this.props.FacetedBrowserStore.resources} datasetURI={this.props.FacetedBrowserStore.datasetURI} searchMode={this.state.searchMode} resourcesLength={this.props.FacetedBrowserStore.resources.length} isBig={!showFactes} prevEnvState={this.state.envState.length ? this.state.envState[this.state.envState.length-1] : ''} pivotConstraint={this.state.pivotConstraint} selection={{prevSelection: this.state.selection, options: {invert: this.state.invert, range: this.state.range, facetConfigs: facetConfigs, analysisProps: this.state.analysisProps}}} onExpandCollapse={this.toggleResourceCol.bind(this)} onShowAllResources={this.toggleShowAllResources.bind(this)} handleClick={this.gotoPage.bind(this)} handleBackToPrevPivotState={this.handleBackToPrevPivotState.bind(this)}/>
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
                                {this.state.envState.length ?
                                    <h2>Wait a moment until the new environemnt is loaded... Refresh the page if you are not redirected in a minute.</h2>
                                    :
                                    <div>
                                        <h2>List of available datasets to browse</h2>
                                        <div className="ui big divided animated list">
                                            No Dataset is selected to browse!
                                        </div>
                                    </div>
                                }
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
