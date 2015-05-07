import React from 'react';
import {provideContext} from 'fluxible/addons';
import lookupDBpedia from '../actions/lookupDBpedia';
import DBpediaStore from '../stores/DBpediaStore';
import {connectToStores} from 'fluxible/addons';

class DBpediaInput extends React.Component {
    constructor(props) {
        super(props);
        let v = this.props.spec.value;
        if(this.props.spec.isDefault){
            v = this.createDefaultValue(this.props.spec.valueType, this.props.spec.dataType);
        }
        //to initialize value in Property state
        this.props.onDataEdit(v);
        this.state = {value: v};
    }
    componentDidMount() {
        if(!this.props.noFocus){
            React.findDOMNode(this.refs.basicIndividualInput).focus();
        }
    }
    handleKeyDown(evt) {
        if(this.props.allowActionByKey){
            switch (evt.keyCode) {
                //case 9: // Tab
                case 13: // Enter
                    this.props.onEnterPress();
                    break;
            }
        }
    }
    getRandomNumber() {
        return Math.round(+new Date() / 1000);
    }
    createDefaultValue(valueType, dataType) {
        return '';
    }
    addSuggestion(uri) {
        let self = this;
        this.props.onDataEdit(uri);
        //simulate pressing enter
        setTimeout(function(){
            self.props.onEnterPress();
        }, 150);

    }
    handleChange(event) {
        let currentComp = this.refs.dbpediaLookup.getDOMNode();
        let term = event.target.value;
        this.setState({value: term});
        this.props.onDataEdit(term);

        //handle autocomplete here
        if(term.length>2){
            /*global $*/
            $(currentComp).find('.transition').addClass('visible');
            this.context.executeAction(lookupDBpedia, {
            query: term
          });
        }else{
            /*global $*/
            $(currentComp).find('.transition').removeClass('visible');
            this.props.DBpediaStore.suggestions = [];
        }
    }
    render() {
        let self = this;
        let placeHolder = ' Search and choose from DBpedia';
        if(this.props.asWikipedia){
            placeHolder = ' Search and choose from Wikipedia';
        }
        let suggestions = this.props.DBpediaStore.suggestions.map(function(node, index) {
            return (
                <a className="result" key={'suggestion_'+index} onClick={self.addSuggestion.bind(self, node.uri)}>
                  <div className="content">
                    <div className="title">{node.title}</div>
                    <div className="description">{node.description}</div>
                  </div>
                </a>
            );
        });
        return (
            <div className="ui fluid search left icon input" ref="dbpediaLookup">
                <input ref="basicIndividualInput" type="text" placeholder={placeHolder} value={this.state.value} onChange={this.handleChange.bind(this)} onKeyDown={this.handleKeyDown.bind(this)}/>
                <i className="search icon"></i>
                <div className="transition results"> {suggestions} </div>
            </div>
        );
    }
}
DBpediaInput.contextTypes = {
    executeAction: React.PropTypes.func.isRequired
};
DBpediaInput = connectToStores(DBpediaInput, [DBpediaStore], function (stores, props) {
    return {
        DBpediaStore: stores.DBpediaStore.getState()
    };
});
export default DBpediaInput;
