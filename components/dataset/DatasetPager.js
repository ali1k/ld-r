import React from 'react';
import PropTypes from 'prop-types';
//import ReactDOM from 'react-dom';
import {NavLink} from 'fluxible-router';
import searchInDataset from '../../actions/searchInDataset';
import saveFacetsEnvState from '../../actions/saveFacetsEnvState';
import {Dropdown, Icon} from 'semantic-ui-react';

class DatasetPager extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchTerm: '', searchMode: 0, config: this.props.config ? JSON.parse(JSON.stringify(this.props.config)) : '', saveMode: 0, saveText: '', querySaved: 0};
    }
    componentDidMount() {
    }
    buildLink(page, color, icon) {
        if(this.props.handleClick){
            return (
                <a onClick={this.props.handleClick.bind(this, page)} key={(icon ? ('i' + page) : page)} className={'ui ' + color + ' label'}> {icon ? <i className={icon}></i> : <span>{page}</span>} </a>
            );
        }else{
            return (
                <NavLink key={(icon ? ('i' + page) : page)} routeName="dataset" className={'ui ' + color + ' label'} href={'/dataset/' + page + '/' + encodeURIComponent(this.props.datasetURI)}> {icon ? <i className={icon}></i> : <span>{page}</span>} </NavLink>
            );
        }
    }
    handleViewsDropDownClick(e, data){
        let tmp = this.state.config;
        if(!this.state.config){
            tmp ={};
        }
        if(data.value === 'Default'){
            tmp = this.props.config ? JSON.parse(JSON.stringify(this.props.config)): '';
        }else{
            tmp.datasetViewer = [data.value];
        }
        this.setState({config: tmp});
        this.props.handleViewerChange(data.value);
    }
    handleActionDropDownClick(e, data){
        if(data.value === 'downloadResults'){
            this.props.handleExport();
        }else if(data.value === 'saveQuery'){
            //allow both search and save
            this.setState({saveMode: !this.state.saveMode, querySaved: 0});
        }else if(data.value === 'searchInResults'){
            this.onSearchClick();
        }

    }
    onShowAllClick(){
        if(this.props.showAllResources){
            this.searchOnDataset('');
        }else{
            this.searchOnDataset('ldr_showAll');
        }
        this.props.onShowAllResources();

    }
    onSearchClick(){
        //reset the search
        if(this.state.searchMode && this.state.searchTerm){
            this.searchOnDataset('');
            this.setState({searchTerm: ''});
        }
        this.props.onSearchMode(!this.state.searchMode);
        this.setState({searchMode: !this.state.searchMode, saveMode: 0, querySaved: 0});
    }
    handleSearchChange(evt) {
        this.setState({searchTerm: evt.target.value});
        if(!evt.target.value){
            //in case of empty, restore results
            this.searchOnDataset('');
        }
    }
    handleSaveTextChange(evt) {
        this.setState({saveText: evt.target.value});
    }
    searchOnDataset(term) {
        this.context.executeAction(searchInDataset, {
            id: this.props.datasetURI,
            selection: this.props.selection,
            pivotConstraint: this.props.pivotConstraint,
            searchTerm: term
        });
    }
    saveEnvState(desc) {
        if(desc.trim()){
            let selection = JSON.parse(JSON.stringify(this.props.selection));
            //to store the component used to view the results and empty the default facets config
            if(this.props.config && this.props.config.datasetViewer){
                selection.options.datasetConfig = {datasetViewer: this.props.config.datasetViewer};
                selection.options.facetConfigs = {};
            }
            this.context.executeAction(saveFacetsEnvState, {
                datasetURI: this.props.datasetURI,
                selection: selection,
                pivotConstraint: this.props.pivotConstraint,
                searchTerm: this.state.searchMode ? this.state.searchTerm : this.props.showAllResources ? 'ldr_showAll' : '',
                resourceQuery: this.props.resourceQuery,
                page: this.props.currentPage,
                description: desc
            });
            this.setState({saveText: '', saveMode: 0, querySaved: 1});
        }
    }
    handleSearchKeyDown(evt) {
        switch (evt.keyCode) {
            //case 9: // Tab
            case 13: // Enter
                this.searchOnDataset(this.state.searchTerm);
                break;
        }
    }
    handleSaveKeyDown(evt) {
        switch (evt.keyCode) {
            //case 9: // Tab
            case 13: // Enter
            //replace double quotes
                this.saveEnvState(this.state.saveText.replace(/"/g, '\''));
                break;
        }
    }
    render() {
        let self = this;
        let v_icons = {};
        let defaultViewIcon = 'list layout';
        let v_options = [];
        //menu is customized if there are props for analysis
        if(this.props.noOfAnalysisProps && this.props.noOfAnalysisProps > 1){
            v_options = [
                { key: 1, icon: 'table', text:  'Table', value: 'BasicResourceList' },
                { key: 2, icon: 'grid layout', text:  'Tree Map', value: 'TreeMapView' },
                { key: 3, icon: 'line chart', text:  'Scatter Chart', value: 'ScatterChartView' },
                { key: 4, icon: 'bar chart', text:  'Bar Chart', value: 'BarChartView' },
                { key: 5, icon: 'bullseye', text:  'Radar Chart', value: 'RadarChartView' },
                { key: 6, icon: 'share alternate', text:  'Network Diagram', value: 'NetworkView' },
                { key: 6, icon: 'calendar minus', text:  'Timeline', value: 'TimelineView' }
            ]
            v_icons = {
                'BasicResourceList': 'table',
                'TreeMapView': 'grid layout',
                'ScatterChartView': 'line chart',
                'BarChartView': 'bar chart',
                'RadarChartView': 'bullseye',
                'NetworkView': 'share alternate',
                'TimelineView': 'calendar minus'
            };
            defaultViewIcon = 'table';
        }else{
            if(this.props.noOfAnalysisProps && this.props.noOfAnalysisProps === 1){
                v_options = [
                    { key: 1, icon: 'table', text:  'Table', value: 'BasicResourceList' },
                    { key: 2, icon: 'share alternate', text:  'Network Diagram', value: 'NetworkView' }
                ];
                v_icons = {
                    'BasicResourceList': 'table',
                    'NetworkView': 'share alternate'
                };
            }else{
                v_options = [
                    { key: 1, icon: 'list layout', text:  'List', value: 'BasicResourceList' }
                ];
                v_icons = {
                    'BasicResourceList': 'list layout'
                };
            }
        }
        //action menu
        let a_options = [
            { key: 1, icon: 'search', text:  'Search in Results', value: 'searchInResults' },
            { key: 2, icon: 'download', text:  'Download Results', value: 'downloadResults' }
        ];
        if(this.props.enableQuerySaveImport){
            a_options.push({ key: 3, icon: 'save', text:  'Save Query', value: 'saveQuery' });
        }
        let iconC =  (this.state.config && this.state.config.datasetViewer) ? (v_icons[this.state.config.datasetViewer] ? v_icons[this.state.config.datasetViewer] : defaultViewIcon) : defaultViewIcon;
        const v_trigger = (
            <span>
                <Icon name={iconC} className="olive" />
            </span>
        );
        const a_trigger = (
            <span>
                <Icon name='lab' className="orange"/>
            </span>
        );
        let maxOnPage = this.state.config.maxNumberOfResourcesOnPage;
        if(!maxOnPage){
            maxOnPage = 20;
        }
        let datasetURI = this.props.datasetURI;
        let i, startI, totalPages, threshold = this.props.threshold, currentPage, pageList = [];
        if(this.props.total || (this.props.hasResources && !this.props.total)){
            currentPage = parseInt(this.props.currentPage);
            //total number of pages
            totalPages = Math.ceil(this.props.total / maxOnPage);
            //the situation when total number of pages is unknown
            if(this.props.hasResources && !this.props.total){
                totalPages = 100000000000;
            }
            if(this.state.searchMode){
                //totalPages = Math.ceil(this.props.resourcesLength / maxOnPage);
                //todo: support paging for search, I disable it for now!
                totalPages = 1;
            }
            if(totalPages > threshold){
                //first page
                pageList.push(self.buildLink(1, 'grey', 'step backward icon'));
                if(currentPage - Math.round(threshold / 2) <= 0){
                    startI = 1;
                }else{
                    startI = currentPage - Math.round(threshold / 2);
                }
                for (i = startI; (i <= (currentPage + threshold) && i <= totalPages); i++) {
                    if(i === currentPage){
                        pageList.push(self.buildLink(i, 'blue', 0));
                    }else{
                        pageList.push(self.buildLink(i, 'basic', 0));
                    }
                }
                //last page
                pageList.push(self.buildLink(totalPages, 'grey', 'step forward icon'));
            }else{
                for (i = 1; i <= totalPages; i++) {
                    if(i === currentPage){
                        pageList.push(self.buildLink(i, 'blue', 0));
                    }else{
                        pageList.push(self.buildLink(i, 'basic', 0));
                    }
                }
            }
            if(this.props.hasResources && !this.props.total){
                totalPages = ' ? ';
            }
        }
        return (
            <div>
                <div className="ui bottom attached compact secondary stackable menu" ref="datasetPager">
                    <div className="left menu stackable">
                        <div className='item'>
                            {this.props.showAllResources ?
                                ''
                                :
                                <span><span onDoubleClick={this.props.handleToggleShowQuery}>{totalPages}</span> Page(s): {pageList} &nbsp;</span>
                            }
                            {totalPages > 1 && this.props.total<= 10000 ?
                                <a className={'ui icon mini button ' + (this.props.showAllResources ? 'blue': 'basic')} onClick={this.onShowAllClick.bind(this)}>
                                    {this.props.showAllResources ? 'go back to pagination' : 'show all'}
                                </a>
                                :
                                ''
                            }
                        </div>
                    </div>
                    <div className="right menu stackable">
                        {this.props.total || (this.props.hasResources && !this.props.total) ?
                            <Dropdown className="item" title="actions" selectOnBlur={false} onChange={this.handleActionDropDownClick.bind(this)} trigger={a_trigger} options={a_options} icon={null} pointing="top right" floating />
                            : ''}
                        <Dropdown className="item" title="views" selectOnBlur={false} onChange={this.handleViewsDropDownClick.bind(this)} trigger={v_trigger} options={v_options} icon={null} pointing="top right" floating />
                        {this.props.onExpandCollapse ?
                            <a className='ui icon mini basic button right floated item ' onClick={this.props.onExpandCollapse.bind(this)} title="expand/collapse">
                                <i className='ui icon expand'></i>
                            </a>
                            : ''}
                    </div>
                </div>
                {!this.state.querySaved ? '' :
                    <div className="ui info message">
                      Your query was saved. <a className="ui primary mini button" href="/wysiwyq" target="_blank"> See stored queries</a>
                    </div>
                }
                {!this.state.saveMode ? '' :
                    <div className="ui secondary segment bottom attached animated slideInDown">
                        <div className="ui icon input fluid">
                            <input ref="saveInput" type="text" placeholder="Write a description for your query and press enter to save..." value={this.state.saveText} onChange={this.handleSaveTextChange.bind(this)} onKeyDown={this.handleSaveKeyDown.bind(this)}/>
                            <i className="save icon"></i>
                        </div>
                    </div>
                }
                {!this.state.searchMode ? '' :
                    <div className="ui secondary segment bottom attached animated slideInDown">
                        <div className="ui icon input fluid">
                            <input ref="searchInput" type="text" placeholder="Type your search keywords and press enter to search..." value={this.state.searchTerm} onChange={this.handleSearchChange.bind(this)} onKeyDown={this.handleSearchKeyDown.bind(this)}/>
                            <i className="search icon"></i>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
DatasetPager.contextTypes = {
    executeAction: PropTypes.func.isRequired
};
export default DatasetPager;
