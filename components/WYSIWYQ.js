import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';;
import {connectToStores} from 'fluxible-addons-react';
import QueryImportStore from '../stores/QueryImportStore';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableQuerySaveImport} from '../configs/general';
import {checkViewAccess, checkEditAccess} from '../services/utils/accessManagement';
import { Dropdown, Button, Divider, Form, Progress } from 'semantic-ui-react';
import YASQEViewer from '../components/object/viewer/individual/YASQEViewer';
import WaitAMoment from './WaitAMoment';

class WYSIWYQ extends React.Component {
    constructor(props){
        super(props);
        this.state = {stateURI: '', isGenerating: 0};
    }
    componentDidMount() {

    }
    componentDidUpdate() {

    }
    handleWYSIWYQ() {
        let id = this.state.stateURI;
        let page = this.props.QueryImportStore.queries[id].page;
        let selection = this.props.QueryImportStore.queries[id].selection[0];
        let dataset = this.props.QueryImportStore.queries[id].dataset[0];
        this.setState({isGenerating: 1});
        if(selection === 'undefined'){
            this.context.executeAction(navigateAction, {
                url: '/dataset/'+page+'/'+encodeURIComponent(dataset)
            });
        }else{
            window.location = '/browse/'+encodeURIComponent(dataset)+'/'+encodeURIComponent(id);
            /* the following code doesn't run the preparation action before component mount
            this.context.executeAction(navigateAction, {
                url: '/browse/'+encodeURIComponent(dataset)+'/'+encodeURIComponent(id)
            });
            */
        }

    }
    compare(a, b) {
        let aD = new Date(a.createdOn[0]);
        let bD = new Date(b.createdOn[0]);
        if (aD > bD) {
            return -1;
        }
        if (aD < bD) {
            return 1;
        }
        // names must be equal
        return 0;
    }
    handleChange(e, {value}){
        this.setState({stateURI: value});
    }
    render() {
        let dss = [];
        //convert object to array
        for(let prop in this.props.QueryImportStore.queries){
            this.props.QueryImportStore.queries[prop].id = prop;
            dss.push(this.props.QueryImportStore.queries[prop]);
        }
        let optionsList;
        user = this.context.getUser();
        //only admin can change the random new dataset!
        if (!enableAuthentication || parseInt(user.isSuperUser)) {
            allowChangingNewDataset = true;
        }
        let tmpOption = '';
        let self = this, errorDIV='', formDIV='';
        let user;
        let allowChangingNewDataset= false;
        dss.sort(this.compare);
        let dss_options = [];
        dss.forEach((option, index)=> {
            dss_options.push({ key: index, value: option.id, text: '['+option.createdOn[0].split('.')[0].replace('T', ' ')+'] '+ option.label[0]});
        });
        let queryDIV = '';
        if(this.state.stateURI){
            queryDIV = <div className= "ui tertiary segment">
                <YASQEViewer spec={{value: decodeURIComponent(this.props.QueryImportStore.queries[this.state.stateURI].resourceQuery)}} />
            </div>;
        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="WYSIWYQ">
                <div className="ui grid">
                    {this.state.isGenerating ?
                        <div className="ui column">
                            <WaitAMoment msg='Wait a moment until the browsing environment is generated...'/>
                            <div className="ui info message"><b>Query:</b> {this.props.QueryImportStore.queries[this.state.stateURI].label}</div>
                            {queryDIV}
                        </div>
                        :
                        <div className="ui column">
                            <h2>Import an Existing Query</h2>
                            {dss.length ?
                                <Form size='big'>
                                    <Dropdown onChange={this.handleChange.bind(this)} placeholder='Select a Query' fluid search selection options={dss_options} />
                                    {queryDIV}
                                    <Divider hidden />
                                    {this.state.stateURI ? <div className='ui big blue button' onClick={this.handleWYSIWYQ.bind(this)}>Turn Query to UI</div> : null}
                                    <Divider hidden />
                                </Form>
                                :
                                <div className="ui warning message">No query was found!</div>
                            }
                        </div>
                    }

                </div>
            </div>
        );
    }
}
WYSIWYQ.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
WYSIWYQ = connectToStores(WYSIWYQ, [QueryImportStore], function (context, props) {
    return {
        QueryImportStore: context.getStore(QueryImportStore).getState()
    };
});
export default WYSIWYQ;
