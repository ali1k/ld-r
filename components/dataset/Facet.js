import React from 'react';
import PropertyHeader from '../property/PropertyHeader';
import ObjectBrowser from '../object/ObjectBrowser';
import SearchInput from 'react-search-input';
import URIUtil from '../utils/URIUtil';

class Facet extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchTerm: '', expanded: 0, verticalResized: 0};
    }
    checkItem(status, value) {
        this.props.onCheck(status, value, this.props.spec.propertyURI);
    }
    handleToggleExpand() {
        this.setState({expanded: !this.state.expanded});
        this.props.toggleExpandFacet(this.props.spec.propertyURI);
    }
    handleToggleVerticalResize() {
        this.setState({verticalResized: !this.state.verticalResized});
    }
    //used for custom sorting
    compare(a, b) {
        return (parseInt(b.total) - parseInt(a.total));
    }
    //filter content
    searchUpdated(term) {
        this.setState({searchTerm: term}); // needed to force re-render
    }
    createSelecedList(){
        let out = '';
        let selected = [];
        if(this.props.selection && this.props.selection[this.props.spec.propertyURI] && this.props.selection[this.props.spec.propertyURI].length){
            this.props.selection[this.props.spec.propertyURI].forEach((item)=>{
                selected.push(URIUtil.getURILabel(item.value));
            });
            out = selected.join(',');
            return out;
        }else{
            return out;
        }
    }
    addCommas(n){
        let rx = /(\d+)(\d{3})/;
        return String(n).replace(/^\d+/, function(w){
            while(rx.test(w)){
                w = w.replace(rx, '$1,$2');
            }
            return w;
        });
    }
    render() {
        let self = this;
        let contentClasses = 'content', extraContentClasses='extra content', cardClasses = 'ui segment ' + (this.props.color ? this.props.color : 'blue');
        if(this.state.verticalResized){
            contentClasses = contentClasses + ' hide-element';
            extraContentClasses = extraContentClasses + ' hide-element';
        }
        let descStyle = {
            minHeight: this.props.minHeight ? this.props.minHeight : 80,
            maxHeight: this.props.maxHeight ? this.props.maxHeight : 200,
            position: 'relative',
            overflow: 'auto'
        };
        //order by total count: for performance is done on client-side
        if(self.props.spec.propertyURI){
            this.props.spec.instances.sort(this.compare);
        }
        let newSpec = {};
        let cloneInstances = this.props.spec.instances.slice(0);
        newSpec.property = this.props.spec.property;
        newSpec.propertyURI = this.props.spec.propertyURI;
        if (this.refs.search) {
            let filters = ['label', 'value'];
            cloneInstances = cloneInstances.filter(this.refs.search.filter(filters));
        }
        newSpec.instances = cloneInstances;
        return (
            <div className={cardClasses} ref="facet">
                {this.state.verticalResized ?
                    <div className="ui horizontal list">
                        <div className="item">
                            <PropertyHeader spec={{property: this.props.spec.property, propertyURI: this.props.spec.propertyURI}} config={this.props.config} size="3" />
                        </div>
                        <div className="item">
                            {this.createSelecedList()}
                            <a className='ui icon mini basic button right floated' onClick={this.handleToggleVerticalResize.bind(this)}>
                                <i className='ui icon resize vertical'></i>
                            </a>
                        </div>
                    </div>
                : ''
                }
                <div className={contentClasses}>
                     {!this.props.spec.propertyURI ? '' :
                         <span className="ui teal ribbon label" title="number of items listed in this facet">{this.addCommas(cloneInstances.length)}</span>
                     }
                    <div className="ui horizontal list">
                        <div className="item">
                            <PropertyHeader spec={{property: this.props.spec.property, propertyURI: this.props.spec.propertyURI}} config={this.props.config} size="3" />
                        </div>
                        <div className="item">
                            {this.createSelecedList()}
                        </div>
                    </div>
                    <div className="meta">
                    </div>
                    <div className="description">
                        <div className="ui form" style={descStyle}>
                            <ObjectBrowser expanded={this.state.expanded} selection={this.props.selection} shortenURI={true} spec={newSpec} config={this.props.config} onSelect={this.checkItem.bind(this)} datasetURI={this.props.datasetURI}/>
                        </div>
                    </div>
                  </div>
                  <br/>
                  <div className={extraContentClasses}>
                      <div className="ui tag horizontal labels">
                          <SearchInput className="ui mini search icon input" ref="search" onChange={this.searchUpdated.bind(this)} throttle={500}/>
                          {this.props.spec.property ?
                              <a className='ui icon mini basic button right floated' onClick={this.handleToggleExpand.bind(this)}>
                                  <i className='ui icon expand'></i>
                              </a>
                          : ''
                          }
                          {this.props.spec.property ?
                              <a className='ui icon mini basic button right floated' onClick={this.handleToggleVerticalResize.bind(this)}>
                                  <i className='ui icon resize vertical'></i>
                              </a>
                          : ''
                          }
                      </div>

                  </div>
            </div>
        );
    }
}

export default Facet;
