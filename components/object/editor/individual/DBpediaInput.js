import React from 'react';
import ReactDOM from 'react-dom';
import {provideContext, connectToStores} from 'fluxible-addons-react';
import lookupDBpedia from '../../../../actions/lookupDBpedia';
import DBpediaStore from '../../../../stores/DBpediaStore';

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
            ReactDOM.findDOMNode(this.refs.basicIndividualInput).focus();
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
        if(this.props.config && this.props.config.defaultValue){
            return this.props.config.defaultValue[0];
        }else{
            return '';
        }
    }
    addSuggestion(uri) {
        let self = this;
        this.setState({value: uri});
        this.emptySuggesstions();
        this.props.onDataEdit(uri);
        //simulate pressing enter
        setTimeout(function(){
            self.props.onEnterPress();
        }, 150);

    }
    emptySuggesstions() {
        let currentComp = this.refs.dbpediaLookup;
        /*global $*/
        $(currentComp).find('.transition').removeClass('visible');
        this.props.DBpediaStore.suggestions = [];
    }
    handleChange(event) {
        let term = event.target.value;
        let currentComp = this.refs.dbpediaLookup;
        this.setState({value: term});
        this.props.onDataEdit(term);
        //handle autocomplete here
        if(term.length > 2){
            /*global $*/
            $(currentComp).find('.transition').addClass('visible');
            this.context.executeAction(lookupDBpedia, {
            query: term,
            lookupClass: this.props.config ? (this.props.config.lookupClass ? this.props.config.lookupClass : '') : ''
          });
        }else{
            this.emptySuggesstions();
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
                <a className="result" key={'suggestion_' + index} onClick={self.addSuggestion.bind(self, node.uri)}>
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
DBpediaInput = connectToStores(DBpediaInput, [DBpediaStore], function (context, props) {
    return {
        DBpediaStore: context.getStore(DBpediaStore).getState()
    };
});
export default DBpediaInput;
