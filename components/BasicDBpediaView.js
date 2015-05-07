import React from 'react';

class BasicDBpediaView extends React.Component {
    getTitlefromURI(uri) {
        if(uri){
            var tmp = uri.split('/');
            return tmp[tmp.length-1];
        }
    }
    getWikipediaURI(uri){
        return 'http://en.wikipedia.org/wiki/'+this.getTitlefromURI(uri);
    }
    render() {
        let label, link, outputDIV;
        if(this.props.spec.valueType === 'uri'){
            label = '<' + this.getTitlefromURI(this.props.spec.value) + '>';
            link = this.props.spec.value;
            if(this.props.asWikipedia){
                link = this.getWikipediaURI(this.props.spec.value);
            }
            outputDIV = <a href={link} target="_blank"> {label} </a>;
        }else{
            label = this.props.spec.value;
            outputDIV = <span> {label} </span>;
        }
        return (
            <div className="ui" ref="basicDBpediaView">
                {outputDIV}
            </div>
        );
    }
}

export default BasicDBpediaView;
