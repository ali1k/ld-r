import React from 'react';
import {NavLink} from 'fluxible-router';
//import ReactDOM from 'react-dom';

class ResourceListPager extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchTerm: '', searchMode: 0};
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
    onSearchClick(){
        this.setState({searchMode: !this.state.searchMode});
    }
    handleSearchChange(evt) {
        this.setState({searchTerm: evt.target.value});
    }
    handleSearchKeyDown(evt) {
        switch (evt.keyCode) {
            //case 9: // Tab
            case 13: // Enter

                break;
        }
    }
    render() {
        let self = this;
        let maxOnPage = this.props.maxNumberOfResourcesOnPage;
        if(!maxOnPage){
            maxOnPage = 20;
        }
        let datasetURI = this.props.datasetURI;
        let i, startI, totalPages, threshold = this.props.threshold, currentPage, pageList = [];
        if(this.props.total){
            currentPage = parseInt(this.props.currentPage);
            //total number of pages
            totalPages = Math.ceil(this.props.total / maxOnPage);
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
            <div className="ui" ref="resourceListPager">
                {totalPages} Page(s): <span>{pageList}</span>
                {this.props.onExpandCollapse ?
                    <a className='ui icon mini basic button right floated' onClick={this.props.onExpandCollapse.bind(this)}>
                        <i className='ui icon expand'></i>
                    </a>
                : ''}
                <a className='ui icon mini basic button right floated' onClick={this.onSearchClick.bind(this)}>
                    <i className='ui icon orange search'></i>
                </a>
                {!this.state.searchMode ? '' :
                    <div className="ui secondary segment animated slideInDown">
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
export default ResourceListPager;
