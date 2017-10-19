import React from 'react';
import PropTypes from 'prop-types';
import {list} from '../../../../data/ISO3166_1_alpha2';
/**
Display the country codes based on ISO3166_1_alpha2.
*/
class TwoLetterCountryView extends React.Component {
    getCountry(code) {
        if(list[code]){
            return list[code];
        }else{
            return code;
        }
    }
    prepareCountry(code){
        return this.getCountry(code);
    }
    render() {
        let outputDIV, country;
        country = this.prepareCountry(this.props.spec.value);
        outputDIV = <a href={'http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#'+this.props.spec.value} target="_blank" itemProp={this.props.property}> {country} </a>
        return (
            <div className="ui" ref="twoLetterCountryView">
                {outputDIV}
            </div>
        );
    }
}
TwoLetterCountryView.propTypes = {
    /**
    LD-R spec
    */
    spec: PropTypes.object
};
export default TwoLetterCountryView;
