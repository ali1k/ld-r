class URIUtil{
    static getURILabel(uri) {
        let property = '';
        let tmp = uri;
        let tmp2 = tmp.split('#');
        if(tmp2.length > 1){
            property = tmp2[1];
        }else{
            tmp2 = tmp.split('/');
            property = tmp2[tmp2.length - 1];
            tmp2 = property.split(':');
            property = tmp2[tmp2.length - 1];
        }
        if(!property){
            property = uri;
        }
        return property;
    }
    static truncateMiddle(fullStr, strLen, separator){
        if (fullStr.length <= strLen) return fullStr;

        separator = separator || '...';

        let sepLen = separator.length,
            charsToShow = strLen - sepLen,
            frontChars = Math.ceil(charsToShow/2),
            backChars = Math.floor(charsToShow/2);

        return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    }
}
export default URIUtil;
