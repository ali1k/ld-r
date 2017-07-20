'use strict';
var React = require('react');
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {navigateAction} from 'fluxible-router';
import { Button, Divider, Form } from 'semantic-ui-react';
import PrefixBasedInput from './object/editor/individual/PrefixBasedInput';
import prepareFacetsFromQueryAPI from '../actions/prepareFacetsFromQueryAPI';

class WYSIWYQ extends React.Component {
    constructor(props){
        super(props);
        this.state = {resource: ''};
    }
    handleResourceURIChange(val){
        this.setState({resource: val.trim()});
    }
    handleForm() {
        let queryUri = this.state.resource;
        this.context.executeAction(prepareFacetsFromQueryAPI, {
            apiFlag: queryUri,
            redirect: 1
        });
    }
    render() {
        const exampleQueryURIs = [
            {'title': 'https://raw.githubusercontent.com/ali1k/wysiwyq/master/exampleQueries/example1.rq'}
        ]
        return (
            <div className="ui fluid container ldr-padding" ref="WYSIWYQ">
                <div className="ui grid">
                    <div className="ui row">
                        <div className="column">
                            <div className="ui segment content">
                                <h2 className="ui header">WYSIWYQ: What You See Is What You Query</h2>
                                <Form size='big'>
                                    <PrefixBasedInput autocompletelist={exampleQueryURIs} spec={{value:''}} onDataEdit={this.handleResourceURIChange.bind(this)} placeholder="URI of the grlc query on Github" allowActionByKey={false}/>
                                    <Divider hidden />
                                    <div className='ui big blue button' onClick={this.handleForm.bind(this)}>Build UI</div>
                                    <Divider hidden />
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
WYSIWYQ.contextTypes = {
    executeAction: PropTypes.func.isRequired
};
module.exports = WYSIWYQ;
