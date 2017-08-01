import React from 'react';
import PropTypes from 'prop-types';
//import ReactDOM from 'react-dom';
import {NavLink} from 'fluxible-router';
import searchInDataset from '../../actions/searchInDataset';
import {Dropdown, Icon} from 'semantic-ui-react';

class DatasetPager extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchTerm: '', searchMode: 0, showAll: 0, config: this.props.config ? JSON.parse(JSON.stringify(this.props.config)) : ''};
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
    handleDropDownClick(e, data){
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
    onShowAllClick(){
        if(this.state.showAll){
            this.searchOnDataset('');
        }else{
            this.searchOnDataset('ldr_showAll');
        }
        this.setState({showAll: !this.state.showAll});
    }
    onSearchClick(){
        this.props.onSearchMode(!this.state.searchMode);
        this.setState({searchMode: !this.state.searchMode});
    }
    handleSearchChange(evt) {
        this.setState({searchTerm: evt.target.value});
        if(!evt.target.value){
            //in case of empty, restore results
            this.searchOnDataset('');
        }
    }
    searchOnDataset(term) {
        this.context.executeAction(searchInDataset, {
            id: this.props.datasetURI,
            selection: this.props.selection,
            searchTerm: term
        });
    }
    handleSearchKeyDown(evt) {
        switch (evt.keyCode) {
            //case 9: // Tab
            case 13: // Enter
                this.searchOnDataset(this.state.searchTerm);
                break;
        }
    }
    render() {
        let self = this;
        let v_icons = {};
        const defaultViewIcon = 'list layout';
        let v_options = [];
        //menu is customized if there are props for analysis
        if(this.props.noOfAnalysisProps && this.props.noOfAnalysisProps > 1){
            v_options = [
                { key: 1, text:  'Table', value: 'BasicResourceList' },
                { key: 2, text:  'Scatter Chart', value: 'ScatterChartView' }
            ]
            v_icons = {
                'BasicResourceList': 'table',
                'ScatterChartView': 'line chart'
            };
        }else{
            v_options = [
                { key: 1, text:  'List', value: 'BasicResourceList' }
            ]
            v_icons = {
                'BasicResourceList': 'list layout'
            };
        }
        let iconC =  (this.state.config && this.state.config.datasetViewer) ? (v_icons[this.state.config.datasetViewer] ? v_icons[this.state.config.datasetViewer] : defaultViewIcon) : defaultViewIcon;
        const v_trigger = (
            <span>
                <Icon name={iconC} className="olive" />
            </span>
        );
        let maxOnPage = this.state.config.maxNumberOfResourcesOnPage;
        if(!maxOnPage){
            maxOnPage = 20;
        }
        let datasetURI = this.props.datasetURI;
        let i, startI, totalPages, threshold = this.props.threshold, currentPage, pageList = [];
        if(this.props.total){
            currentPage = parseInt(this.props.currentPage);
            //total number of pages
            totalPages = Math.ceil(this.props.total / maxOnPage);
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
        }
        return (
            <div>
                <div className="ui bottom attached compact secondary menu" ref="datasetPager">
                    <div className="left menu">
                        <div className='item'>
                            {this.state.showAll ?
                                ''
                                :
                                <span>{totalPages} Page(s): {pageList} &nbsp;</span>
                            }
                            {totalPages > 1 && this.props.total<= 10000 ?
                                <a className={'ui icon mini button ' + (this.state.showAll ? 'blue': 'basic')} onClick={this.onShowAllClick.bind(this)}>
                                    {this.state.showAll ? 'go back to pagination' : 'show all'}
                                </a>
                                :
                                ''
                            }
                        </div>
                    </div>
                    <div className="right menu">
                        <div className="item" title="actions">
                            <Dropdown selectOnBlur={false} onChange={this.handleDropDownClick.bind(this)} trigger={v_trigger} options={v_options} icon={null} floating />
                        </div>
                        <a className='ui icon mini basic button right floated item ' onClick={this.onSearchClick.bind(this)}>
                            <i className='ui icon orange search'></i>
                        </a>
                        {this.props.onExpandCollapse ?
                            <a className='ui icon mini basic button right floated item ' onClick={this.props.onExpandCollapse.bind(this)}>
                                <i className='ui icon expand'></i>
                            </a>
                            : ''}
                    </div>
                </div>
                {!this.state.searchMode ? '' :
                    <div className="ui secondary segment bottom attached animated slideInDown">
                        <div className="ui icon input fluid">
                            <input ref="searchInput" type="text" placeholder="Search in resources..." value={this.state.searchTerm} onChange={this.handleSearchChange.bind(this)} onKeyDown={this.handleSearchKeyDown.bind(this)}/>
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
