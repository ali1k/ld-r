import React from 'react';
import {maxNumberOfResourcesOnPage} from '../configs/reactor';
import {NavLink} from 'fluxible-router';

class ResourceListPager extends React.Component {
    componentDidMount() {
    }
    buildLink(page, color, icon) {
        if(this.props.handleClick){
            return (
            <a onClick={this.props.handleClick.bind(this, page)} key={page} className={'ui ' + color + ' label'}> {icon ? <i className={icon}></i> : {page}} </a>
            );
        }else{
            return (
                <NavLink key={page} routeName="dataset" className={'ui ' + color + ' label'} href={'/dataset/' + page + '/' + encodeURIComponent(this.props.graphName)}> {icon ? <i className={icon}></i> : {page}} </NavLink>
            );
        }
    }
    render() {
        let self = this;
        let graphName = this.props.graphName;
        let i, startI, totalPages, threshold = this.props.threshold, currentPage, pageList = [];
        let firstPage, lastPage;
        if(this.props.total){
            currentPage = parseInt(this.props.currentPage);
            //total number of pages
            totalPages = Math.ceil(this.props.total / maxNumberOfResourcesOnPage);
            if(totalPages > threshold){
                firstPage = self.buildLink(1, 'purple', 'step backward icon');
                lastPage = self.buildLink(totalPages, 'purple', 'step forward icon');
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
                {totalPages} Page(s): {firstPage} {pageList} {lastPage}
            </div>
        );
    }
}
ResourceListPager.contextTypes = {
    getUser: React.PropTypes.func
};

export default ResourceListPager;
