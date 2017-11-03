import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';;
import {connectToStores} from 'fluxible-addons-react';
import QueryImportStore from '../stores/QueryImportStore';
import {navigateAction} from 'fluxible-router';
import {enableAuthentication, enableQuerySaveImport} from '../configs/general';
import {checkViewAccess, checkEditAccess} from '../services/utils/accessManagement';
import { Button, Divider, Form, Progress } from 'semantic-ui-react';
import YASQEViewer from '../components/object/viewer/individual/YASQEViewer';

class WYSIWYQ extends React.Component {
    constructor(props){
        super(props);
        this.state = {stateURI: ''};
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
        if(selection === 'undefined'){
            this.context.executeAction(navigateAction, {
                url: '/dataset/'+page+'/'+encodeURIComponent(dataset)
            });
        }else{

        }

    }
    compare(a, b) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        // names must be equal
        return 0;
    }
    handleChange(element, e){
        if(element=== 'stateURI'){
            if(e.target.value){
                this.setState({stateURI: e.target.value.trim()});
            }else{
                this.setState({stateURI: ''});
            }
        }
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
        optionsList = dss.map(function(option, index) {
            return <option key={index} value={(option.id)}> {option.label} </option>;
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
                    <div className="ui column">
                        <h2>Import an Existing Query</h2>
                        <Form size='big'>
                            <select ref="stateURI" className="ui search dropdown" onChange={this.handleChange.bind(this, 'stateURI')}>
                                <option value={''}> Select a Query </option>
                                {optionsList}
                            </select>
                            {queryDIV}
                            <Divider hidden />
                            {this.state.stateURI ? <div className='ui big blue button' onClick={this.handleWYSIWYQ.bind(this)}>Turn Query to UI</div> : null}
                            <Divider hidden />
                        </Form>
                    </div>
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
