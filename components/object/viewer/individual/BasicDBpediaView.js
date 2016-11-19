import React from 'react';
/**
display DBpedia resources
*/
class BasicDBpediaView extends React.Component {
    getTitlefromURI(uri) {
        if(uri){
            var tmp = uri.split('/');
            return tmp[tmp.length - 1];
        }
    }
    getWikipediaURI(uri){
        return 'http://en.wikipedia.org/wiki/' + this.getTitlefromURI(uri);
    }
    isDBpediaURI(uri){
        if(uri.search('dbpedia.org') !== -1){
            return true;
        }else{
            return false;
        }
    }
    isHTTPURI(uri){
        if(uri.search('http://') !== -1){
            return true;
        }else{
            return false;
        }
    }
    render() {
        let label, link, outputDIV;
        label = this.props.spec.value;
        outputDIV = <span> {label} </span>;
        if(this.props.spec.valueType === 'uri'){
            link = this.props.spec.value;
            if(this.isDBpediaURI(this.props.spec.value)){
                label = '<' + this.getTitlefromURI(this.props.spec.value) + '>';
                if(this.props.config.asWikipedia || this.props.asWikipedia){
                    link = this.getWikipediaURI(this.props.spec.value);
                }
            }
            if(this.isHTTPURI(this.props.spec.value)){
                outputDIV = <a href={link} target="_blank"> {label} </a>;
            }
        }
        return (
            <div className="ui" ref="basicDBpediaView">
                {outputDIV}
            </div>
        );
    }
}
BasicDBpediaView.propTypes = {
    /**
    display wikipedia page URI instead of DBpedia one
    */
    asWikipedia: React.PropTypes.bool,
    /**
    LD-R Configurations object
    */
    config: React.PropTypes.object,
    /**
    LD-R spec
    */
    spec: React.PropTypes.object
};
export default BasicDBpediaView;
