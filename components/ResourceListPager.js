import React from 'react';
import {maxNumberOfResourcesOnPage} from '../configs/reactor';
import {NavLink} from 'fluxible-router';
let maxOnPage = maxNumberOfResourcesOnPage;
if(!maxOnPage){
    maxOnPage = 20;
}
class ResourceListPager extends React.Component {
    componentDidMount() {
    }
    buildLink(page, color, icon) {
        let p = page;
        if(p <= 0){
            p = 1;
        }
        if(this.props.handleClick){
            return (
            <a onClick={this.props.handleClick.bind(this, p)} key={page} className={'ui ' + color + ' label'}> {icon ? <i className={icon}></i> : <span>{page}</span>} </a>
            );
        }else{
            return (
                <NavLink key={page} routeName="dataset" className={'ui ' + color + ' label'} href={'/dataset/' + p + '/' + encodeURIComponent(this.props.graphName)}> {icon ? <i className={icon}></i> : <span>{page}</span>} </NavLink>
            );
        }
    }
    render() {
        let self = this;
        let graphName = this.props.graphName;
        let i, startI, totalPages, threshold = this.props.threshold, currentPage, pageList = [];
        if(this.props.total){
            currentPage = parseInt(this.props.currentPage);
            //total number of pages
            totalPages = Math.ceil(this.props.total / maxOnPage);
            if(totalPages > threshold){
                //first page
                pageList.push(self.buildLink(0, 'purple', 'step backward icon'));
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
                pageList.push(self.buildLink(totalPages, 'purple', 'step forward icon'));
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
            </div>
        );
    }
}
ResourceListPager.contextTypes = {
    getUser: React.PropTypes.func
};

export default ResourceListPager;
